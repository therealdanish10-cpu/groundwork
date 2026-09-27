const http = require('http');

async function testFetchAdmin() {
  console.log('Sending GET /admin...');
  const t0 = Date.now();
  
  // First login to get cookie
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadmin@trelio.test', password: 'AdminPassword123!' })
  }).catch(() => null);

  // Or get cookie via Edge browser
}
