const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const galleryDir = path.resolve(__dirname, '..', 'public', 'gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

async function run() {
  console.log('Fetching all gallery records...');
  const { data: projects, error } = await client.from('gallery').select('*');
  if (error) {
    console.error('Error fetching gallery:', error);
    return;
  }

  console.log(`Found ${projects.length} projects.`);

  for (const p of projects) {
    const rawImage = p.screenshot || p.screenshot_url;
    if (rawImage && rawImage.startsWith('data:image/')) {
      const match = rawImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        let ext = match[1];
        if (ext === 'jpeg') ext = 'jpg';
        const buffer = Buffer.from(match[2], 'base64');
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const filename = `${slug}.${ext}`;
        const filePath = path.join(galleryDir, filename);
        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/gallery/${filename}`;
        console.log(`Saved ${filename} (${buffer.length} bytes) -> updating DB to ${publicUrl}`);

        const { error: updateErr } = await client
          .from('gallery')
          .update({
            screenshot: publicUrl,
            screenshot_url: publicUrl
          })
          .eq('id', p.id);

        if (updateErr) {
          console.error(`Failed to update ${p.name}:`, updateErr);
        } else {
          console.log(`Successfully updated ${p.name}`);
        }
      }
    } else {
      console.log(`Project ${p.name} already has clean URL: ${rawImage}`);
    }
  }

  console.log('Migration completed!');
}

run().catch(console.error);
