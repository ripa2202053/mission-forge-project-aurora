const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;

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

async function getWsUrl(port) {
  for (let i = 0; i < 20; i++) {
    try {
      const list = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        return list[0].webSocketDebuggerUrl;
      }
    } catch (e) {
      await sleep(500);
    }
  }
  throw new Error('Failed to get WebSocket debugger URL');
}

async function run() {
  console.log('Launching headless Chrome on port', PORT);
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,900',
    '--disable-extensions',
    '--mute-audio',
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl(PORT);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1600,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('Navigating to http://localhost:8080/ ...');
    await client.navigate('http://localhost:8080/');
    await sleep(2000);

    // Direct navigate to Moon dossier
    console.log('Opening Moon dossier screen...');
    await client.evaluate(`
      (() => {
        // Trigger Moon destination
        if (typeof openDestinationDetail === 'function') {
          openDestinationDetail('moon');
        } else {
          const btns = Array.from(document.querySelectorAll('.card-action-btn, button'));
          const moonBtn = btns.find(b => b.closest('#card-moon') || b.textContent.includes('MOON'));
          if (moonBtn) moonBtn.click();
        }
      })()
    `);
    await sleep(3500);

    console.log('Capturing Moon dossier screenshot...');
    await client.screenshot('verify_moon_unobstructed.png');

    // Also test Mars
    console.log('Switching to Mars dossier...');
    await client.evaluate(`
      (() => {
        if (typeof openDestinationDetail === 'function') {
          openDestinationDetail('mars');
        }
      })()
    `);
    await sleep(3500);

    console.log('Capturing Mars dossier screenshot...');
    await client.screenshot('verify_mars_unobstructed.png');

    // Also inspect iframe elements
    const hudInfo = await client.evaluate(`
      (() => {
        const iframe = document.getElementById('auroraGameIframe');
        if (!iframe || !iframe.contentDocument) return { error: 'No iframe content' };
        const doc = iframe.contentDocument;
        const topCoord = doc.querySelector('.planet-coordinate.top');
        const bottomCoord = doc.querySelector('.planet-coordinate.bottom');
        const svg = doc.querySelector('.planet-overlay svg');
        const navBtns = Array.from(doc.querySelectorAll('.nav-button')).map(b => ({
          text: b.textContent.trim(),
          classes: b.className
        }));
        const ctaBtn = doc.querySelector('#design-button');
        
        return {
          topCoordRect: topCoord ? topCoord.getBoundingClientRect() : null,
          bottomCoordRect: bottomCoord ? bottomCoord.getBoundingClientRect() : null,
          svgDisplay: svg ? window.getComputedStyle(svg).display : null,
          navBtns,
          ctaBtnText: ctaBtn ? ctaBtn.textContent.trim() : null
        };
      })()
    `);
    console.log('HUD Elements Info:', JSON.stringify(hudInfo, null, 2));

    client.close();
  } finally {
    chromeProcess.kill('SIGKILL');
    console.log('Chrome process terminated');
  }
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
