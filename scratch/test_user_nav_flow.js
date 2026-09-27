const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Starting Edge browser...');
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

  let idCounter = 70000;
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
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('PAGE ERROR EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log(`[PAGE CONSOLE ${msg.params.type}]`, msg.params.args.map(a => a.value || a.description).join(' '));
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

  async function physicalClick(selector) {
    const box = await evalInPage(`(() => {
      const el = document.querySelector('${selector}');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      };
    })()`);

    if (!box) {
      console.error('Element not found:', selector);
      return false;
    }

    console.log(`Dispatching physical mouse click to ${selector} at (${box.x}, ${box.y})`);
    await sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: box.x,
      y: box.y
    });
    await sendCommand('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: box.x,
      y: box.y,
      button: 'left',
      clickCount: 1
    });
    await sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: box.x,
      y: box.y,
      button: 'left',
      clickCount: 1
    });
    return true;
  }

  console.log('--- 1. Load Homepage http://localhost:3000/ ---');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 3000));
  let url = await evalInPage('window.location.href');
  console.log('Current URL:', url);

  // Check all link hrefs
  const linkHrefs = await evalInPage(`(() => {
    return Array.from(document.querySelectorAll('.nav-links a')).map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href'),
      targetHref: a.href,
      className: a.className
    }));
  })()`);
  console.log('Nav Link hrefs:', linkHrefs);

  // Test Click on "Work"
  console.log('\n--- 2. Physically Clicking "Work" ---');
  await physicalClick('.nav-links a[href="/work"]');
  await new Promise(r => setTimeout(r, 2000));
  url = await evalInPage('window.location.href');
  console.log('URL after clicking Work:', url);

  // Test Click on "Blog"
  console.log('\n--- 3. Physically Clicking "Blog" from /work ---');
  await physicalClick('.nav-links a[href="/blog"]');
  await new Promise(r => setTimeout(r, 2000));
  url = await evalInPage('window.location.href');
  console.log('URL after clicking Blog:', url);

  // Test Click on "Home"
  console.log('\n--- 4. Physically Clicking "Home" from /blog ---');
  await physicalClick('.nav-links a[href="/"]');
  await new Promise(r => setTimeout(r, 2000));
  url = await evalInPage('window.location.href');
  console.log('URL after clicking Home:', url);

  // Now test clicking while SCROLLED
  console.log('\n--- 5. Test Clicking while SCROLLED ---');
  await evalInPage('window.scrollTo(0, 500)');
  await new Promise(r => setTimeout(r, 500));
  const navClassWhenScrolled = await evalInPage('document.querySelector("nav#nav").className');
  console.log('Nav class when scrolled down 500px:', navClassWhenScrolled);

  // Scroll up slightly to reveal nav
  console.log('Scrolling up to 400px to reveal nav...');
  await evalInPage('window.scrollTo(0, 400)');
  await new Promise(r => setTimeout(r, 500));
  const navClassScrollingUp = await evalInPage('document.querySelector("nav#nav").className');
  console.log('Nav class after scrolling up:', navClassScrollingUp);

  console.log('Physically clicking "Work" while scrolled...');
  await physicalClick('.nav-links a[href="/work"]');
  await new Promise(r => setTimeout(r, 2000));
  url = await evalInPage('window.location.href');
  console.log('URL after clicking Work while scrolled:', url);

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
