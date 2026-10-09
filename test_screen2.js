const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9229;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(1500);
  const targetsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  function send(method, params = {}) {
    return new Promise(res => {
      const msgId = id++;
      const onMsg = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === msgId) {
          ws.removeEventListener('message', onMsg);
          res(d.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to index.html...');
  await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
  await sleep(2500);

  // Dismiss boot sequence completely
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.bootCompleted = true;
      const ov = document.getElementById('bootOverlay');
      if (ov) { ov.remove(); }
      const s1 = document.getElementById('screen1Container');
      const s2 = document.getElementById('screen2Stage');
      const btn = document.getElementById('initiateBtn');
      console.log('Btn exists:', !!btn);
      btn.click();
    })()`
  });
  await sleep(2500);

  const state = await send('Runtime.evaluate', {
    expression: `({
      screenState: window.currentScreenState,
      s1Hidden: document.getElementById('screen1Container')?.classList.contains('hidden'),
      s2Active: document.getElementById('screen2Stage')?.classList.contains('active'),
      carouselCards: document.querySelectorAll('.carousel-3d-card').length,
      earthCard: !!document.querySelector('.card-view-dossier-btn[data-planet="earth"]')
    })`,
    returnByValue: true
  });
  console.log('Screen 2 state after click:', state.result.value);

  // Take screenshot of Screen 2
  const snap = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_screen2_target_selector.png'), Buffer.from(snap.data, 'base64'));
  console.log('Saved verify_screen2_target_selector.png');

  // Click Earth Dossier
  console.log('Clicking Earth dossier...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const earthBtn = document.querySelector('.card-view-dossier-btn[data-planet="earth"]');
      earthBtn.click();
    })()`
  });
  await sleep(3500);

  const iframeCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const iframe = document.getElementById('auroraGameIframe');
      const gv = document.getElementById('screen2GameView');
      return {
        iframeFound: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        gameViewActive: gv ? gv.classList.contains('active') : false
      };
    })()`,
    returnByValue: true
  });
  console.log('Iframe check after click:', iframeCheck.result.value);

  const snap2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_screen2_earth_game_mounted.png'), Buffer.from(snap2.data, 'base64'));
  console.log('Saved verify_screen2_earth_game_mounted.png');

  // Return to Carousel
  console.log('Returning to carousel...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      if (typeof returnToCarouselFromGame === 'function') returnToCarouselFromGame();
    })()`
  });
  await sleep(1500);

  const returnState = await send('Runtime.evaluate', {
    expression: `({
      carouselVisible: document.getElementById('screen2CarouselView')?.style.display !== 'none',
      gameActive: document.getElementById('screen2GameView')?.classList.contains('active')
    })`,
    returnByValue: true
  });
  console.log('Return state:', returnState.result.value);

  const snap3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_screen2_returned_back.png'), Buffer.from(snap3.data, 'base64'));
  console.log('Saved verify_screen2_returned_back.png');

  ws.close();
  chrome.kill();
}

run();
