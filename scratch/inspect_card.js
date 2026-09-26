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
        if (!page) {
          setTimeout(queryCDP, 500);
          return;
        }

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
                const card = document.querySelector('a[href="/services/web-development"]');
                if (!card) return { error: 'Card not found' };
                const rect = card.getBoundingClientRect();
                const comp = window.getComputedStyle(card);
                const children = Array.from(card.children).map(c => {
                  const r = c.getBoundingClientRect();
                  const ccomp = window.getComputedStyle(c);
                  return {
                    tag: c.tagName,
                    className: c.className,
                    top: r.top,
                    bottom: r.bottom,
                    height: r.height,
                    padding: ccomp.padding,
                    margin: ccomp.margin
                  };
                });
                const spans = Array.from(card.querySelectorAll('span')).map(s => {
                  const r = s.getBoundingClientRect();
                  return { text: s.innerText, top: r.top, bottom: r.bottom, height: r.height };
                });
                return {
                  card: { top: rect.top, bottom: rect.bottom, height: rect.height, overflow: comp.overflow, padding: comp.padding },
                  children,
                  spans
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
            console.log('MEASUREMENT RESULT:', JSON.stringify(resp.result?.result?.value, null, 2));
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
