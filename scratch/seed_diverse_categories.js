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
  await adminClient.from('gallery').update({ category: 'Mobile' }).eq('id', '7c2dae7d-96ca-4f97-9da8-cfd9f6315cb3');
  await adminClient.from('gallery').update({ category: 'AI' }).eq('id', 'e635a44f-523b-401d-8422-ec712a6266f1');
  await adminClient.from('gallery').update({ category: 'WordPress' }).eq('id', '780b8ef7-849a-4a83-b759-c3109485ba9e');

  const { data } = await adminClient.from('gallery').select('name, category');
  console.log('Updated categories:');
  data.forEach(d => console.log(`- [${d.category}] ${d.name}`));
}

run().catch(console.error);
