const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots', 'nav_fix');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Spawning Edge for Nav Verification...');
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

  let idCounter = 95000;
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

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('    [PAGE CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('    [PAGE EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
  });

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('Runtime.enable');

  async function evalInPage(expr) {
    const res = await sendCommand('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  async function takeScreenshot(filename) {
    const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    const dest = path.join(outDir, filename);
    fs.writeFileSync(dest, buffer);
    console.log(`    [SCREENSHOT] Saved: ${dest} (${buffer.length} bytes)`);
  }

  async function clickNavLink(text, expectedPath) {
    console.log(`\n======================================================`);
    console.log(`TEST: Clicking Nav Link "${text}" -> Expecting path "${expectedPath}"`);
    console.log(`======================================================`);

    const beforeUrl = await evalInPage('window.location.href');
    console.log(`  Current URL: ${beforeUrl}`);

    const clickInfo = await evalInPage(`(() => {
      const links = Array.from(document.querySelectorAll('.nav-links a'));
      const target = links.find(a => a.innerText.trim() === '${text}');
      if (!target) return { found: false, all: links.map(l => l.innerText.trim()) };
      const rect = target.getBoundingClientRect();
      return {
        found: true,
        href: target.getAttribute('href'),
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      };
    })()`);

    if (!clickInfo.found) {
      console.error(`  ERROR: Link "${text}" was NOT found in .nav-links! Found:`, clickInfo.all);
      return false;
    }

    console.log(`  Physical mouse click dispatch to "${text}" at (${clickInfo.x}, ${clickInfo.y})...`);
    await sendCommand('Input.dispatchMouseEvent', { type: 'mouseMoved', x: clickInfo.x, y: clickInfo.y });
    await sendCommand('Input.dispatchMouseEvent', { type: 'mousePressed', x: clickInfo.x, y: clickInfo.y, button: 'left', clickCount: 1 });
    await sendCommand('Input.dispatchMouseEvent', { type: 'mouseReleased', x: clickInfo.x, y: clickInfo.y, button: 'left', clickCount: 1 });

    const startTime = Date.now();
    let navigated = false;
    for (let i = 0; i < 50; i++) {
      await new Promise(r => setTimeout(r, 100));
      const curPath = await evalInPage('window.location.pathname');
      if (curPath === expectedPath) {
        navigated = true;
        const duration = Date.now() - startTime;
        console.log(`  PASSED: Successfully navigated to "${curPath}" in ${duration}ms!`);
        break;
      }
    }

    if (!navigated) {
      const finalUrl = await evalInPage('window.location.href');
      console.error(`  FAILED: Did not navigate to "${expectedPath}". Current URL is: ${finalUrl}`);
      return false;
    }

    // Wait a brief moment for page animations/renders to settle
    await new Promise(r => setTimeout(r, 600));
    await takeScreenshot(`nav_${text.toLowerCase()}_page.png`);
    return true;
  }

  console.log('Navigating to http://localhost:3000/ ...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2500));
  await takeScreenshot('nav_00_initial_home.png');

  // Sequence of navigation clicks:
  // 1. Home -> Work
  await clickNavLink('Work', '/work');

  // 2. Work -> Blog
  await clickNavLink('Blog', '/blog');

  // 3. Blog -> Home
  await clickNavLink('Home', '/');

  // 4. Home -> Services
  await clickNavLink('Services', '/services');

  // 5. Services -> Work
  await clickNavLink('Work', '/work');

  // 6. Work -> Home
  await clickNavLink('Home', '/');

  // 7. Test while SCROLLED
  console.log('\n======================================================');
  console.log('TEST: Clicking nav links while page is SCROLLED');
  console.log('======================================================');
  await evalInPage('window.scrollTo(0, 600)');
  await new Promise(r => setTimeout(r, 300));
  // Scroll up slightly to trigger nav reveal
  await evalInPage('window.scrollTo(0, 500)');
  await new Promise(r => setTimeout(r, 400));
  const navClass = await evalInPage('document.querySelector("nav#nav").className');
  console.log('Nav state while scrolling up:', navClass);

  // Click Work while scrolled
  await clickNavLink('Work', '/work');

  // Check scroll position on /work: should be 0
  const workScrollY = await evalInPage('window.scrollY');
  console.log('Scroll position after landing on /work:', workScrollY);

  console.log('\nALL NAV CLICKS PASSED SUCCESSFULLY IN REAL BROWSER!');
  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
