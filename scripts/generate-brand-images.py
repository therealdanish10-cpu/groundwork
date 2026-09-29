"""
generate-brand-images.py
Generates branded assets for Trelio:
1. public/trelio-profile.png (500x500 square profile picture)
2. public/trelio-cover.png (1584x396 LinkedIn company page banner)
3. public/danish-linkedin-cover.png (1584x396 personal LinkedIn banner for Danish Awan)
"""

import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Set paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
ARTIFACT_DIR = r'C:\Users\HP\.gemini\antigravity\brain\0b7c54c5-9532-4956-ac4b-dd1ebea0c7a4'

# ─── 1. EXTRACT & BUILD HIGH-RES DARK T MARK ──────────────────────────────
src_logo_path = os.path.join(PUBLIC_DIR, 'trelio-logo.png')
src_logo = Image.open(src_logo_path).convert('RGB')
arr_src = np.array(src_logo, dtype=np.float32)

# Bounding box of T-mark in trelio-logo.png: y: 353..621, x: 212..535 (268 x 323)
t_crop = arr_src[353:621, 212:535]
H_t, W_t = t_crop.shape[:2]

diff = 255.0 - t_crop
max_diff = np.max(diff, axis=-1)
alpha = np.clip((max_diff - 6.0) / (255.0 - 6.0) * 1.05, 0.0, 1.0)
alpha = np.where(max_diff < 10.0, 0.0, alpha)

fg_rgb = np.zeros_like(t_crop)
mask = alpha > 0.01
for c in range(3):
    fg_rgb[mask, c] = np.clip((t_crop[mask, c] - (1.0 - alpha[mask]) * 255.0) / alpha[mask], 0.0, 255.0)

t_dark = np.zeros((H_t, W_t, 4), dtype=np.uint8)
is_blue = (t_crop[:, :, 2] > t_crop[:, :, 0] + 30) & (t_crop[:, :, 2] > 100)
t_dark[:, :, :3] = np.round(fg_rgb).astype(np.uint8)
non_blue = mask & (~is_blue)
t_dark[non_blue, :3] = 255  # Pure white for body in dark mode
t_dark[:, :, 3] = np.round(alpha * 255.0).astype(np.uint8)

img_t_dark = Image.fromarray(t_dark)
nav_dark = Image.open(os.path.join(PUBLIC_DIR, 'trelio-logo-nav-dark.png')).convert('RGBA')

# Font helper
def get_font(name, size):
    path = os.path.join('C:\\Windows\\Fonts', name)
    return ImageFont.truetype(path, size)

font_bold = lambda sz: get_font('segoeuib.ttf', sz)
font_reg = lambda sz: get_font('segoeui.ttf', sz)

# ─── HELPER: CREATE BACKGROUND WITH RADIAL GLOW & GRID ───────────────────
def make_branded_bg(W, H, glow_centers, grid_step=32):
    base = np.zeros((H, W, 4), dtype=np.float32)
    # Dark navy base #0B0F19 -> (11, 15, 25)
    base[:, :, 0] = 11.0
    base[:, :, 1] = 15.0
    base[:, :, 2] = 25.0
    base[:, :, 3] = 255.0

    y_grid, x_grid = np.mgrid[0:H, 0:W]
    for (cx, cy, radius, r_col, g_col, b_col, intensity) in glow_centers:
        dist = np.sqrt((x_grid - cx)**2 + (y_grid - cy)**2)
        falloff = np.clip(1.0 - dist / float(radius), 0.0, 1.0)**2
        base[:, :, 0] += falloff * r_col * intensity
        base[:, :, 1] += falloff * g_col * intensity
        base[:, :, 2] += falloff * b_col * intensity

    base = np.clip(base, 0, 255).astype(np.uint8)
    img = Image.fromarray(base)
    draw = ImageDraw.Draw(img)

    # Subtle grid dots
    for gx in range(grid_step, W, grid_step):
        for gy in range(grid_step, H, grid_step):
            draw.point((gx, gy), fill=(255, 255, 255, 20))

    return img

# ══════════════════════════════════════════════════════════════════════════
# IMAGE 1: PROFILE PICTURE (500 x 500 px)
# ══════════════════════════════════════════════════════════════════════════
print("Generating Image 1: public/trelio-profile.png...")
W1, H1 = 500, 500
bg1 = make_branded_bg(W1, H1, [
    (250, 250, 280, 26, 115, 253, 0.45),
    (250, 250, 160, 59, 130, 246, 0.30)
], grid_step=25)

# Center T-mark: width 240px (height ~199px)
# At radius 250px (circle crop boundary), the corner is ~156px from center, giving 94px safe margin
t_w1 = 240
t_h1 = int(round(t_w1 * (H_t / W_t)))
t_res1 = img_t_dark.resize((t_w1, t_h1), Image.Resampling.LANCZOS)

# Subtle ambient glow behind mark
glow_t = np.zeros((H1, W1, 4), dtype=np.float32)
y_g, x_g = np.mgrid[0:H1, 0:W1]
dist_c = np.sqrt((x_g - 250)**2 + (y_g - 250)**2)
glow_fall = np.clip(1.0 - dist_c / 180.0, 0, 1)**2
glow_t[:, :, 0] = 30
glow_t[:, :, 1] = 120
glow_t[:, :, 2] = 255
glow_t[:, :, 3] = glow_fall * 70
glow_img = Image.fromarray(glow_t.astype(np.uint8))
bg1.alpha_composite(glow_img)

off_x1 = (W1 - t_w1) // 2
off_y1 = (H1 - t_h1) // 2
bg1.paste(t_res1, (off_x1, off_y1), t_res1)

profile_path = os.path.join(PUBLIC_DIR, 'trelio-profile.png')
bg1.save(profile_path, optimize=True)
if os.path.exists(ARTIFACT_DIR):
    bg1.save(os.path.join(ARTIFACT_DIR, 'trelio-profile.png'))
print("[OK] Saved public/trelio-profile.png (500x500)")

# ══════════════════════════════════════════════════════════════════════════
# IMAGE 2: COMPANY COVER PHOTO (1584 x 396 px)
# ══════════════════════════════════════════════════════════════════════════
print("Generating Image 2: public/trelio-cover.png...")
W2, H2 = 1584, 396
bg2 = make_branded_bg(W2, H2, [
    (1150, 160, 650, 26, 115, 253, 0.42),
    (300, 320, 450, 37, 99, 235, 0.20),
    (1450, 300, 400, 59, 130, 246, 0.25)
], grid_step=32)
draw2 = ImageDraw.Draw(bg2)

# Large faint watermark mark on far right for premium depth
watermark_h2 = 320
watermark_w2 = int(watermark_h2 * (W_t / H_t))
watermark_t2 = img_t_dark.resize((watermark_w2, watermark_h2), Image.Resampling.LANCZOS)
wm_arr = np.array(watermark_t2)
wm_arr[:, :, 3] = (wm_arr[:, :, 3].astype(np.float32) * 0.10).astype(np.uint8)
wm_img = Image.fromarray(wm_arr)
bg2.paste(wm_img, (W2 - watermark_w2 - 50, (H2 - watermark_h2) // 2), wm_img)

# Left safe area preserved for LinkedIn company avatar (x < 420)
content_x2 = 420

# Pill Badge: GLOBAL DIGITAL AGENCY
badge_txt2 = "GLOBAL DIGITAL AGENCY"
f_b2 = font_bold(13)
bbox2 = f_b2.getbbox(badge_txt2)
bw2 = bbox2[2] - bbox2[0] + 28
bh2 = bbox2[3] - bbox2[1] + 12
draw2.rounded_rectangle([content_x2, 45, content_x2 + bw2, 45 + bh2], radius=bh2//2, fill=(26, 115, 253, 35), outline=(37, 99, 235, 120), width=1)
draw2.text((content_x2 + 14, 45 + 5), badge_txt2, font=f_b2, fill=(96, 165, 250, 255))

# Trelio Nav Dark Logo (height 54px, width ~223px)
logo_h2 = 54
logo_w2 = int(nav_dark.width * (logo_h2 / float(nav_dark.height)))
logo_res2 = nav_dark.resize((logo_w2, logo_h2), Image.Resampling.LANCZOS)
bg2.paste(logo_res2, (content_x2, 88), logo_res2)

# Tagline Typography
f_title2 = font_bold(38)
draw2.text((content_x2, 160), "Digital Solutions for", font=f_title2, fill=(255, 255, 255, 255))
draw2.text((content_x2, 206), "Growing Businesses Globally", font=f_title2, fill=(59, 130, 246, 255))

# Services subtitle
f_sub2 = font_reg(16)
draw2.text((content_x2, 268), "Web Development  ·  SEO  ·  App Development  ·  AI Automation  ·  Cloud Systems", font=f_sub2, fill=(148, 163, 184, 255))

# Divider line
draw2.line([(content_x2, 310), (W2 - 120, 310)], fill=(255, 255, 255, 25), width=1)

# Footer info
draw2.ellipse([content_x2, 332, content_x2 + 10, 342], fill=(16, 185, 129, 255))
draw2.text((content_x2 + 20, 327), "trelio.tech", font=font_bold(14), fill=(255, 255, 255, 255))
draw2.text((content_x2 + 125, 327), "Enterprise Engineering & Scalable Growth", font=font_reg(14), fill=(100, 116, 139, 255))

cover_path = os.path.join(PUBLIC_DIR, 'trelio-cover.png')
bg2.save(cover_path, optimize=True)
if os.path.exists(ARTIFACT_DIR):
    bg2.save(os.path.join(ARTIFACT_DIR, 'trelio-cover.png'))
print("[OK] Saved public/trelio-cover.png (1584x396)")

# ══════════════════════════════════════════════════════════════════════════
# IMAGE 3: PERSONAL LINKEDIN COVER PHOTO FOR DANISH AWAN (1584 x 396 px)
# ══════════════════════════════════════════════════════════════════════════
print("Generating Image 3: public/danish-linkedin-cover.png...")
W3, H3 = 1584, 396
bg3 = make_branded_bg(W3, H3, [
    (1150, 160, 650, 26, 115, 253, 0.42),
    (750, 120, 450, 37, 99, 235, 0.25),
    (1450, 280, 400, 59, 130, 246, 0.25)
], grid_step=32)
draw3 = ImageDraw.Draw(bg3)

# Watermark T-mark on the right
bg3.paste(wm_img, (W3 - watermark_w2 - 50, (H3 - watermark_h2) // 2), wm_img)

# Danish personal cover content:
# Bottom-left is reserved for LinkedIn circular profile picture (safe region x < 440, y > 120)
content_x3 = 450

# Pill Badge
badge_txt3 = "TRELIO  ·  FOUNDING TEAM"
f_b3 = font_bold(12)
bbox3 = f_b3.getbbox(badge_txt3)
bw3 = bbox3[2] - bbox3[0] + 24
bh3 = bbox3[3] - bbox3[1] + 12
draw3.rounded_rectangle([content_x3, 45, content_x3 + bw3, 45 + bh3], radius=bh3//2, fill=(26, 115, 253, 35), outline=(37, 99, 235, 120), width=1)
draw3.text((content_x3 + 12, 45 + 5), badge_txt3, font=f_b3, fill=(96, 165, 250, 255))

# T logo mark next to Name
t_h3 = 38
t_w3 = int(t_h3 * (W_t / H_t))
t_res3 = img_t_dark.resize((t_w3, t_h3), Image.Resampling.LANCZOS)
bg3.paste(t_res3, (content_x3, 86), t_res3)

# Name
draw3.text((content_x3 + t_w3 + 18, 78), "Danish Awan", font=font_bold(44), fill=(255, 255, 255, 255))

# Role: Co-founder & CTO at Trelio
draw3.text((content_x3, 144), "Co-founder & CTO at Trelio", font=font_bold(22), fill=(59, 130, 246, 255))

# Tagline requested: "Building digital solutions for businesses worldwide"
draw3.text((content_x3, 186), "Building digital solutions for businesses worldwide", font=font_reg(19), fill=(241, 245, 249, 255))

# Engineering focus line
draw3.text((content_x3, 226), "Full-Stack Architecture  ·  Cloud Systems  ·  AI & Digital Transformation", font=font_reg(15), fill=(148, 163, 184, 255))

# Divider line
draw3.line([(content_x3, 275), (W3 - 140, 275)], fill=(255, 255, 255, 25), width=1)

# Footer info
draw3.ellipse([content_x3, 302, content_x3 + 10, 312], fill=(16, 185, 129, 255))
draw3.text((content_x3 + 20, 297), "trelio.tech", font=font_bold(14), fill=(255, 255, 255, 255))
draw3.text((content_x3 + 125, 297), "hello@trelio.tech", font=font_reg(14), fill=(148, 163, 184, 255))
draw3.text((content_x3 + 280, 297), "Leading Technology & Product Engineering", font=font_reg(14), fill=(100, 116, 139, 255))

danish_path = os.path.join(PUBLIC_DIR, 'danish-linkedin-cover.png')
bg3.save(danish_path, optimize=True)
if os.path.exists(ARTIFACT_DIR):
    bg3.save(os.path.join(ARTIFACT_DIR, 'danish-linkedin-cover.png'))
print("[OK] Saved public/danish-linkedin-cover.png (1584x396)")

print("\nAll 3 brand images generated successfully!")
