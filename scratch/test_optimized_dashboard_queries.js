const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log('--- OLD DASHBOARD QUERIES (Anon, all rows) ---');
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    const [blogsRes, galleryRes] = await Promise.all([
      anonClient
        .from('blogs')
        .select('id, title, service_tag, status, created_at')
        .order('created_at', { ascending: false }),
      anonClient
        .from('gallery')
        .select('id, name, category, live_link, screenshot, sort_order')
        .order('sort_order', { ascending: true })
    ]);
    const duration = performance.now() - t0;
    console.log(`Run ${i+1}: ${duration.toFixed(1)}ms`);
  }

  console.log('\n--- NEW OPTIMIZED QUERIES (Admin client, lean head/limit) ---');
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    const [blogsRes, publishedRes, galleryRes] = await Promise.all([
      adminClient
        .from('blogs')
        .select('id, title, service_tag, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(4),
      adminClient
        .from('blogs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      adminClient
        .from('gallery')
        .select('id, name, category, live_link, screenshot, sort_order', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .limit(4)
    ]);
    const duration = performance.now() - t0;
    console.log(`Run ${i+1}: ${duration.toFixed(1)}ms (blogs: ${blogsRes.count}, pub: ${publishedRes.count}, gallery: ${galleryRes.count})`);
  }
}

run().catch(console.error);
