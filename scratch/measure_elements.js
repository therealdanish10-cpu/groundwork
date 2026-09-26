const { exec } = require('child_process');
const http = require('http');

// Find edge path
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Spawn Edge with remote debugging
const proc = exec(`"${edgePath}" --headless=new --remote-debugging-port=9222 --no-sandbox "http://localhost:3000/?theme=light"`);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Tabs:', data);
      proc.kill();
    });
  }).on('error', err => {
    console.error('Error connecting to CDP:', err.message);
    proc.kill();
  });
}, 3000);
