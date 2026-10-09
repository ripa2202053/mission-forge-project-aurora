const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9228;

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

    console.log('Navigating to http://localhost:8080/ ...');
    await cdp.navigate('http://localhost:8080/');
    await sleep(2000);

    // Click #initiateBtn
    console.log('Clicking #initiateBtn...');
    await cdp.evaluate(`(() => {
      const btn = document.getElementById('initiateBtn');
      if (btn) btn.click();
    })()`);
    await sleep(2500);

    await cdp.screenshot('debug_screen1_destination_selector.png');

    // Click VIEW DOSSIER on Mars (Card 2)
    console.log('Clicking VIEW DOSSIER on Mars...');
    const clickRes = await cdp.evaluate(`(() => {
      const marsBtn = document.querySelector('.card-view-dossier-btn[data-planet="mars"]');
      if (marsBtn) {
        marsBtn.click();
        return 'mars-btn-clicked';
      }
      return 'mars-btn-not-found';
    })()`);
    console.log('Click result:', clickRes);

    await sleep(3500);
    await cdp.screenshot('debug_screen2_after_view_dossier.png');

    const checkState = await cdp.evaluate(`(() => {
      const iframe = document.getElementById('auroraGameIframe');
      let iframeDoc = null;
      try {
        iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
      } catch(e){}

      return {
        screen2GameViewActive: document.getElementById('screen2GameView')?.classList.contains('active'),
        iframeExists: !!iframe,
        iframeSrc: iframe?.src,
        iframeCanvas: !!iframeDoc?.querySelector('#world canvas'),
        iframePlanetVisible: !!iframeDoc?.querySelector('#world'),
        bodyClass: document.body.className
      };
    })()`);
    console.log('State after click:', JSON.stringify(checkState, null, 2));

    cdp.close();
  } finally {
    chromeProcess.kill('SIGKILL');
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
