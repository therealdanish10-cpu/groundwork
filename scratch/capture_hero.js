const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

  let idCounter = 400;
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

  for (const theme of ['light', 'dark']) {
    console.log(`Capturing hero for theme: ${theme}...`);
    await sendCommand('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: theme }]
    });

    const url = `http://localhost:3000/?theme=${theme}`;
    await sendCommand('Page.navigate', { url });

    // Wait 3.5s for page and image to load
    await new Promise(r => setTimeout(r, 3500));

    // Capture hero viewport (1440x950)
    const heroRes = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    if (heroRes && heroRes.data) {
      const heroBuf = Buffer.from(heroRes.data, 'base64');
      const filename = path.join(outDir, `hero_${theme}.png`);
      fs.writeFileSync(filename, heroBuf);
      console.log(`Saved ${filename} (${heroBuf.length} bytes)`);
    }

    // Scroll sweep and capture full page
    await sendCommand('Runtime.evaluate', {
      awaitPromise: true,
      expression: `(async () => {
        const step = 350;
        for (let y = 0; y < document.body.scrollHeight + 500; y += step) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 70));
        }
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 600));
      })()`
    });

    const fullRes = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    if (fullRes && fullRes.data) {
      const fullBuf = Buffer.from(fullRes.data, 'base64');
      const filename = path.join(outDir, `home_${theme}_final.png`);
      fs.writeFileSync(filename, fullBuf);
      console.log(`Saved ${filename} (${fullBuf.length} bytes)`);
    }
  }

  ws.close();
  edge.kill();
  console.log('HERO CAPTURES COMPLETE!');
}

capture().catch(console.error);
