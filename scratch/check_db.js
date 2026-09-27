const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await adminClient.from('gallery').select('*').order('created_at', { ascending: false });
  console.log('Gallery projects:', data?.length);
  data?.forEach(d => console.log(`- [${d.id}] ${d.name} (order: ${d.sort_order}, link: ${d.live_link_url || d.live_link})`));
}

run().catch(console.error);
