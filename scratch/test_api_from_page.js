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

  let idCounter = 12000;
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

  // 1. Login
  console.log('Logging in...');
  await navigate('http://localhost:3000/login');
  await new Promise(r => setTimeout(r, 1000));
  await evaluate(`(() => {
    const email = document.querySelector('#email');
    const pwd = document.querySelector('#password');
    const btn = document.querySelector('button[type="submit"]');
    if (email && pwd && btn) {
      email.value = 'testadmin@trelio.test';
      email.dispatchEvent(new Event('input', { bubbles: true }));
      pwd.value = 'AdminPassword123!';
      pwd.dispatchEvent(new Event('input', { bubbles: true }));
      btn.click();
    }
  })()`);

  for (let i = 0; i < 40; i++) {
    const p = await evaluate(`window.location.pathname`);
    if (p === '/admin') break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 1000));

  // Go to gallery new
  await navigate('http://localhost:3000/admin/gallery/new');
  await new Promise(r => setTimeout(r, 2000));

  // Now trigger a submit from inside the page and see exact fetch response and router behavior
  console.log('Triggering submit inside /admin/gallery/new...');
  const result = await evaluate(`(async () => {
    const data = {
      name: 'Verification Project ' + Date.now(),
      category: 'Web',
      description: 'Testing live redirect behavior',
      screenshot_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      live_link_url: 'https://example.com'
    };

    console.log('Posting to /api/admin/gallery...');
    const t0 = performance.now();
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const tFetch = performance.now() - t0;
    const body = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      body,
      fetchTimeMs: tFetch
    };
  })()`);

  console.log('Direct API call result from page:', JSON.stringify(result, null, 2));

  ws.close();
  edge.kill();
}

run().catch(console.error);
