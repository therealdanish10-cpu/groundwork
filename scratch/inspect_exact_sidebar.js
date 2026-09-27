const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--window-size=1440,900'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  function getPageTarget() {
    return new Promise((resolve) => {
      function check() {
        http.get('http://127.0.0.1:9222/json', (res) => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => {
            try {
              const targets = JSON.parse(raw);
              const p = targets.find(t => t.type === 'page');
              if (p) return resolve(p);
            } catch(e){}
            setTimeout(check, 300);
          });
        }).on('error', () => setTimeout(check, 300));
      }
      check();
    });
  }

  const pageTarget = await getPageTarget();
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 6000;
  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++idCounter;
      function handler(event) {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      }
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('Runtime.enable');

  function navigate(url) {
    return new Promise((resolve) => {
      function handler(event) {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', handler);
          resolve();
        }
      }
      ws.addEventListener('message', handler);
      sendCommand('Page.navigate', { url });
    });
  }

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  // Login
  await navigate('http://localhost:3000/login');
  await new Promise(r => setTimeout(r, 1000));

  await evaluate(`(() => {
    const email = document.querySelector('#email');
    const pwd = document.querySelector('#password');
    const btn = document.querySelector('button[type="submit"]');

    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(email, 'testadmin@trelio.test');
    email.dispatchEvent(new Event('input', { bubbles: true }));

    setter.call(pwd, 'AdminPassword123!');
    pwd.dispatchEvent(new Event('input', { bubbles: true }));

    btn.click();
  })()`);

  // Wait for redirect to /admin
  for (let i = 0; i < 40; i++) {
    const p = await evaluate(`window.location.pathname`);
    if (p === '/admin') break;
    await new Promise(r => setTimeout(r, 200));
  }

  await new Promise(r => setTimeout(r, 2000));

  // Get deep inspection of every element in the first 300px of screen
  const report = await evaluate(`(() => {
    function getDetails(el) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        className: el.className,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        position: style.position,
        zIndex: style.zIndex,
        opacity: style.opacity,
        overflow: style.overflow,
        background: style.backgroundColor,
        text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.textContent.trim() : undefined
      };
    }

    const aside = document.querySelector('aside');
    if (!aside) return 'NO ASIDE';

    // Walk all descendants of aside
    const descendants = Array.from(aside.querySelectorAll('*')).map(getDetails);

    // Also check if any element outside aside is positioned in x < 300
    const nonAsideInLeft = Array.from(document.querySelectorAll('body *'))
      .filter(el => !aside.contains(el) && el !== aside)
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left < 300 && r.top < 600;
      })
      .map(getDetails);

    return {
      aside: getDetails(aside),
      asideHTML: aside.outerHTML.substring(0, 1500),
      descendants: descendants.filter(d => d.rect.height > 0),
      nonAsideInLeft
    };
  })()`);

  console.log('--- ASIDE DETAILS ---');
  console.log(JSON.stringify(report.aside, null, 2));

  console.log('\n--- NON-ASIDE ELEMENTS IN LEFT 300PX ---');
  console.log(JSON.stringify(report.nonAsideInLeft, null, 2));

  console.log('\n--- DESCENDANTS OF ASIDE ---');
  report.descendants.forEach(d => {
    console.log(`${d.tag} .${d.className.slice(0, 40)} | top:${d.rect.top} left:${d.rect.left} w:${d.rect.width} h:${d.rect.height} | pos:${d.position} z:${d.zIndex} text:${d.text || ''}`);
  });

  ws.close();
  edge.kill();
}

run().catch(console.error);
