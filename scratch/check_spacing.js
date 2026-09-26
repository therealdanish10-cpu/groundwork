const http = require('http');

http.get('http://localhost:3000/contact', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const links = [...data.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
    if (links.length > 0) {
      const cssUrl = 'http://localhost:3000' + links[0];
      http.get(cssUrl, (cssRes) => {
        let cssData = '';
        cssRes.on('data', c => cssData += c);
        cssRes.on('end', () => {
          const idx = cssData.indexOf('--spacing:');
          console.log('Snippet around --spacing:');
          if (idx !== -1) {
            console.log(cssData.substring(idx - 20, idx + 80));
          } else {
            console.log('--spacing: NOT FOUND IN CSS!');
          }
        });
      });
    }
  });
});
