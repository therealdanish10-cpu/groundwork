const http = require('http');

http.get('http://localhost:3000/contact', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all css link tags
    const links = [...data.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
    console.log('CSS links:', links);

    // Fetch the first CSS link
    if (links.length > 0) {
      const cssUrl = links[0].startsWith('http') ? links[0] : 'http://localhost:3000' + links[0];
      http.get(cssUrl, (cssRes) => {
        let cssData = '';
        cssRes.on('data', c => cssData += c);
        cssRes.on('end', () => {
          console.log('CSS length:', cssData.length);
          console.log('Has py-3?', cssData.includes('py-3') || cssData.includes('padding-top: calc(var(--spacing) * 3)') || cssData.includes('padding-top:.75rem') || cssData.includes('padding-top: 0.75rem'));
          console.log('Has rounded-xl?', cssData.includes('rounded-xl'));
          console.log('Has bg-gray-50?', cssData.includes('bg-gray-50'));
          
          // Let's search for "John Doe" or input styles in the HTML
          console.log('Input in HTML:', data.includes('placeholder="John Doe"'));
          const inputMatch = data.match(/<input[^>]+id="name"[^>]*>/);
          console.log('Input tag in HTML:', inputMatch ? inputMatch[0] : 'none');
        });
      });
    }
  });
});
