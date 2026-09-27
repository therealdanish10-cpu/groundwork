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

  let idCounter = 60000;
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

  console.log('Navigating directly to http://localhost:3000/work...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/work' });
  await new Promise(r => setTimeout(r, 2000));

  async function evalInPage(expr) {
    const res = await sendCommand('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  const diagnosis = await evalInPage(`(() => {
    const nav = document.querySelector('nav#nav');
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
      href: a.getAttribute('href'),
      text: a.innerText.trim(),
      className: a.className,
      parentClass: a.parentElement ? a.parentElement.className : null
    }));

    const navLinksContainer = document.querySelector('.nav-links');
    const linksInNavLinks = navLinksContainer ? Array.from(navLinksContainer.querySelectorAll('a')).map(a => ({
      href: a.getAttribute('href'),
      text: a.innerText.trim(),
      className: a.className
    })) : null;

    return {
      navExists: !!nav,
      navClass: nav ? nav.className : null,
      navLinksContainerExists: !!navLinksContainer,
      linksInNavLinks,
      allLinksCount: allLinks.length,
      sampleLinks: allLinks.slice(0, 15)
    };
  })()`);

  console.log('Result on /work:');
  console.log(JSON.stringify(diagnosis, null, 2));

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
