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

  let idCounter = 80000;
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

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', JSON.stringify(msg.params.exceptionDetails));
    }
  });

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('Runtime.enable');

  console.log('Navigating to http://localhost:3000/ ...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 3000));

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

  console.log('Initial page URL:', await evalInPage('window.location.href'));

  console.log('Clicking Work link...');
  await evalInPage(`(() => {
    const link = document.querySelector('.nav-links a[href="/work"]');
    link.click();
  })()`);

  // Observe what happens every 500ms for 5 seconds
  for (let i = 1; i <= 8; i++) {
    await new Promise(r => setTimeout(r, 500));
    const state = await evalInPage(`(() => {
      const nav = document.querySelector('nav#nav');
      const navLinks = document.querySelector('.nav-links');
      const links = navLinks ? Array.from(navLinks.querySelectorAll('a')).map(a => a.innerText + ' (' + a.getAttribute('href') + ')') : null;
      return {
        url: window.location.href,
        navExists: !!nav,
        navVisible: nav ? nav.className : null,
        linksCount: links ? links.length : 0,
        links,
        h1: document.querySelector('h1') ? document.querySelector('h1').innerText : null
      };
    })()`);
    console.log(`State at ${i * 500}ms:`, JSON.stringify(state));
  }

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
