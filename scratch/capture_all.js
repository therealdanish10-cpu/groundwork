const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pagesToCapture = [
  { path: '/', name: 'home', fullPage: true },
  { path: '/services', name: 'services', fullPage: true },
  { path: '/work', name: 'work', fullPage: true },
  { path: '/blog', name: 'blog', fullPage: true },
  { path: '/about', name: 'about', fullPage: true },
  { path: '/contact', name: 'contact', fullPage: false, height: 1000 },
  { path: '/login', name: 'login', fullPage: false, height: 900 }
];

async function capture() {
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

  let idCounter = 10;
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

  for (const item of pagesToCapture) {
    for (const theme of ['light', 'dark']) {
      console.log(`Capturing ${item.name} (${theme})...`);
      
      // Set color scheme emulation
      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: theme }]
      });

      // Set viewport
      const height = item.height || 900;
      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: height,
        deviceScaleFactor: 1,
        mobile: false
      });

      // Navigate
      const url = `http://localhost:3000${item.path}?theme=${theme}`;
      await sendCommand('Page.navigate', { url });

      // Wait 2.5s for load and hydration
      await new Promise(r => setTimeout(r, 2500));

      // Trigger animation finish
      await sendCommand('Runtime.evaluate', {
        expression: `window.scrollTo(0, 500); window.scrollTo(0, 0);`
      });
      await new Promise(r => setTimeout(r, 800));

      let screenshotParams = { format: 'png' };
      if (item.fullPage) {
        screenshotParams.captureBeyondViewport = true;
      }

      const res = await sendCommand('Page.captureScreenshot', screenshotParams);
      if (res && res.data) {
        const buf = Buffer.from(res.data, 'base64');
        const filename = path.join(outDir, `${item.name}_${theme}.png`);
        fs.writeFileSync(filename, buf);
        console.log(`Saved ${filename} (${buf.length} bytes)`);
      }
    }
  }

  ws.close();
  edge.kill();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
