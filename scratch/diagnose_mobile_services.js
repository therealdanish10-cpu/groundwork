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
    '--window-size=393,852'
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

  let idCounter = 7000;
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

  const failedRequests = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Network.loadingFailed') {
      failedRequests.push(msg.params);
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

  await navigate('http://localhost:3000/services');
  await new Promise(r => setTimeout(r, 3000));

  // Capture screenshot of mobile /services
  const snapRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  if (snapRes?.data) {
    fs.writeFileSync(path.join(outDir, 'mobile_services_before.png'), Buffer.from(snapRes.data, 'base64'));
    console.log('Saved mobile_services_before.png');
  }

  // Inspect images and top nav
  const info = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    const navInner = document.querySelector('.nav-inner');
    const navCta = document.querySelector('.nav-cta');
    const themeToggle = document.querySelector('button[aria-label="Toggle theme"], .theme-toggle');
    const hamburger = document.querySelector('.nav-hamburger');
    const rightControls = navCta?.parentElement;

    const navLayout = {
      navInnerRect: navInner?.getBoundingClientRect(),
      navCtaRect: navCta?.getBoundingClientRect(),
      rightControlsRect: rightControls?.getBoundingClientRect(),
      hamburgerRect: hamburger?.getBoundingClientRect(),
      themeToggleRect: themeToggle?.getBoundingClientRect(),
      navCtaText: navCta?.textContent?.trim(),
      rightControlsGap: rightControls ? window.getComputedStyle(rightControls).gap : null
    };

    const imgs = Array.from(document.querySelectorAll('img')).map(img => {
      const rect = img.getBoundingClientRect();
      const cs = window.getComputedStyle(img);
      return {
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity
      };
    });

    // Check service cards container
    const cardImages = Array.from(document.querySelectorAll('.relative.h-44')).map(container => {
      const img = container.querySelector('img');
      const rect = container.getBoundingClientRect();
      return {
        containerRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        hasImg: !!img,
        imgSrc: img?.src,
        imgNaturalWidth: img?.naturalWidth,
        imgComplete: img?.complete,
        imgRect: img ? img.getBoundingClientRect() : null,
        imgComputed: img ? {
          position: window.getComputedStyle(img).position,
          inset: window.getComputedStyle(img).inset,
          width: window.getComputedStyle(img).width,
          height: window.getComputedStyle(img).height,
          display: window.getComputedStyle(img).display,
          opacity: window.getComputedStyle(img).opacity,
          visibility: window.getComputedStyle(img).visibility
        } : null
      };
    });

    return { navLayout, imgsCount: imgs.length, cardImages, failed: imgs.filter(i => i.complete && i.naturalWidth === 0) };
  })()`);

  console.log('--- MOBILE NAV LAYOUT ---');
  console.log(JSON.stringify(info.navLayout, null, 2));

  console.log('\n--- CARD IMAGES INSPECTION ---');
  console.log(JSON.stringify(info.cardImages[0], null, 2));

  console.log('\n--- FAILED NETWORK REQUESTS ---');
  console.log(JSON.stringify(failedRequests, null, 2));

  ws.close();
  edge.kill();
}

run().catch(console.error);
