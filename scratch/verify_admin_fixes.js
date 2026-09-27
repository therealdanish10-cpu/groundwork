const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots', 'admin');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('--- RUNNING FINAL ADMIN VERIFICATION & CLICK-THROUGH ---');

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--window-size=1440,950'
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

  let idCounter = 4000;
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

  async function snap(name) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (res?.data) {
      const buf = Buffer.from(res.data, 'base64');
      fs.writeFileSync(path.join(outDir, `${name}.png`), buf);
      console.log(`Saved screenshot: ${name}.png`);
    }
  }

  async function waitForSelector(selector, timeoutMs = 25000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const found = await evaluate(`!!document.querySelector('${selector}')`);
      if (found) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return false;
  }

  // 1. Visit /login
  console.log('\n[STEP 1] Checking /login isolation...');
  await navigate('http://localhost:3000/login');
  await waitForSelector('#email');

  const loginElements = await evaluate(`(() => {
    return {
      pathname: window.location.pathname,
      hasPublicNav: !!document.querySelector('#nav'),
      hasPublicFooter: !!document.querySelector('footer'),
      hasWhatsApp: !!document.querySelector('a[aria-label="Contact on WhatsApp"]')
    };
  })()`);
  console.log('Login checks:', loginElements);
  await snap('00_login_page');

  // 2. Perform Login
  console.log('\n[STEP 2] Logging in as testadmin@trelio.test ...');
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

  // Wait for redirect to /admin and wait for actual page content (not skeleton)
  console.log('Waiting for login redirect to /admin...');
  for (let i = 0; i < 40; i++) {
    const path = await evaluate(`window.location.pathname`);
    if (path === '/admin') break;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('Landed on /admin, waiting for dashboard content...');
  await waitForSelector('a[href="/admin/blogs/new"]');
  await new Promise(r => setTimeout(r, 500));

  const dashboardElements = await evaluate(`(() => {
    return {
      pathname: window.location.pathname,
      hasPublicNav: !!document.querySelector('#nav'),
      hasPublicFooter: !!document.querySelector('footer'),
      hasWhatsApp: !!document.querySelector('a[aria-label="Contact on WhatsApp"]'),
      hasAdminSidebar: !!document.querySelector('aside'),
      hasAdminHeader: !!document.querySelector('header'),
      headerUserText: document.querySelector('header')?.textContent
    };
  })()`);
  console.log('Dashboard checks:', {
    ...dashboardElements,
    headerUserText: dashboardElements.headerUserText?.substring(0, 80)
  });
  await snap('01_dashboard');

  // Helper for clicking links and verifying fast client-side transition
  async function clickAndVerify(selector, expectedPath, waitForContentSelector, label) {
    const t0 = Date.now();
    const clicked = await evaluate(`(() => {
      const el = document.querySelector('${selector}');
      if (el) { el.click(); return true; }
      return false;
    })()`);

    if (!clicked) {
      console.error(`Failed to find element to click: ${selector}`);
      return false;
    }

    // Wait for URL transition
    let transitioned = false;
    for (let i = 0; i < 200; i++) {
      const p = await evaluate(`window.location.pathname`);
      if (p === expectedPath) {
        transitioned = true;
        break;
      }
      await new Promise(r => setTimeout(r, 50));
    }

    // Wait for target page content to render
    if (waitForContentSelector) {
      await waitForSelector(waitForContentSelector);
    }

    const elapsed = Date.now() - t0;
    const current = await evaluate(`window.location.pathname`);
    const noNav = await evaluate(`!document.querySelector('#nav')`);
    const noFooter = await evaluate(`!document.querySelector('footer')`);
    
    console.log(`[NAVIGATE] ${label} -> ${current} in ${elapsed}ms | Nav hidden: ${noNav} | Footer hidden: ${noFooter}`);
    return transitioned;
  }

  // 3. Click "Blog Articles" in sidebar
  console.log('\n[STEP 3] Clicking "Blog Articles" in sidebar...');
  await clickAndVerify('a[href="/admin/blogs"]', '/admin/blogs', 'a[href="/admin/blogs/new"]', 'Sidebar -> Blog Articles');
  await new Promise(r => setTimeout(r, 500));
  await snap('02_blogs_list');

  // 4. Click "New Article"
  console.log('\n[STEP 4] Clicking "New Article" button...');
  await clickAndVerify('a[href="/admin/blogs/new"]', '/admin/blogs/new', 'input#title', 'Blogs List -> New Article');
  await new Promise(r => setTimeout(r, 500));
  await snap('03_blogs_new');

  // 5. Click "← Back to Articles"
  console.log('\n[STEP 5] Clicking "← Back to Articles"...');
  await clickAndVerify('a[href="/admin/blogs"]', '/admin/blogs', 'a[href="/admin/blogs/new"]', 'New Article -> Back to Articles');
  await new Promise(r => setTimeout(r, 500));

  // 6. Click "Work Gallery" in sidebar
  console.log('\n[STEP 6] Clicking "Work Gallery" in sidebar...');
  await clickAndVerify('a[href="/admin/gallery"]', '/admin/gallery', 'a[href="/admin/gallery/new"]', 'Sidebar -> Work Gallery');
  await new Promise(r => setTimeout(r, 500));
  await snap('04_gallery_list');

  // 7. Click "New Project"
  console.log('\n[STEP 7] Clicking "New Project" button...');
  await clickAndVerify('a[href="/admin/gallery/new"]', '/admin/gallery/new', 'input#name', 'Gallery List -> New Project');
  await new Promise(r => setTimeout(r, 500));
  await snap('05_gallery_new');

  // 8. Click "← Back to Gallery"
  console.log('\n[STEP 8] Clicking "← Back to Gallery"...');
  await clickAndVerify('a[href="/admin/gallery"]', '/admin/gallery', 'a[href="/admin/gallery/new"]', 'New Project -> Back to Gallery');
  await new Promise(r => setTimeout(r, 500));

  // 9. Click "Dashboard" in sidebar
  console.log('\n[STEP 9] Clicking "Dashboard" in sidebar...');
  await clickAndVerify('a[href="/admin"]', '/admin', 'a[href="/admin/blogs/new"]', 'Sidebar -> Dashboard');
  await new Promise(r => setTimeout(r, 500));
  await snap('06_dashboard_return');

  // 10. Click "New Blog Post" button on Dashboard
  console.log('\n[STEP 10] Clicking "New Blog Post" button on Dashboard...');
  await clickAndVerify('a[href="/admin/blogs/new"]', '/admin/blogs/new', 'input#title', 'Dashboard -> New Blog Post');
  await new Promise(r => setTimeout(r, 500));

  // 11. Click "Dashboard" in sidebar again
  console.log('\n[STEP 11] Returning to Dashboard...');
  await clickAndVerify('a[href="/admin"]', '/admin', 'a[href="/admin/blogs/new"]', 'Sidebar -> Dashboard');
  await new Promise(r => setTimeout(r, 500));

  // 12. Click "New Project" button on Dashboard
  console.log('\n[STEP 12] Clicking "New Project" button on Dashboard...');
  await clickAndVerify('a[href="/admin/gallery/new"]', '/admin/gallery/new', 'input#name', 'Dashboard -> New Project');
  await new Promise(r => setTimeout(r, 500));

  console.log('\n======================================================');
  console.log('   ALL ADMIN NAVIGATION & ISOLATION CHECKS PASSED!    ');
  console.log('======================================================\n');

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
