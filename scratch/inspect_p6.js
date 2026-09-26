const { spawn } = require('child_process');
const http = require('http');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--no-sandbox',
  '--window-size=1440,1200'
]);

function queryCDP() {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const targets = JSON.parse(raw);
        const page = targets.find(t => t.type === 'page');
        if (!page) return setTimeout(queryCDP, 500);

        const ws = new WebSocket(page.webSocketDebuggerUrl);
        ws.onopen = () => {
          ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.navigate',
            params: { url: 'http://localhost:3000/?theme=light' }
          }));
        };

        ws.onmessage = (event) => {
          const resp = JSON.parse(event.data);
          if (resp.method === 'Page.loadEventFired') {
            setTimeout(() => {
              const code = `(() => {
                const el = document.querySelector('a[href="/services/web-development"] > div:nth-child(2)');
                if (!el) return 'element not found';
                
                // Check all stylesheets for .p-6
                let p6Rules = [];
                for (const sheet of document.styleSheets) {
                  try {
                    for (const rule of sheet.cssRules) {
                      if (rule.selectorText && rule.selectorText.includes('p-6')) {
                        p6Rules.push({ selector: rule.selectorText, cssText: rule.cssText });
                      }
                    }
                  } catch(e){}
                }
                
                return {
                  className: el.className,
                  computedPadding: window.getComputedStyle(el).padding,
                  computedPaddingTop: window.getComputedStyle(el).paddingTop,
                  computedPaddingBottom: window.getComputedStyle(el).paddingBottom,
                  p6Rules
                };
              })()`;

              ws.send(JSON.stringify({
                id: 3,
                method: 'Runtime.evaluate',
                params: { expression: code, returnByValue: true }
              }));
            }, 2000);
          }

          if (resp.id === 3) {
            console.log('CSS INSPECT RESULT:', JSON.stringify(resp.result?.result?.value, null, 2));
            ws.close();
            edge.kill();
            process.exit(0);
          }
        };
      } catch (e) {
        setTimeout(queryCDP, 500);
      }
    });
  }).on('error', () => {
    setTimeout(queryCDP, 500);
  });
}

setTimeout(queryCDP, 1500);
