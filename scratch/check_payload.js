const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await client.from('gallery').select('id, name, screenshot, screenshot_url');
  if (error) return console.error(error);
  data.forEach(d => {
    console.log(d.name, {
      screenshotBytes: d.screenshot ? d.screenshot.length : 0,
      isBase64: d.screenshot ? d.screenshot.startsWith('data:') : false,
      urlBytes: d.screenshot_url ? d.screenshot_url.length : 0
    });
  });

  console.log('\n--- BLOGS TABLE ---');
  const { data: blogs, error: bError } = await client.from('blogs').select('id, title, cover_image');
  if (bError) return console.error(bError);
  console.log(`Blogs count: ${blogs.length}`);
  blogs.forEach(b => {
    console.log(b.title, {
      coverBytes: b.cover_image ? b.cover_image.length : 0,
      isBase64: b.cover_image ? b.cover_image.startsWith('data:') : false
    });
  });
}

run();
