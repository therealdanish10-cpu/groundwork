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

  let idCounter = 10000;
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

  // Clear browser cookies and storage to simulate public user (Get in Touch button)
  await sendCommand('Network.clearBrowserCookies');
  await sendCommand('Network.clearBrowserCache');

  // Set iPhone 16 viewport
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true
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

  await navigate('http://localhost:3000/services');
  await new Promise(r => setTimeout(r, 2000));

  // Clear localStorage auth if any
  await evaluate(`(() => {
    localStorage.clear();
    sessionStorage.clear();
  })()`);
  await navigate('http://localhost:3000/services');
  await new Promise(r => setTimeout(r, 2500));

  // Check top nav elements
  const check = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    const cta = document.querySelector('.nav-cta');
    const theme = document.querySelector('#theme-toggle');
    const ham = document.querySelector('.nav-hamburger');
    const right = document.querySelector('.nav-right-controls');
    const logo = document.querySelector('.logo');
    return {
      ctaText: cta ? cta.textContent.trim() : null,
      ctaRect: cta ? cta.getBoundingClientRect() : null,
      themeRect: theme ? theme.getBoundingClientRect() : null,
      hamRect: ham ? ham.getBoundingClientRect() : null,
      logoRect: logo ? logo.getBoundingClientRect() : null,
      spaceBetweenLogoAndCta: (cta && logo) ? (cta.getBoundingClientRect().left - logo.getBoundingClientRect().right) : null,
      gapBetweenControls: right ? window.getComputedStyle(right).gap : null
    };
  })()`);
  console.log('Mobile public check:', JSON.stringify(check, null, 2));

  // Capture top of mobile page
  const snap1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snap1?.data) {
    fs.writeFileSync(path.join(outDir, 'mobile_services_public_top.png'), Buffer.from(snap1.data, 'base64'));
    console.log('Saved mobile_services_public_top.png');
  }

  // Scroll down a bit to see the card fully
  await evaluate(`window.scrollBy(0, 300)`);
  await new Promise(r => setTimeout(r, 1000));

  const snap2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snap2?.data) {
    fs.writeFileSync(path.join(outDir, 'mobile_services_public_scrolled.png'), Buffer.from(snap2.data, 'base64'));
    console.log('Saved mobile_services_public_scrolled.png');
  }

  // Also test iPhone SE (375px wide)
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await evaluate(`window.scrollTo(0, 0)`);
  await new Promise(r => setTimeout(r, 1000));

  const snap3 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snap3?.data) {
    fs.writeFileSync(path.join(outDir, 'iphone_se_services_top.png'), Buffer.from(snap3.data, 'base64'));
    console.log('Saved iphone_se_services_top.png');
  }

  ws.close();
  edge.kill();
  console.log('Done!');
}

run().catch(console.error);
