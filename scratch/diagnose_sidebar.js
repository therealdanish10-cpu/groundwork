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

  let idCounter = 5000;
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

  console.log('On /admin, waiting for DOM...');
  await new Promise(r => setTimeout(r, 2500));

  // Inspect ALL elements matching sidebar or containing text "trelio" or "Log Out"
  const inspection = await evaluate(`(() => {
    // Check all elements in left column (x < 300)
    const all = Array.from(document.querySelectorAll('*'));
    const sidebarElements = all.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.left < 300 && r.top < 500;
    });

    const logoutButtons = all.filter(el => el.textContent?.includes('Log Out') || el.innerText?.includes('Log Out'));
    const trelioLogos = all.filter(el => el.getAttribute('alt') === 'Trelio' || el.getAttribute('aria-label') === 'Trelio home');
    const asides = document.querySelectorAll('aside');

    return {
      asidesCount: asides.length,
      asidesInfo: Array.from(asides).map(a => ({
        className: a.className,
        style: a.getAttribute('style'),
        rect: a.getBoundingClientRect(),
        childrenTags: Array.from(a.children).map(c => ({
          tag: c.tagName,
          className: c.className,
          rect: c.getBoundingClientRect(),
          style: c.getAttribute('style')
        }))
      })),
      logoutButtonsCount: logoutButtons.length,
      logoutButtons: logoutButtons.map(b => ({
        tag: b.tagName,
        className: b.className,
        rect: b.getBoundingClientRect(),
        parentTag: b.parentElement?.tagName,
        parentClass: b.parentElement?.className,
        computedStyle: {
          position: window.getComputedStyle(b).position,
          zIndex: window.getComputedStyle(b).zIndex,
          opacity: window.getComputedStyle(b).opacity,
          visibility: window.getComputedStyle(b).visibility,
          color: window.getComputedStyle(b).color
        }
      })),
      trelioLogosCount: trelioLogos.length,
      trelioLogos: trelioLogos.map(img => ({
        tag: img.tagName,
        src: img.getAttribute('src'),
        rect: img.getBoundingClientRect(),
        parentTag: img.parentElement?.tagName,
        parentClass: img.parentElement?.className,
        computedStyle: {
          position: window.getComputedStyle(img).position,
          zIndex: window.getComputedStyle(img).zIndex,
          opacity: window.getComputedStyle(img).opacity,
          display: window.getComputedStyle(img).display
        }
      }))
    };
  })()`);

  console.log('Inspection result:', JSON.stringify(inspection, null, 2));

  ws.close();
  edge.kill();
}

run().catch(console.error);
