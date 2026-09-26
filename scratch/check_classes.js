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
          // Find all classes matching p- or px- or py-
          const matches = [...cssData.matchAll(/\.([a-zA-Z0-9_\-\\\/:]+)\s*\{/g)].map(m => m[1]);
          console.log('Sample classes in CSS (total ' + matches.length + '):');
          console.log('padding classes:', matches.filter(c => c.startsWith('p-') || c.startsWith('px-') || c.startsWith('py-') || c.startsWith('pt-') || c.startsWith('pb-')).slice(0, 30));
          console.log('Includes p-6?', cssData.includes('p-6'));
          console.log('Includes p-8?', cssData.includes('p-8'));
          console.log('Includes py-24?', cssData.includes('py-24'));
        });
      });
    }
  });
});
