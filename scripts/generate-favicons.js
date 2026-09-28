/**
 * generate-favicons.js
 * Generates all favicon and nav logo variants from public/trelio-logo.png.png
 * Run with: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const SRC    = path.join(__dirname, '../public/trelio-logo.png.png');
const PUBLIC = path.join(__dirname, '../public');

/* ─── Pixel processor: white → transparent, dark → white, blue → keep ── */
function makeDarkBuffer(data, width, height, channels) {
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const a = channels === 4 ? data[i * channels + 3] : 255;

    if (r > 210 && g > 210 && b > 210) {
      // White / near-white → transparent
      out[i * 4]     = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
    } else if (b > r + 40 && b > 120) {
      // Blue accent → keep as-is
      out[i * 4]     = r;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = b;
      out[i * 4 + 3] = a;
    } else {
      // Dark / black → make white (visible on dark bg)
      out[i * 4]     = 255;
      out[i * 4 + 1] = 255;
      out[i * 4 + 2] = 255;
      out[i * 4 + 3] = a;
    }
  }
  return out;
}

async function main() {
  console.log('Reading source logo…');
  const srcMeta = await sharp(SRC).metadata();
  console.log(`  Source: ${srcMeta.width}×${srcMeta.height} px`);

  /* ── 1. Copy original as trelio-logo.png ─────────────────────────── */
  fs.copyFileSync(SRC, path.join(PUBLIC, 'trelio-logo.png'));
  console.log('✓ trelio-logo.png (copy of original)');

  /* ── 2. Trim whitespace → base buffer ───────────────────────────── */
  const trimBuf = await sharp(SRC)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 1 }, threshold: 15 })
    .toBuffer();

  const trimMeta = await sharp(trimBuf).metadata();
  console.log(`  Trimmed: ${trimMeta.width}×${trimMeta.height} px`);

  /* ── 3. Nav logo — light mode (trimmed, height-120 optimized) ────── */
  await sharp(trimBuf)
    .resize({ height: 120, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, 'trelio-logo-nav.png'));
  console.log('✓ trelio-logo-nav.png (light mode nav)');

  /* ── 4. Nav logo — dark mode (pixel-manipulated) ─────────────────── */
  const navRaw = await sharp(trimBuf)
    .resize({ height: 120, withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const darkNavBuf = makeDarkBuffer(
    navRaw.data, navRaw.info.width, navRaw.info.height, navRaw.info.channels
  );
  await sharp(darkNavBuf, {
    raw: { width: navRaw.info.width, height: navRaw.info.height, channels: 4 }
  })
    .png()
    .toFile(path.join(PUBLIC, 'trelio-logo-nav-dark.png'));
  console.log('✓ trelio-logo-nav-dark.png (dark mode nav)');

  /* ── 5. Favicon: crop full T-icon with proper aspect ratio & padding ──
     The T-icon occupies roughly 323px wide by 268px high in the trimmed logo.
     We extract the full T-mark and center it with comfortable breathing padding.
  ─────────────────────────────────────────────────────────────────── */
  const iconWidth  = Math.min(Math.round(trimMeta.height * 1.21), trimMeta.width); // ~323px
  const iconHeight = trimMeta.height; // ~268px
  const iconLeft   = 0;
  const iconTop    = 0;

  const iconBuf = await sharp(trimBuf)
    .extract({ left: iconLeft, top: iconTop, width: iconWidth, height: iconHeight })
    .toBuffer();

  /* Light-mode favicons (transparent background with ~15% padding) */
  for (const size of [32, 16]) {
    const name = `favicon-${size}.png`;
    const targetW = Math.max(1, Math.round(size * 0.84));
    const targetH = Math.max(1, Math.round(targetW * (iconHeight / iconWidth)));
    await sharp(iconBuf)
      .resize(targetW, targetH, { fit: 'contain' })
      .extend({
        top: Math.floor((size - targetH) / 2),
        bottom: Math.ceil((size - targetH) / 2),
        left: Math.floor((size - targetW) / 2),
        right: Math.ceil((size - targetW) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(PUBLIC, name));
    console.log(`✓ ${name} (${size}×${size} light)`);
  }

  /* Apple touch icon (180x180, clean white background with padding) */
  const appleW = Math.round(180 * 0.76);
  const appleH = Math.round(appleW * (iconHeight / iconWidth));
  await sharp(iconBuf)
    .resize(appleW, appleH, { fit: 'contain' })
    .extend({
      top: Math.floor((180 - appleH) / 2),
      bottom: Math.ceil((180 - appleH) / 2),
      left: Math.floor((180 - appleW) / 2),
      right: Math.ceil((180 - appleW) / 2),
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, 'apple-touch-icon.png'));
  console.log(`✓ apple-touch-icon.png (180×180 white background)`);

  /* Dark-mode favicons (white & blue on transparent) */
  const iconRaw = await sharp(iconBuf)
    .resize(256, Math.round(256 * (iconHeight / iconWidth)), { fit: 'contain' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const darkIconBuf = makeDarkBuffer(
    iconRaw.data, iconRaw.info.width, iconRaw.info.height, iconRaw.info.channels
  );
  const darkIconSharp = sharp(darkIconBuf, {
    raw: { width: iconRaw.info.width, height: iconRaw.info.height, channels: 4 }
  });

  for (const size of [32, 16]) {
    const targetW = Math.max(1, Math.round(size * 0.84));
    const targetH = Math.max(1, Math.round(targetW * (iconHeight / iconWidth)));
    await darkIconSharp.clone()
      .resize(targetW, targetH)
      .extend({
        top: Math.floor((size - targetH) / 2),
        bottom: Math.ceil((size - targetH) / 2),
        left: Math.floor((size - targetW) / 2),
        right: Math.ceil((size - targetW) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(PUBLIC, `favicon-dark-${size}.png`));
    console.log(`✓ favicon-dark-${size}.png (${size}×${size} dark)`);
  }

  console.log('\n✅  All favicon assets generated successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
