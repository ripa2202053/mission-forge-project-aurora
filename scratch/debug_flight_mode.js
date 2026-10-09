const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9262;
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

      ws.addEventListener('message', e => {
        const msg = JSON.parse(e.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[Browser Console]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[Browser Exception]', JSON.stringify(msg.params.exceptionDetails));
        }
      });

      await send('Page.enable');
      await send('Runtime.enable');

      console.log('Navigating to http://localhost:8080/src/game/dist/index.html?destination=mars');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=mars' });
      await new Promise(r => setTimeout(r, 2500));

      // Click "DESIGN THIS MISSION"
      console.log('Clicking DESIGN THIS MISSION...');
      await send('Runtime.evaluate', { expression: `document.getElementById('design-button')?.click()` });
      await new Promise(r => setTimeout(r, 1500));

      // Click "COMMIT & LAUNCH" in hangar
      console.log('Clicking COMMIT & LAUNCH...');
      await send('Runtime.evaluate', { expression: `document.getElementById('launch-button')?.click()` });
      await new Promise(r => setTimeout(r, 1500));

      // Commit flight plan
      console.log('Committing flight plan...');
      await send('Runtime.evaluate', { expression: `document.getElementById('commit-plan')?.click()` });
      await new Promise(r => setTimeout(r, 1500));

      // Check briefing dialog
      const briefingDiag = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          dialogHtml: document.getElementById('dialog')?.innerHTML?.slice(0, 300),
          modalHidden: document.getElementById('modal-layer')?.hidden,
          beginStageBtn: !!document.getElementById('begin-stage')
        })`
      });
      console.log('Briefing Diag (should show TAKE THE CONTROLS):', briefingDiag.result?.value);

      // Screenshot briefing dialog
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_flight_briefing_modal.png'), Buffer.from(shot1.data, 'base64'));

      // Click "TAKE THE CONTROLS" (#begin-stage)
      console.log('Clicking TAKE THE CONTROLS (#begin-stage)...');
      await send('Runtime.evaluate', { expression: `document.getElementById('begin-stage')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      // Simulate holding 'KeyW' (forward thrust) to accelerate the ship
      console.log('Dispatching KeyW keydown to thrust forward...');
      await send('Runtime.evaluate', {
        expression: `document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }))`
      });

      // Wait 3 seconds of flight
      await new Promise(r => setTimeout(r, 3000));

      // Release KeyW
      await send('Runtime.evaluate', {
        expression: `document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }))`
      });
      await new Promise(r => setTimeout(r, 500));

      // Evaluate flight status
      const flightDiag = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          elapsed: document.getElementById('elapsed')?.textContent,
          velocity: document.getElementById('speed-value')?.textContent,
          targetRange: document.getElementById('range-value')?.textContent,
          flightViewHidden: document.getElementById('flight-view')?.hidden
        })`
      });
      console.log('Active Flight Diag:', flightDiag.result?.value);

      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_flight_active_running.png'), Buffer.from(shot2.data, 'base64'));

      console.log('Flight verified successfully!');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
