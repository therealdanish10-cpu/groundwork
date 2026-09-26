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
          const idx = cssData.indexOf('.p-6');
          console.log('Snippet around .p-6:');
          console.log(cssData.substring(idx - 50, idx + 200));
        });
      });
    }
  });
});
