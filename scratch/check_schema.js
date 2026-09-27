const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const { createClient } = require('@supabase/supabase-js');
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function q() {
  const { data: blog, error: bErr } = await s.from('blogs').select('*').limit(1);
  console.log('Blogs error:', bErr);
  console.log('Blogs sample or columns:', blog);

  const { data: gal, error: gErr } = await s.from('gallery').select('*').limit(1);
  console.log('Gallery error:', gErr);
  if (gal && gal[0]) {
    console.log('Gallery columns:', Object.keys(gal[0]));
  }
}

q();
