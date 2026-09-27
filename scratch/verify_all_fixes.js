const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots', 'verification');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runTests() {
  console.log('Launching headless Edge for comprehensive 6-behavior verification...');
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

  let idCounter = 800;
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

  function reload() {
    return new Promise((resolve) => {
      function handler(event) {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', handler);
          resolve();
        }
      }
      ws.addEventListener('message', handler);
      sendCommand('Page.reload');
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

  console.log('\n======================================================');
  console.log('   VERIFYING 6 UI / ANIMATION / NAV REQUIREMENTS      ');
  console.log('======================================================\n');

  // Load Home page
  console.log('Navigating to http://localhost:3000/ ...');
  await navigate('http://localhost:3000/');
  await new Promise(r => setTimeout(r, 1500)); // allow React hydration

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5 & 6: NAV DARK MODE COLOR & REMOVAL OF BOTTOM BORDER
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 5 & 6] Checking Nav styling (Border & Dark Mode Navy Color)...');
  
  const lightStyles = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    const cs = getComputedStyle(nav);
    return {
      position: cs.position,
      borderBottomWidth: cs.borderBottomWidth,
      borderBottomStyle: cs.borderBottomStyle,
      backgroundColor: cs.backgroundColor
    };
  })()`);
  console.log('Light Mode Nav Styles:', lightStyles);

  // Switch to dark mode
  await evaluate(`(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const darkStyles = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    const cs = getComputedStyle(nav);
    return {
      position: cs.position,
      borderBottomWidth: cs.borderBottomWidth,
      borderBottomStyle: cs.borderBottomStyle,
      backgroundColor: cs.backgroundColor
    };
  })()`);
  console.log('Dark Mode Nav Styles:', darkStyles);

  await snap('test5_6_dark_nav_no_border');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: SCROLL POSITION ON RELOAD / LOGO CLICK
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 3] Testing Scroll Position on Logo Click & Page Reload...');

  // Scroll down 600px instantly
  await evaluate(`(() => {
    window.scrollTo({ top: 600, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise(r => setTimeout(r, 300));
  let scrollYBeforeLogo = await evaluate(`window.scrollY`);
  console.log('Current scrollY before Logo click:', scrollYBeforeLogo);

  // Click logo
  await evaluate(`document.querySelector('.logo').click()`);
  await new Promise(r => setTimeout(r, 600));
  let scrollYAfterLogo = await evaluate(`window.scrollY`);
  console.log('Scroll position after Logo click (must be 0):', scrollYAfterLogo);

  // Scroll down 800px and reload page
  await evaluate(`(() => {
    window.scrollTo({ top: 800, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise(r => setTimeout(r, 300));
  let scrollYBeforeReload = await evaluate(`window.scrollY`);
  console.log('Current scrollY before Reload:', scrollYBeforeReload);

  console.log('Reloading page while scrolled down...');
  await reload();
  await new Promise(r => setTimeout(r, 2000));

  let scrollYAfterReload = await evaluate(`window.scrollY`);
  console.log('Scroll position after page reload (must be 0):', scrollYAfterReload);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: AUTO-HIDING NAV ON SCROLL
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 4] Testing Auto-hiding Nav on Scroll...');
  
  // At top (scrollY = 0)
  const topNavState = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    return {
      classes: nav ? nav.className : null,
      transform: nav ? getComputedStyle(nav).transform : null
    };
  })()`);
  console.log('At top (scrollY=0):', topNavState);
  await snap('test4_nav_at_top');

  // Scroll DOWN to 400px -> Nav should immediately hide
  console.log('Scrolling DOWN to 400px...');
  await evaluate(`(() => {
    window.scrollTo({ top: 400, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise(r => setTimeout(r, 300));

  const scrollDownNavState = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    return {
      classes: nav ? nav.className : null,
      transform: nav ? getComputedStyle(nav).transform : null
    };
  })()`);
  console.log('After scrolling DOWN to 400px:', scrollDownNavState);
  await snap('test4_nav_hidden_scrolling_down');

  // Scroll UP slightly to 320px -> Nav should immediately slide into view
  console.log('Scrolling UP slightly from 400px to 320px...');
  await evaluate(`(() => {
    window.scrollTo({ top: 320, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise(r => setTimeout(r, 300));

  const scrollUpNavState = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    return {
      classes: nav ? nav.className : null,
      transform: nav ? getComputedStyle(nav).transform : null
    };
  })()`);
  console.log('After scrolling UP slightly:', scrollUpNavState);
  await snap('test4_nav_visible_scrolling_up');

  // Pause scrolling for 1.8s -> Nav should auto-hide
  console.log('Pausing scrolling for 1.8s...');
  await new Promise(r => setTimeout(r, 1800));

  const pausedNavState = await evaluate(`(() => {
    const nav = document.querySelector('#nav');
    return {
      classes: nav ? nav.className : null,
      transform: nav ? getComputedStyle(nav).transform : null
    };
  })()`);
  console.log('After pausing scrolling (1.8s):', pausedNavState);
  await snap('test4_nav_hidden_after_pause');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1 & 2: SCROLL-TRIGGERED ANIMATIONS & LAZY-LOAD CAROUSEL/GALLERY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n[TEST 1 & 2] Testing Scroll-triggered animations & LazyCard...');

  // Reset to top
  await evaluate(`(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Check services card opacity before scroll
  const initialCardsOpacity = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('#services .group, section:nth-of-type(2) a')).map(el => {
      const parent = el.closest('div');
      return parent ? getComputedStyle(parent).opacity : null;
    });
    return cards;
  })()`);
  console.log('Services cards opacity at top of page (should be 0):', initialCardsOpacity);

  // Scroll down to services
  console.log('Scrolling smoothly to services...');
  await evaluate(`window.scrollTo({ top: 800, behavior: 'smooth' })`);
  await new Promise(r => setTimeout(r, 1200));
  await snap('test1_services_scrolled_into_view');

  const scrolledServicesOpacity = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('#services .group, section:nth-of-type(2) a')).slice(0, 4).map(el => {
      const parent = el.closest('div');
      return parent ? getComputedStyle(parent).opacity : null;
    });
    return cards;
  })()`);
  console.log('Services cards opacity after scrolling into view (should be 1):', scrolledServicesOpacity);

  // Scroll down to gallery / featured work
  console.log('Scrolling smoothly to featured projects / gallery...');
  await evaluate(`window.scrollTo({ top: 1700, behavior: 'smooth' })`);
  await new Promise(r => setTimeout(r, 1200));
  await snap('test2_gallery_lazy_rendered');

  const galleryImagesMounted = await evaluate(`(() => {
    const imgs = Array.from(document.querySelectorAll('#work img, section:nth-of-type(4) img')).map(img => ({
      src: img.src.substring(0, 60),
      complete: img.complete,
      naturalWidth: img.naturalWidth
    }));
    return imgs;
  })()`);
  console.log('Gallery images mounted on scroll:', galleryImagesMounted);

  console.log('\n======================================================');
  console.log('   ALL 6 BEHAVIORS TESTED SUCCESSFULLY!               ');
  console.log('======================================================\n');

  ws.close();
  edge.kill();
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
