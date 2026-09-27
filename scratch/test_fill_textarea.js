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

  let idCounter = 15000;
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
  await new Promise(r => setTimeout(r, 1000));

  // 2. Go to /admin/gallery/new
  console.log('2. Navigating to /admin/gallery/new...');
  await navigate('http://localhost:3000/admin/gallery/new');
  await new Promise(r => setTimeout(r, 2000));

  // 3. Fill in the form using focus and CDP insertText
  const projectName = 'Live Deliverable ' + Date.now();
  console.log('3. Filling form with project:', projectName);

  // Focus and insert text for name
  await evaluate(`document.querySelector('#name').focus()`);
  await sendCommand('Input.insertText', { text: projectName });

  // Focus and insert text for live_link
  await evaluate(`document.querySelector('#live_link').focus()`);
  await sendCommand('Input.insertText', { text: 'https://example.com' });

  // Focus and insert text for screenshot url
  await evaluate(`document.querySelector('input[type="url"]').focus()`);
  await sendCommand('Input.insertText', { text: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f' });

  // Focus and insert text for description
  await evaluate(`document.querySelector('#description').focus()`);
  await sendCommand('Input.insertText', { text: 'Verified deliverable with automated end to end testing.' });

  await new Promise(r => setTimeout(r, 500));

  const checkFilled = await evaluate(`(() => {
    return {
      name: document.querySelector('#name').value,
      desc: document.querySelector('#description').value,
      link: document.querySelector('#live_link').value
    };
  })()`);
  console.log('Form values checked:', checkFilled);

  // 4. Click Submit
  console.log('4. Submitting form and measuring redirect...');
  const t0 = Date.now();
  await evaluate(`document.querySelector('button[type="submit"]').click()`);

  // Monitor path
  let redirected = false;
  let redirectTime = 0;
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    const p = await evaluate('window.location.pathname');
    if (p === '/admin/gallery') {
      redirected = true;
      redirectTime = Date.now() - t0;
      console.log(`REDIRECTED TO /admin/gallery in ${redirectTime}ms!`);
      break;
    }
  }

  // Check if gallery page rendered
  await new Promise(r => setTimeout(r, 1500));
  const snapGallery = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snapGallery?.data) {
    fs.writeFileSync(path.join(outDir, 'real_submit_gallery_redirect.png'), Buffer.from(snapGallery.data, 'base64'));
    console.log('Saved real_submit_gallery_redirect.png');
  }

  // 5. Navigate to Dashboard via client-side link and measure
  console.log('\n5. Navigating to Dashboard via client-side link...');
  const tDash = Date.now();
  await evaluate(`document.querySelector('aside a[href="/admin"]').click()`);

  let dashInteractiveTime = 0;
  let sawSkeleton = false;
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    const info = await evaluate(`(() => {
      const p = window.location.pathname;
      const cards = document.querySelectorAll('.grid > div');
      const skeleton = document.querySelector('.animate-pulse');
      return {
        path: p,
        cardsCount: cards.length,
        hasSkeleton: !!skeleton
      };
    })()`);

    if (info.hasSkeleton) sawSkeleton = true;

    if (info.path === '/admin' && info.cardsCount >= 3 && !info.hasSkeleton) {
      dashInteractiveTime = Date.now() - tDash;
      console.log(`DASHBOARD INTERACTIVE IN ${dashInteractiveTime}ms! (sawSkeleton: ${sawSkeleton})`);
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  const snapDash = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snapDash?.data) {
    fs.writeFileSync(path.join(outDir, 'real_dashboard_after_redirect.png'), Buffer.from(snapDash.data, 'base64'));
    console.log('Saved real_dashboard_after_redirect.png');
  }

  console.log('\n=== FINAL VERIFICATION RESULTS ===');
  console.log(`Redirect happened: ${redirected}`);
  console.log(`Redirect time: ${redirectTime}ms`);
  console.log(`Dashboard interactive time: ${dashInteractiveTime}ms`);
  console.log(`Skeleton loading state visible: ${sawSkeleton}`);

  ws.close();
  edge.kill();
}

run().catch(console.error);
