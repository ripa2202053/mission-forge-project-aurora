const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9265;
const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';

const chrome = spawn(CHROME_PATH, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1920,1080'
]);

setTimeout(async () => {
  try {
    const tabs = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${PORT}/json/list`, r => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => res(JSON.parse(body)));
      }).on('error', rej);
    });

    const tab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = async () => {
      let id = 1;
      const send = (method, params = {}) => new Promise((resolve, reject) => {
        const curId = id++;
        const handler = e => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

      await send('Page.enable');
      await send('Runtime.enable');

      console.log('Navigating to game...');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=mars' });
      await new Promise(r => setTimeout(r, 2000));

      // Click DESIGN THIS MISSION
      console.log('Opening assembly bay...');
      await send('Runtime.evaluate', { expression: `document.getElementById('design-button')?.click()` });
      await new Promise(r => setTimeout(r, 1500));

      // Capture screenshot of Step 1 (Propulsion)
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_scaled_cards_step1.png'), Buffer.from(shot1.data, 'base64'));

      // Switch to Step 5 (Communications)
      console.log('Switching to Step 5 (Communications)...');
      await send('Runtime.evaluate', { expression: `document.querySelector('[data-slot="4"]')?.click()` });
      await new Promise(r => setTimeout(r, 1500));

      // Capture screenshot of Step 5 (Communications: 01 LIGHTWEIGHT, 02 DEEP SPACE, 03 REDUNDANT)
      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_scaled_cards_step5_comm.png'), Buffer.from(shot2.data, 'base64'));

      // Click card 2 (Deep Space) to test selection & logic
      console.log('Clicking card 2 (Deep Space)...');
      await send('Runtime.evaluate', { expression: `document.querySelector('[data-part="1"]')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      // Capture screenshot with card 2 selected
      const shot3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_scaled_cards_step5_selected.png'), Buffer.from(shot3.data, 'base64'));

      // Check commit & launch readiness
      const readyCheck = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          launchDisabled: document.getElementById('launch-button')?.disabled,
          readinessText: document.getElementById('assembly-readiness')?.textContent
        })`
      });
      console.log('Launch readiness check:', readyCheck.result?.value);

      console.log('Done capturing scaled cards screenshots.');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
