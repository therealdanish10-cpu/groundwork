const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

  let idCounter = 9000;
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

  console.log('--- 1. ADMIN DESKTOP VERIFICATION ---');
  // First login
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
  await new Promise(r => setTimeout(r, 2000));

  // Inspect sidebar styles
  const sidebarCheck = await evaluate(`(() => {
    const aside = document.querySelector('aside');
    const nav = aside ? aside.querySelector('nav') : null;
    const header = aside ? aside.querySelector('div.p-6') : null;
    const footer = aside ? aside.querySelector('div.p-4.border-t') : null;
    const trelioLogo = aside ? aside.querySelector('.nav-logo-img') : null;
    const logoutBtn = aside ? aside.querySelector('button') : null;

    return {
      navComputed: nav ? {
        position: window.getComputedStyle(nav).position,
        zIndex: window.getComputedStyle(nav).zIndex,
        top: nav.getBoundingClientRect().top,
        height: nav.getBoundingClientRect().height,
      } : null,
      headerRect: header ? header.getBoundingClientRect() : null,
      footerRect: footer ? footer.getBoundingClientRect() : null,
      logoRect: trelioLogo ? trelioLogo.getBoundingClientRect() : null,
      logoutRect: logoutBtn ? logoutBtn.getBoundingClientRect() : null
    };
  })()`);
  console.log('Sidebar check result:', JSON.stringify(sidebarCheck, null, 2));

  // Capture Desktop Admin Screenshot
  const adminSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (adminSnap?.data) {
    fs.writeFileSync(path.join(outDir, 'admin_sidebar_desktop.png'), Buffer.from(adminSnap.data, 'base64'));
    console.log('Saved admin_sidebar_desktop.png');
  }

  console.log('\n--- 2. MOBILE SERVICES VERIFICATION ---');
  // Switch to iPhone 16 viewport
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true
  });

  await navigate('http://localhost:3000/services');
  await new Promise(r => setTimeout(r, 2500));

  const mobileCheck = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    const navInner = document.querySelector('.nav-inner');
    const navCta = document.querySelector('.nav-cta');
    const themeToggle = document.querySelector('#theme-toggle');
    const hamburger = document.querySelector('.nav-hamburger');
    const rightControls = document.querySelector('.nav-right-controls');
    const firstImg = document.querySelector('.relative.h-44 img');

    return {
      navInnerWidth: navInner ? navInner.getBoundingClientRect().width : null,
      navCtaRect: navCta ? navCta.getBoundingClientRect() : null,
      navCtaText: navCta ? navCta.textContent : null,
      themeToggleRect: themeToggle ? themeToggle.getBoundingClientRect() : null,
      hamburgerRect: hamburger ? hamburger.getBoundingClientRect() : null,
      rightControlsGap: rightControls ? window.getComputedStyle(rightControls).gap : null,
      firstImgDetails: firstImg ? {
        src: firstImg.src,
        naturalWidth: firstImg.naturalWidth,
        naturalHeight: firstImg.naturalHeight,
        complete: firstImg.complete,
        rect: firstImg.getBoundingClientRect()
      } : null
    };
  })()`);
  console.log('Mobile services check result:', JSON.stringify(mobileCheck, null, 2));

  // Capture Mobile Services Screenshot
  const mobileSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (mobileSnap?.data) {
    fs.writeFileSync(path.join(outDir, 'services_mobile.png'), Buffer.from(mobileSnap.data, 'base64'));
    console.log('Saved services_mobile.png');
  }

  console.log('\n--- 3. DESKTOP SERVICES VERIFICATION ---');
  // Reset Emulation
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await navigate('http://localhost:3000/services');
  await new Promise(r => setTimeout(r, 2000));

  const desktopSnap = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (desktopSnap?.data) {
    fs.writeFileSync(path.join(outDir, 'services_desktop.png'), Buffer.from(desktopSnap.data, 'base64'));
    console.log('Saved services_desktop.png');
  }

  ws.close();
  edge.kill();
  console.log('All verifications complete!');
}

run().catch(console.error);
