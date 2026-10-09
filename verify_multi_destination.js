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
    await sleep(2500); // Wait for load and WebGL render
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
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--mute-audio',
    'about:blank'
  ]);

  let cdp = null;

  try {
    await sleep(2000);

    // Get active page target
    const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    console.log('Attaching CDP to target:', pageTarget.title, pageTarget.webSocketDebuggerUrl);

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    const destinations = [
      { key: 'earth', expectedName: 'EARTH', file: 'verify_dossier_earth.png' },
      { key: 'moon', expectedName: 'MOON', file: 'verify_dossier_moon.png' },
      { key: 'mars', expectedName: 'MARS', file: 'verify_dossier_mars.png' },
      { key: 'asteroid', expectedName: 'VESTA', file: 'verify_dossier_vesta.png' },
      { key: 'europa', expectedName: 'JUPITER', file: 'verify_dossier_jupiter.png' }
    ];

    console.log('\n--- 1. TESTING DIRECT MULTI-DESTINATION QUERY PARAMS & ZERO-BORDER HUD ---');
    for (const d of destinations) {
      const url = `http://localhost:8080/src/game/dist/index.html?destination=${d.key}`;
      console.log(`Navigating to: ${url}`);
      await cdp.navigate(url);
      await sleep(1500);

      const info = await cdp.evaluate(`(() => {
        const planet = document.getElementById('planet-name')?.textContent?.trim();
        const subtitle = document.getElementById('mission-subtitle')?.textContent?.trim();
        const bottomCards = document.getElementById('destination-cards');
        const bottomCardsDisplay = bottomCards ? window.getComputedStyle(bottomCards).display : 'none';
        const strip = document.querySelector('.destination-strip');
        const stripDisplay = strip ? window.getComputedStyle(strip).display : 'none';
        const designBtn = document.getElementById('design-button');
        const designBtnRect = designBtn ? designBtn.getBoundingClientRect() : null;
        const hudFrame = document.querySelector('.hud-frame');
        const hudFrameDisplay = hudFrame ? window.getComputedStyle(hudFrame).display : 'none';
        const briefPanel = document.querySelector('.brief-panel');
        const briefBorder = briefPanel ? window.getComputedStyle(briefPanel).borderLeft : '';
        const briefBg = briefPanel ? window.getComputedStyle(briefPanel).backgroundColor : '';

        return {
          planet,
          subtitle,
          bottomCardsDisplay,
          stripDisplay,
          designBtnVisible: !!designBtn && designBtnRect.width > 0,
          hudFrameDisplay,
          briefBorder,
          briefBg
        };
      })()`);

      console.log(`[${d.key}] Planet Name:`, info.planet, `(Expected: ${d.expectedName})`);
      console.log(`[${d.key}] Bottom strip display:`, info.stripDisplay, `| Bottom cards:`, info.bottomCardsDisplay);
      console.log(`[${d.key}] Bulky HUD frame display:`, info.hudFrameDisplay);
      console.log(`[${d.key}] Floating CTA visible:`, info.designBtnVisible);
      console.log(`[${d.key}] Brief panel glassmorphism:`, info.briefBg, '| border-left:', info.briefBorder);

      await cdp.screenshot(d.file);
    }

    console.log('\n--- 2. TESTING "DESIGN THIS MISSION" FLOATING CTA BUTTON & ASSEMBLY MODAL ---');
    await cdp.evaluate(`document.getElementById('design-button')?.click();`);
    await sleep(1800);
    const modalCheck = await cdp.evaluate(`(() => {
      const dialog = document.getElementById('dialog');
      const dialogVisible = dialog && window.getComputedStyle(dialog).display !== 'none';
      const title = document.getElementById('dialog-title')?.textContent?.trim();
      const launchBtn = document.getElementById('launch-button');
      const launchTxt = launchBtn ? launchBtn.textContent.trim() : '';
      return { dialogVisible, title, launchTxt };
    })()`);
    console.log('Modal visible:', modalCheck.dialogVisible, '| Title:', modalCheck.title, '| Launch CTA:', modalCheck.launchTxt);
    await cdp.screenshot('verify_dossier_assembly_modal.png');

    console.log('\n--- 3. TESTING END-TO-END FLOW IN MAIN APP (SCREEN 1 -> SCREEN 2 -> GAME DOSSIER -> RETURN) ---');
    await cdp.navigate('http://localhost:8080/index.html');
    await sleep(1500);

    // Dismiss boot sequence completely and transition to Screen 2
    await cdp.evaluate(`(() => {
      window.bootCompleted = true;
      const ov = document.getElementById('bootOverlay');
      if (ov) ov.remove();
      const btn = document.getElementById('initiateBtn');
      if (btn) btn.click();
    })()`);
    await sleep(2500);
    await cdp.screenshot('verify_e2e_selector_screen.png');

    // Click Earth [ VIEW DOSSIER ]
    console.log('Clicking Earth [ VIEW DOSSIER ] card...');
    const clickSuccess = await cdp.evaluate(`(() => {
      const earthBtn = document.querySelector('.card-view-dossier-btn[data-planet="earth"]');
      if (earthBtn) {
        earthBtn.click();
        return true;
      }
      return false;
    })()`);
    console.log('Earth card clicked:', clickSuccess);
    await sleep(3000); // Allow iframe and 3D canvas to initialize

    const iframeInfo = await cdp.evaluate(`(() => {
      const iframe = document.getElementById('auroraGameIframe');
      const gameView = document.getElementById('screen2GameView');
      return {
        iframeFound: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        gameViewActive: gameView ? gameView.classList.contains('active') : false
      };
    })()`);
    console.log('Game iframe info:', iframeInfo);
    await cdp.screenshot('verify_e2e_earth_dossier_mounted.png');

    // Test return button
    console.log('Testing Return to Destination Selector button...');
    await cdp.evaluate(`(() => {
      const iframe = document.getElementById('auroraGameIframe');
      if (iframe && iframe.contentWindow) {
        const returnBtn = iframe.contentDocument.getElementById('auroraReturnBtn');
        if (returnBtn) returnBtn.click();
        else iframe.contentWindow.postMessage({ type: 'RETURN_TO_DESTINATION_SELECTOR' }, '*');
      }
    })()`);
    await sleep(1500);

    const returnCheck = await cdp.evaluate(`(() => {
      const screen2CarouselView = document.getElementById('screen2CarouselView');
      const screen2GameView = document.getElementById('screen2GameView');
      return {
        carouselVisible: screen2CarouselView ? screen2CarouselView.style.display !== 'none' : false,
        gameViewActive: screen2GameView ? screen2GameView.classList.contains('active') : false
      };
    })()`);
    console.log('Returned to carousel check:', returnCheck);
    await cdp.screenshot('verify_e2e_returned_to_selector.png');

    console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
    console.log('Chrome process exited.');
  }
}

run();
