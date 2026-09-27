const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

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

  let idCounter = 11000;
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
  await sendCommand('Network.enable');

  const logs = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
  });

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
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(email, 'testadmin@trelio.test');
      email.dispatchEvent(new Event('input', { bubbles: true }));
      setter.call(pwd, 'AdminPassword123!');
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
  console.log('Logged in. At path:', await evaluate('window.location.pathname'));

  // 2. Go to /admin/gallery/new
  console.log('Navigating to /admin/gallery/new...');
  await navigate('http://localhost:3000/admin/gallery/new');
  await new Promise(r => setTimeout(r, 1500));

  // 3. Fill in the form
  console.log('Filling in form...');
  await evaluate(`(() => {
    const nameInput = document.querySelector('#name');
    const descInput = document.querySelector('#description');
    const linkInput = document.querySelector('#live_link_url');
    const imgInput = document.querySelector('#screenshot_url');

    function setVal(el, val) {
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setVal(nameInput, 'Test Project ' + Date.now());
    setVal(descInput, 'A high-performance automated testing project for verification.');
    setVal(linkInput, 'https://example.com');
    setVal(imgInput, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80');
  })()`);

  // 4. Click Publish
  console.log('Submitting form...');
  const t0 = Date.now();
  await evaluate(`(() => {
    const form = document.querySelector('form');
    const btn = form.querySelector('button[type="submit"]');
    btn.click();
  })()`);

  // Monitor path and loading state for 10 seconds
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const status = await evaluate(`(() => {
      const btn = document.querySelector('button[type="submit"]');
      const form = document.querySelector('form');
      const nameVal = document.querySelector('#name')?.value;
      return {
        path: window.location.pathname,
        btnDisabled: btn?.disabled,
        btnText: btn?.textContent?.trim(),
        hasForm: !!form,
        nameVal
      };
    })()`);
    console.log(`t+${((Date.now() - t0)/1000).toFixed(1)}s:`, JSON.stringify(status));
  }

  // Now measure how long /admin dashboard takes to load when navigated to directly or via client link
  console.log('\n--- MEASURING DASHBOARD NAVIGATION ---');
  const tDashStart = Date.now();
  await evaluate(`(() => {
    // Click Dashboard in sidebar
    const dashLink = document.querySelector('aside a[href="/admin"]');
    if (dashLink) dashLink.click();
    else window.location.href = '/admin';
  })()`);

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    const dashStatus = await evaluate(`(() => {
      const h1 = document.querySelector('h1');
      const cards = document.querySelectorAll('.grid > div');
      const skeleton = document.querySelector('.animate-pulse');
      return {
        path: window.location.pathname,
        h1Text: h1?.textContent?.trim(),
        cardsCount: cards.length,
        hasSkeleton: !!skeleton
      };
    })()`);
    console.log(`Dash t+${((Date.now() - tDashStart)/1000).toFixed(2)}s:`, JSON.stringify(dashStatus));
    if (dashStatus.path === '/admin' && dashStatus.cardsCount > 0 && !dashStatus.hasSkeleton) {
      console.log(`DASHBOARD LOADED IN ${((Date.now() - tDashStart)/1000).toFixed(2)}s`);
      break;
    }
  }

  ws.close();
  edge.kill();
}

run().catch(console.error);
