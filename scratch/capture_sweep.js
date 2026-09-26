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
  { path: '/about', name: 'about', fullPage: true },
];

async function capture() {
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--window-size=1440,1000'
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

  let idCounter = 100;
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
      
      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: theme }]
      });

      const url = `http://localhost:3000${item.path}?theme=${theme}`;
      await sendCommand('Page.navigate', { url });

      // Wait 3s for initial load
      await new Promise(r => setTimeout(r, 3000));

      // Scroll sweep to trigger all Framer Motion whileInView animations
      await sendCommand('Runtime.evaluate', {
        awaitPromise: true,
        expression: `(async () => {
          const step = 400;
          for (let y = 0; y < document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 80));
          }
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 600));
        })()`
      });

      const res = await sendCommand('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

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
  console.log('SWEEP CAPTURE COMPLETE!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
