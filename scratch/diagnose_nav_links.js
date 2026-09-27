const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Spawning Edge...');
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

  let idCounter = 50000;
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

  console.log('Navigating to http://localhost:3000/ ...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 3000));

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

  // Diagnose Nav Links
  const navDiagnosis = await evalInPage(`(() => {
    const nav = document.querySelector('nav#nav');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const results = links.map(link => {
      const rect = link.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const elAtPoint = document.elementFromPoint(centerX, centerY);
      const computed = window.getComputedStyle(link);
      return {
        text: link.innerText,
        href: link.getAttribute('href'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        pointerEvents: computed.pointerEvents,
        zIndex: computed.zIndex,
        position: computed.position,
        elementUnderCenter: elAtPoint ? {
          tag: elAtPoint.tagName,
          id: elAtPoint.id,
          className: elAtPoint.className,
          html: elAtPoint.outerHTML.slice(0, 150)
        } : null,
        isElementItself: elAtPoint === link || link.contains(elAtPoint)
      };
    });

    // Check entire document for any elements with high z-index overlapping the top 100px
    const allOverlapping = Array.from(document.querySelectorAll('*')).filter(el => {
      if (nav.contains(el) || el === nav) return false;
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      if (r.top < 100 && r.bottom > 0 && r.width > 0 && r.height > 0) {
        return true;
      }
      return false;
    }).map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      rect: el.getBoundingClientRect(),
      zIndex: window.getComputedStyle(el).zIndex,
      position: window.getComputedStyle(el).position
    }));

    return {
      currentUrl: window.location.href,
      navRect: nav.getBoundingClientRect(),
      navZIndex: window.getComputedStyle(nav).zIndex,
      links: results,
      overlappingElements: allOverlapping
    };
  })()`);

  console.log('--- NAV DIAGNOSIS ---');
  console.log(JSON.stringify(navDiagnosis, null, 2));

  // Test actual click on Work
  console.log('\n--- TESTING CLICK ON WORK ---');
  const clickWork = await evalInPage(`(() => {
    const workLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.innerText.trim() === 'Work');
    if (!workLink) return { error: 'Work link not found' };
    workLink.click();
    return { clicked: true, href: workLink.href };
  })()`);
  console.log('Click Work result:', clickWork);

  await new Promise(r => setTimeout(r, 2000));
  const urlAfterWork = await evalInPage(`window.location.href`);
  console.log('URL after clicking Work:', urlAfterWork);

  // Test actual click on Blog
  console.log('\n--- TESTING CLICK ON BLOG ---');
  const clickBlog = await evalInPage(`(() => {
    const blogLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.innerText.trim() === 'Blog');
    if (!blogLink) return { error: 'Blog link not found' };
    blogLink.click();
    return { clicked: true, href: blogLink.href };
  })()`);
  console.log('Click Blog result:', clickBlog);

  await new Promise(r => setTimeout(r, 2000));
  const urlAfterBlog = await evalInPage(`window.location.href`);
  console.log('URL after clicking Blog:', urlAfterBlog);

  // Test actual click on Home
  console.log('\n--- TESTING CLICK ON HOME ---');
  const clickHome = await evalInPage(`(() => {
    const homeLink = Array.from(document.querySelectorAll('.nav-links a')).find(a => a.innerText.trim() === 'Home');
    if (!homeLink) return { error: 'Home link not found' };
    homeLink.click();
    return { clicked: true, href: homeLink.href };
  })()`);
  console.log('Click Home result:', clickHome);

  await new Promise(r => setTimeout(r, 2000));
  const urlAfterHome = await evalInPage(`window.location.href`);
  console.log('URL after clicking Home:', urlAfterHome);

  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
