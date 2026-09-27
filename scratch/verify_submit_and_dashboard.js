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

  let idCounter = 14000;
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
  console.log('1. Signing in...');
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
  console.log('Signed in. Current path:', await evaluate('window.location.pathname'));
  await new Promise(r => setTimeout(r, 1500));

  // 2. Go to /admin/gallery/new
  console.log('2. Navigating to /admin/gallery/new...');
  await evaluate(`(() => {
    window.location.href = '/admin/gallery/new';
  })()`);

  for (let i = 0; i < 40; i++) {
    const p = await evaluate('window.location.pathname');
    if (p === '/admin/gallery/new') break;
    await new Promise(r => setTimeout(r, 200));
  }
  await new Promise(r => setTimeout(r, 2000));

  // 3. Fill in the form properly
  const projectName = 'Live Verified Project ' + Date.now();
  console.log('3. Filling form with project:', projectName);

  await evaluate(`((name) => {
    function setInputVal(selector, val) {
      const el = document.querySelector(selector);
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setInputVal('#name', name);
    setInputVal('#description', 'This is a verified live project submitted via the new redirect handler.');
    setInputVal('#live_link', 'https://trelio.digital');
    setInputVal('input[type="url"]', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80');
  })('${projectName}')`);

  await new Promise(r => setTimeout(r, 500));

  // 4. Click Submit and measure redirect time
  console.log('4. Submitting form and timing redirect...');
  const tSubmitStart = Date.now();

  await evaluate(`(() => {
    const btn = document.querySelector('button[type="submit"]');
    btn.click();
  })()`);

  // Wait for redirect to /admin/gallery
  let redirected = false;
  let redirectTimeMs = 0;
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    const p = await evaluate('window.location.pathname');
    if (p === '/admin/gallery') {
      redirected = true;
      redirectTimeMs = Date.now() - tSubmitStart;
      break;
    }
  }

  console.log(`Redirect status: redirected=${redirected}, time=${redirectTimeMs}ms`);

  // Wait for the gallery list to render the new item
  await new Promise(r => setTimeout(r, 1500));
  const galleryCheck = await evaluate(`((name) => {
    const rows = Array.from(document.querySelectorAll('tr, .space-y-4 > div'));
    const pageText = document.body.innerText;
    return {
      path: window.location.pathname,
      containsProjectName: pageText.includes(name),
      h1Text: document.querySelector('h1')?.textContent?.trim()
    };
  })('${projectName}')`);
  console.log('Gallery page check:', JSON.stringify(galleryCheck, null, 2));

  // Capture Screenshot of Gallery List after redirect
  const snap1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snap1?.data) {
    fs.writeFileSync(path.join(outDir, 'post_submit_gallery_redirect.png'), Buffer.from(snap1.data, 'base64'));
    console.log('Saved post_submit_gallery_redirect.png');
  }

  // 5. Navigate to Dashboard and time it
  console.log('\n5. Navigating to Dashboard via client-side link...');
  const tDashStart = Date.now();
  let sawSkeleton = false;

  await evaluate(`(() => {
    const link = document.querySelector('aside a[href="/admin"]');
    if (link) link.click();
  })()`);

  let dashInteractiveTimeMs = 0;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 100));
    const status = await evaluate(`(() => {
      const p = window.location.pathname;
      const h1 = document.querySelector('h1');
      const cards = document.querySelectorAll('.grid > div');
      const skeleton = document.querySelector('.animate-pulse');
      return {
        path: p,
        h1Text: h1?.textContent?.trim(),
        hasSkeleton: !!skeleton,
        cardsCount: cards.length
      };
    })()`);

    if (status.hasSkeleton) sawSkeleton = true;

    if (status.path === '/admin' && status.cardsCount >= 3 && !status.hasSkeleton) {
      dashInteractiveTimeMs = Date.now() - tDashStart;
      console.log(`Dashboard became interactive at ${dashInteractiveTimeMs}ms (sawSkeleton: ${sawSkeleton})`);
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  const dashSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (dashSnap?.data) {
    fs.writeFileSync(path.join(outDir, 'dashboard_after_redirect.png'), Buffer.from(dashSnap.data, 'base64'));
    console.log('Saved dashboard_after_redirect.png');
  }

  console.log('\n--- TIMING SUMMARY ---');
  console.log(`Submit-to-redirect time: ${redirectTimeMs}ms`);
  console.log(`Dashboard interactive time: ${dashInteractiveTimeMs}ms`);
  console.log(`Skeleton loading state visible: ${sawSkeleton}`);

  ws.close();
  edge.kill();
}

run().catch(console.error);
