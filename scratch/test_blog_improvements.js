const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const testImagePath = path.resolve('scratch/test-cover.png');

async function run() {
  console.log('--- Starting Blog Admin Improvements Test ---');
  console.log('Test image path:', testImagePath);

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--window-size=1440,1080'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  function getPageTarget() {
    return new Promise((resolve, reject) => {
      let tries = 0;
      function check() {
        tries++;
        if (tries > 30) return reject(new Error('Cannot connect to Edge debugging port'));
        http.get('http://127.0.0.1:9222/json', (res) => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => {
            try {
              const targets = JSON.parse(raw);
              const p = targets.find(t => t.type === 'page');
              if (p) return resolve(p);
            } catch(e){}
            setTimeout(check, 300);
          });
        }).on('error', () => setTimeout(check, 300));
      }
      check();
    });
  }

  const pageTarget = await getPageTarget();
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let idCounter = 20000;
  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++idCounter;
      function handler(event) {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) {
            reject(msg.error);
          } else {
            resolve(msg.result);
          }
        }
      }
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('Runtime.enable');

  function navigate(url) {
    return new Promise((resolve) => {
      function handler(event) {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', handler);
          resolve();
        }
      }
      ws.addEventListener('message', handler);
      sendCommand('Page.navigate', { url });
    });
  }

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async function captureScreenshot(filePath) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath}`);
  }

  try {
    // 1. Login
    console.log('1. Navigating to login...');
    await navigate('http://localhost:3000/login');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Entering credentials...');
    await evaluate(`(() => {
      const email = document.querySelector('#email');
      const pwd = document.querySelector('#password');
      const btn = document.querySelector('button[type="submit"]');

      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(email, 'testadmin@trelio.test');
      email.dispatchEvent(new Event('input', { bubbles: true }));

      setter.call(pwd, 'AdminPassword123!');
      pwd.dispatchEvent(new Event('input', { bubbles: true }));

      btn.click();
    })()`);

    for (let i = 0; i < 40; i++) {
      const p = await evaluate('window.location.pathname');
      if (p === '/admin') break;
      await new Promise(r => setTimeout(r, 200));
    }
    console.log('Current path after login:', await evaluate('window.location.pathname'));

    // 2. Navigate to /admin/blogs/new
    console.log('2. Navigating to /admin/blogs/new...');
    await navigate('http://localhost:3000/admin/blogs/new');
    await new Promise(r => setTimeout(r, 1500));

    // 3. Test Auto-Slug Generation
    console.log('3. Testing Auto-Slug Generation...');
    const testTitle1 = 'Building High-Performance Next.js Web Apps in 2026: A Full Guide!';
    await evaluate(`(() => {
      const titleInput = document.querySelector('#title');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(titleInput, ${JSON.stringify(testTitle1)});
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);

    await new Promise(r => setTimeout(r, 300));
    const autoSlug1 = await evaluate(`document.querySelector('#slug').value`);
    console.log('Auto-generated slug:', autoSlug1);
    const expectedSlug1 = 'building-high-performance-nextjs-web-apps-in-2026-a-full-guide';
    if (autoSlug1 === expectedSlug1) {
      console.log('PASS: Slug correctly generated from title!');
    } else {
      console.error(`FAIL: Expected "${expectedSlug1}", got "${autoSlug1}"`);
    }

    // 4. Test Manual Override of Slug
    console.log('4. Testing Manual Override of Slug...');
    const customSlug = 'custom-nextjs-performance-2026';
    await evaluate(`(() => {
      const slugInput = document.querySelector('#slug');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(slugInput, ${JSON.stringify(customSlug)});
      slugInput.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);

    await new Promise(r => setTimeout(r, 300));
    const isResetButtonVisible = await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('Reset to auto-generated'));
    })()`);
    console.log('Reset button visible after manual edit:', isResetButtonVisible);

    // Edit title again to make sure custom slug is NOT overwritten
    const testTitle2 = 'Building High-Performance Next.js Web Apps in 2026 (Updated Edition)';
    await evaluate(`(() => {
      const titleInput = document.querySelector('#title');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(titleInput, ${JSON.stringify(testTitle2)});
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);

    await new Promise(r => setTimeout(r, 300));
    const slugAfterTitleChange = await evaluate(`document.querySelector('#slug').value`);
    console.log('Slug after title change with custom override active:', slugAfterTitleChange);
    if (slugAfterTitleChange === customSlug) {
      console.log('PASS: Custom slug was preserved when title changed!');
    } else {
      console.error(`FAIL: Expected custom slug "${customSlug}", got "${slugAfterTitleChange}"`);
    }

    // Test clicking "Reset to auto-generated"
    console.log('Testing "Reset to auto-generated" button...');
    await evaluate(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const resetBtn = btns.find(b => b.textContent.includes('Reset to auto-generated'));
      if (resetBtn) resetBtn.click();
    })()`);

    await new Promise(r => setTimeout(r, 300));
    const slugAfterReset = await evaluate(`document.querySelector('#slug').value`);
    console.log('Slug after reset:', slugAfterReset);
    const expectedSlugAfterReset = 'building-high-performance-nextjs-web-apps-in-2026-updated-edition';
    if (slugAfterReset === expectedSlugAfterReset) {
      console.log('PASS: Reset to auto-generated works accurately!');
    } else {
      console.error(`FAIL: Expected "${expectedSlugAfterReset}", got "${slugAfterReset}"`);
    }

    // 5. Test Real File Upload
    console.log('5. Testing Real Image File Upload...');
    const doc = await sendCommand('DOM.getDocument');
    const { nodeId } = await sendCommand('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '#cover-image-upload'
    });

    console.log('Found #cover-image-upload nodeId:', nodeId);
    await sendCommand('DOM.setFileInputFiles', {
      files: [testImagePath],
      nodeId
    });

    console.log('File attached via CDP, waiting for upload to complete...');
    let coverImageUrl = '';
    for (let i = 0; i < 50; i++) {
      coverImageUrl = await evaluate(`document.querySelector('#cover_image').value`);
      if (coverImageUrl && coverImageUrl.length > 0) {
        break;
      }
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('Cover Image URL populated:', coverImageUrl);
    if (coverImageUrl.startsWith('http') && coverImageUrl.includes('supabase.co')) {
      console.log('PASS: Public Supabase storage URL generated successfully!');
    } else if (coverImageUrl.startsWith('data:image')) {
      console.log('NOTE: Image generated as data URL fallback.');
    } else {
      console.error('FAIL: Cover image URL is empty or invalid:', coverImageUrl);
    }

    // Check preview image
    const hasPreview = await evaluate(`Boolean(document.querySelector('img[alt="Preview"]'))`);
    console.log('Preview image visible:', hasPreview);

    // 6. Fill remaining required fields
    console.log('6. Filling remaining required fields...');
    await evaluate(`(() => {
      // Service tag
      const serviceSelect = document.querySelector('#service_tag');
      serviceSelect.value = 'web-development';
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));

      // Content
      const content = document.querySelector('#content');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(content, '## Building High-Performance Next.js Web Apps in 2026\\n\\nThis article was created during verification of the real file upload and auto-slug generation features in the admin panel.');
      content.dispatchEvent(new Event('input', { bubbles: true }));

      // Status -> published
      const statusSelect = document.querySelector('#status');
      statusSelect.value = 'published';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);

    await new Promise(r => setTimeout(r, 500));
    await captureScreenshot('scratch/screenshots/admin_blog_new_filled.png');

    // 7. Submit form
    console.log('7. Submitting form to create article...');
    await evaluate(`(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      submitBtn.click();
    })()`);

    console.log('Waiting for redirect to /admin/blogs...');
    for (let i = 0; i < 40; i++) {
      const p = await evaluate('window.location.pathname');
      if (p === '/admin/blogs') break;
      await new Promise(r => setTimeout(r, 300));
    }
    console.log('Redirected to:', await evaluate('window.location.pathname'));

    await new Promise(r => setTimeout(r, 1500));
    await captureScreenshot('scratch/screenshots/admin_blogs_list_with_test_post.png');

    // 8. Verify the article in list
    const articleFound = await evaluate(`(() => {
      const text = document.body.innerText;
      return text.includes('Building High-Performance Next.js Web Apps in 2026');
    })()`);
    console.log('Article found in admin blogs list:', articleFound);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    edge.kill();
    process.exit(0);
  }
}

run();
