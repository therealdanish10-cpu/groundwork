const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const serviceMatch = data.match(/<a[^>]+href="\/services\/web-development"[^>]*>[\s\S]*?<\/a>/);
    if (serviceMatch) {
      console.log('MATCH FOUND:');
      console.log(serviceMatch[0]);
    } else {
      console.log('NOT FOUND in HTML, checking if rendered client-side');
      console.log('HTML length:', data.length);
      const idx = data.indexOf('Web Development');
      console.log('Index of Web Development:', idx);
      if (idx !== -1) {
        console.log('Snippet around Web Development:');
        console.log(data.substring(idx - 200, idx + 400));
      }
    }
  });
});
