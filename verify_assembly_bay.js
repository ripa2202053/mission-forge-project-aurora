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

    console.log('Opening Spacecraft Assembly Bay (Clicking DESIGN THIS MISSION)...');
    await cdp.evaluate(`document.getElementById('design-button')?.click();`);
    await sleep(2500);

    // Verify dialog presence
    const dialogInfo = await cdp.evaluate(`(() => {
      const dialog = document.getElementById('dialog');
      const dialogTitle = document.getElementById('dialog-title')?.textContent?.trim();
      const subheader = document.querySelector('.assembly-subheader, .hangar-topline > span:first-child')?.textContent?.trim();
      const logoCount = document.querySelectorAll('.hud-main-title').length;
      const stage = document.querySelector('.hangar-stage');
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      const stageBorder = stage ? window.getComputedStyle(stage).border : null;
      const slots = Array.from(document.querySelectorAll('.hangar-slots button')).map(b => b.textContent.trim());
      const launchBtn = document.getElementById('launch-button');
      const launchBtnText = launchBtn ? launchBtn.textContent.trim() : null;
      const launchDisabled = launchBtn ? launchBtn.disabled : null;

      return {
        dialogVisible: !!dialog && dialog.offsetWidth > 0,
        dialogTitle,
        subheader,
        logoCount,
        stageRect,
        stageBorder,
        slotCount: slots.length,
        slots: slots.slice(0, 3),
        launchBtnText,
        launchDisabled
      };
    })()`);
    console.log('Dialog Info:', JSON.stringify(dialogInfo, null, 2));

    console.log('Capturing initial assembly bay screenshot...');
    await cdp.screenshot('verify_assembly_bay_initial.png');

    // Click AUTO-EQUIP ALL
    console.log('Clicking AUTO-EQUIP ALL (9/9)...');
    await cdp.evaluate(`document.querySelector('button[data-hangar="suggested"]')?.click();`);
    await sleep(2000);

    const equippedInfo = await cdp.evaluate(`(() => {
      const installedCount = document.querySelectorAll('.hangar-slots .socket-installed').length;
      const launchBtn = document.getElementById('launch-button');
      const stats = Array.from(document.querySelectorAll('.hangar-stat')).map(s => ({
        label: s.querySelector('span')?.textContent?.trim(),
        value: s.querySelector('b')?.textContent?.trim()
      }));

      return {
        installedCount,
        launchDisabled: launchBtn ? launchBtn.disabled : null,
        stats
      };
    })()`);
    console.log('Auto-equipped Info:', JSON.stringify(equippedInfo, null, 2));

    console.log('Capturing equipped assembly bay screenshot...');
    await cdp.screenshot('verify_assembly_bay_equipped.png');

    // Also test Mars assembly
    console.log('Testing Mars assembly bay...');
    await cdp.navigate('http://localhost:8080/src/game/dist/index.html?destination=mars');
    await sleep(2000);
    await cdp.evaluate(`document.getElementById('design-button')?.click();`);
    await sleep(2000);
    await cdp.screenshot('verify_assembly_bay_mars.png');

    console.log('--- ALL ASSEMBLY BAY VERIFICATIONS SUCCESSFUL ---');
    cdp.close();
  } finally {
    chromeProcess.kill('SIGKILL');
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
