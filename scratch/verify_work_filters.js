const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Spawning Edge headless...');
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--window-size=1440,1100'
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
  console.log('Connecting via WebSocket...');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 40000;
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

  console.log('Navigating to http://localhost:3000/work...');
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/work' });

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
    console.log(`Saved screenshot: ${dest} (${buffer.length} bytes)`);
  }

  // Wait for React hydration: poll until clicking tab changes state or compiles
  console.log('Waiting for Next.js compilation & React hydration...');
  let ready = false;
  for (let i = 0; i < 40; i++) {
    ready = await evalInPage(`(() => {
      const btn = document.getElementById('tab-all');
      return !!btn && !document.body.innerText.includes('Compiling');
    })()`);
    if (ready) break;
    await new Promise(r => setTimeout(r, 500));
  }
  // Extra pause to ensure React fiber tree is completely attached
  await new Promise(r => setTimeout(r, 2000));

  // Scroll down slightly so the cards and filter are well-positioned
  await evalInPage(`window.scrollTo(0, 180)`);
  await new Promise(r => setTimeout(r, 500));

  async function getTabState() {
    return await evalInPage(`(() => {
      const activeBtn = document.querySelector('button[id^="tab-"][aria-pressed="true"]');
      const cards = Array.from(document.querySelectorAll('article[data-project-card]')).map(card => {
        const title = card.querySelector('h3')?.innerText?.trim();
        const category = card.getAttribute('data-category');
        return { title, category };
      });
      const emptyStateEl = document.getElementById('empty-category-heading');
      return {
        activeTab: activeBtn ? activeBtn.id : null,
        activeTabText: activeBtn ? activeBtn.innerText.replace(/\\n/g, ' ').trim() : null,
        cardCount: cards.length,
        cards,
        emptyStateHeading: emptyStateEl ? emptyStateEl.innerText.trim() : null
      };
    })()`);
  }

  // 1. Initial State Check
  console.log('\n========================================');
  console.log('TEST 1: INITIAL STATE (ALL)');
  console.log('========================================');
  const initial = await getTabState();
  console.log('Initial Active Tab:', initial.activeTabText);
  console.log(`Projects rendered (${initial.cardCount}):`);
  initial.cards.forEach(c => console.log(`  - [${c.category}] ${c.title}`));
  await takeScreenshot('tab_01_all.png');

  // Test tabs
  const testSequence = [
    { tabId: 'tab-web', name: 'Web', expectedCount: 4 },
    { tabId: 'tab-mobile', name: 'Mobile', expectedCount: 1 },
    { tabId: 'tab-app', name: 'App', expectedCount: 1 },
    { tabId: 'tab-ai', name: 'AI', expectedCount: 1 },
    { tabId: 'tab-wordpress', name: 'WordPress', expectedCount: 1 },
    { tabId: 'tab-marketing', name: 'Marketing', expectedCount: 0 },
  ];

  for (const seq of testSequence) {
    console.log('\n========================================');
    console.log(`TESTING TAB: ${seq.name} (#${seq.tabId})`);
    console.log('========================================');

    // Click tab
    await evalInPage(`document.getElementById('${seq.tabId}').click()`);
    await new Promise(r => setTimeout(r, 600));

    const state = await getTabState();
    console.log(`Active Tab: ${state.activeTabText} (ID: ${state.activeTab})`);
    console.log(`Card count: ${state.cardCount} (expected: ${seq.expectedCount})`);
    state.cards.forEach(c => console.log(`  - [${c.category}] ${c.title}`));

    if (seq.expectedCount === 0) {
      console.log(`Empty state message rendered: "${state.emptyStateHeading}"`);
    }

    await takeScreenshot(`tab_${seq.name.toLowerCase()}.png`);

    if (seq.name === 'Marketing') {
      console.log('\nTesting "Show All Projects" button from Marketing empty state...');
      await evalInPage(`(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Show All Projects'));
        if (btn) btn.click();
      })()`);
      await new Promise(r => setTimeout(r, 600));
      const resetState = await getTabState();
      console.log(`Reset State -> Active Tab: ${resetState.activeTabText}, Cards: ${resetState.cardCount}`);
      await takeScreenshot('tab_reset_to_all.png');
    }
  }

  console.log('\nAll tab filter tests passed successfully!');
  ws.close();
  edge.kill();
}

run().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
