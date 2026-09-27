const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');

async function capture() {
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

  let idCounter = 500;
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

  await sendCommand('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'light' }]
  });

  const url = 'http://localhost:3000/?theme=light';
  await sendCommand('Page.navigate', { url });

  // Wait 4s for complete load
  await new Promise(r => setTimeout(r, 4000));

  // Check if image is complete
  const imgStatus = await sendCommand('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const img = document.querySelector('img[alt="Trelio Engineering & Digital Solutions"]');
      return img ? { complete: img.complete, naturalWidth: img.naturalWidth, src: img.src } : 'img not found';
    })()`
  });
  console.log('Image status:', imgStatus?.result?.value);

  const heroRes = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });
  if (heroRes && heroRes.data) {
    const heroBuf = Buffer.from(heroRes.data, 'base64');
    const filename = path.join(outDir, 'hero_light.png');
    fs.writeFileSync(filename, heroBuf);
    console.log(`Saved ${filename} (${heroBuf.length} bytes)`);
  }

  ws.close();
  edge.kill();
  console.log('DONE!');
}

capture().catch(console.error);
