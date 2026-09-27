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

  let idCounter = 13000;
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

  console.log('Logging in with proper setters...');
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

  for (let i = 0; i < 40; i++) {
    const p = await evaluate('window.location.pathname');
    if (p === '/admin') break;
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Path after login:', await evaluate('window.location.pathname'));
  await new Promise(r => setTimeout(r, 1500));

  // Navigate to /admin/gallery/new
  console.log('Navigating to /admin/gallery/new...');
  await evaluate(`(() => {
    // Click Link or router push
    window.location.href = '/admin/gallery/new';
  })()`);

  for (let i = 0; i < 40; i++) {
    const p = await evaluate('window.location.pathname');
    if (p === '/admin/gallery/new') break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 2000));
  console.log('At path:', await evaluate('window.location.pathname'));

  // Test form submit directly via fetch inside the authenticated page
  const testRes = await evaluate(`(async () => {
    const proj = {
      name: 'Real Test Project ' + Date.now(),
      description: 'Testing post-submit behavior directly',
      category: 'Web',
      screenshot_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      live_link_url: 'https://example.com'
    };

    console.log('Calling POST /api/admin/gallery...');
    const t0 = performance.now();
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proj)
    });
    const duration = performance.now() - t0;
    const json = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      durationMs: duration,
      json
    };
  })()`);

  console.log('Submit result:', JSON.stringify(testRes, null, 2));

  ws.close();
  edge.kill();
}

run().catch(console.error);
