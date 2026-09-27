const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');

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

  let idCounter = 16000;
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

  // 1. Sign In
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
  await new Promise(r => setTimeout(r, 2500));

  // Now go to gallery
  await navigate('http://localhost:3000/admin/gallery');
  await new Promise(r => setTimeout(r, 2000));

  // Now measure client transition to /admin
  console.log('Starting transition to Dashboard...');
  const t0 = Date.now();
  await evaluate(`document.querySelector('aside a[href="/admin"]').click()`);

  let sawSkeleton = false;
  let interactiveTime = 0;

  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 100));
    const data = await evaluate(`(() => {
      const p = window.location.pathname;
      const skel = document.querySelector('.animate-pulse');
      const cards = document.querySelectorAll('.grid > div');
      const metrics = Array.from(document.querySelectorAll('.text-4xl')).map(el => el.textContent.trim());
      return {
        path: p,
        hasSkeleton: !!skel,
        cardsCount: cards.length,
        metrics
      };
    })()`);

    if (data.hasSkeleton) sawSkeleton = true;

    if (data.path === '/admin' && !data.hasSkeleton && data.metrics.length > 0) {
      interactiveTime = Date.now() - t0;
      console.log(`DASHBOARD FULLY LOADED & INTERACTIVE IN ${interactiveTime}ms! Metrics:`, data.metrics);
      break;
    }
  }

  const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snap?.data) {
    fs.writeFileSync(path.join(outDir, 'dashboard_fully_loaded.png'), Buffer.from(snap.data, 'base64'));
    console.log('Saved dashboard_fully_loaded.png');
  }

  ws.close();
  edge.kill();
}

run().catch(console.error);
