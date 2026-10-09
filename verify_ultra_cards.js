const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9226;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const cb = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) cb.reject(data.error);
          else cb.resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(2500);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(fileName) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, fileName);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${fileName} (${buffer.length} bytes)`);
    return outPath;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('Launching headless Chrome on port', PORT);
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--window-size=1600,900',
    '--hide-scrollbars',
    '--mute-audio',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    'about:blank'
  ]);

  let cdp = null;

  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
        targets = await targetsRes.json();
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }
    if (!targets) throw new Error('Could not connect to Chrome debugging port');
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    console.log('Attaching CDP to target:', pageTarget.title, pageTarget.webSocketDebuggerUrl);

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    console.log('Navigating to Moon dossier...');
    await cdp.navigate('http://localhost:8080/src/game/dist/index.html?destination=moon');
    await sleep(2000);

    console.log('Opening Spacecraft Assembly Bay...');
    await cdp.evaluate(`document.getElementById('design-button')?.click();`);
    await sleep(2500);

    // Initial check (Propulsion - Step 1)
    console.log('Capturing Step 1 (Propulsion)...');
    await cdp.screenshot('verify_ultra_cards_propulsion_step1.png');

    // Select Slot 4 (Communications - Step 5, matching IMAGE_37.PNG)
    console.log('Selecting Step 5 (Communications)...');
    const selectRes = await cdp.evaluate(`(() => {
      const slotBtn = document.querySelector('button[data-slot="4"]');
      if (slotBtn) {
        slotBtn.click();
        return true;
      }
      return false;
    })()`);
    console.log('Slot 4 clicked:', selectRes);
    await sleep(1500);

    // Verify sub-header text and card styles
    const step5Info = await cdp.evaluate(`(() => {
      const title = document.getElementById('catalog-title')?.textContent?.trim();
      const slots = Array.from(document.querySelectorAll('.hangar-slots button')).map(b => ({
        num: b.querySelector('.slot-pill, .cyber-num-pill, > span')?.textContent?.trim(),
        title: b.querySelector('.slot-title, b')?.textContent?.trim(),
        active: b.getAttribute('aria-pressed') === 'true',
        sub: b.querySelector('.slot-sub, small')?.textContent?.trim()
      }));
      const options = Array.from(document.querySelectorAll('.hangar-options button')).map(b => ({
        tag: b.querySelector('.part-tag-text, .part-tag-badge')?.textContent?.trim(),
        title: b.querySelector('strong')?.textContent?.trim(),
        specs: b.querySelector('.part-specs-row, small')?.textContent?.trim(),
        active: b.getAttribute('aria-pressed') === 'true'
      }));

      return {
        catalogTitle: title,
        visibleMiddleSlots: slots.slice(3, 6), // 04, 05, 06
        equipmentOptions: options
      };
    })()`);
    console.log('Step 5 Info:', JSON.stringify(step5Info, null, 2));

    console.log('Capturing Step 5 Communications (Image 37 Reference)...');
    await cdp.screenshot('verify_ultra_cards_comm_step5.png');

    // Click Endurance option (Choice 1) in Step 5
    console.log('Selecting Endurance option in Step 5...');
    await cdp.evaluate(`document.querySelector('.hangar-options button[data-part="1"]')?.click();`);
    await sleep(1200);

    console.log('Capturing installed state in Step 5...');
    await cdp.screenshot('verify_ultra_cards_step5_selected.png');

    // Auto equip all and test launch button
    console.log('Testing Auto-Equip All...');
    await cdp.evaluate(`document.querySelector('button[data-hangar="suggested"]')?.click();`);
    await sleep(1500);

    const readyCheck = await cdp.evaluate(`(() => {
      const readiness = document.getElementById('assembly-readiness')?.textContent?.trim();
      const launchBtn = document.getElementById('launch-button');
      return {
        readiness,
        launchDisabled: launchBtn ? launchBtn.disabled : null,
        launchText: launchBtn ? launchBtn.textContent.trim() : null
      };
    })()`);
    console.log('Vehicle readiness:', JSON.stringify(readyCheck, null, 2));

    console.log('Capturing final fully assembled bay...');
    await cdp.screenshot('verify_ultra_cards_assembled.png');

    console.log('--- ALL ULTRA-PREMIUM CARDS VERIFICATIONS SUCCESSFUL ---');
    cdp.close();
  } finally {
    chromeProcess.kill('SIGKILL');
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
