const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase queries...');
console.log('URL:', url);

async function test() {
  const anonClient = createClient(url, anonKey);
  const adminClient = createClient(url, serviceKey);

  console.time('anon blogs');
  const b1 = await anonClient.from('blogs').select('id, title, service_tag, status, created_at').order('created_at', { ascending: false });
  console.timeEnd('anon blogs');
  console.log('anon blogs count:', b1.data?.length, 'error:', b1.error?.message);

  console.time('anon gallery');
  const g1 = await anonClient.from('gallery').select('id, name, category, live_link, screenshot, sort_order').order('sort_order', { ascending: true });
  console.timeEnd('anon gallery');
  console.log('anon gallery count:', g1.data?.length, 'error:', g1.error?.message);

  console.time('admin blogs');
  const b2 = await adminClient.from('blogs').select('id, title, service_tag, status, created_at').order('created_at', { ascending: false });
  console.timeEnd('admin blogs');
  console.log('admin blogs count:', b2.data?.length, 'error:', b2.error?.message);

  console.time('admin gallery');
  const g2 = await adminClient.from('gallery').select('id, name, category, live_link, screenshot, sort_order').order('sort_order', { ascending: true });
  console.timeEnd('admin gallery');
  console.log('admin gallery count:', g2.data?.length, 'error:', g2.error?.message);
}

test().catch(console.error);
