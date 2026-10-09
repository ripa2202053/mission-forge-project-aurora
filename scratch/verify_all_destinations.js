const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9250;
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

      console.log('Navigating to http://localhost:8080/');
      await send('Page.navigate', { url: 'http://localhost:8080/' });
      await new Promise(r => setTimeout(r, 4500)); // wait for boot progress

      // Dismiss boot overlay
      console.log('Dismissing boot overlay...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const b1 = document.getElementById('bootEnterBtn');
          if (b1) b1.click();
          if (typeof finishBootSequence === 'function') finishBootSequence();
        })()`
      });
      await new Promise(r => setTimeout(r, 2000));

      // Enter Mission Control on Screen 1 to transition to Screen 2 Carousel
      console.log('Transitioning to Screen 2 Carousel...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const b2 = document.getElementById('initiateBtn');
          if (b2) b2.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 2500));

      const capture = async (name) => {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, `${name}.png`), Buffer.from(shot.data, 'base64'));
        console.log(`Saved screenshot: ${name}.png`);
      };

      await capture('e2e_1_destination_selector');

      // Test Mars Dossier
      console.log('Opening Mars Mission Dossier...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.card-view-dossier-btn[data-planet="mars"]');
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 3500));
      await capture('e2e_2_mars_mission_briefing');

      // Test Return to Selector
      console.log('Returning to Destination Selector...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const iframe = document.getElementById('auroraGameIframe');
          if (iframe && iframe.contentDocument) {
            const retBtn = iframe.contentDocument.getElementById('auroraReturnBtn');
            if (retBtn) retBtn.click();
          } else {
            const ret = document.getElementById('gameReturnToSelectorBtn');
            if (ret) ret.click();
          }
        })()`
      });
      await new Promise(r => setTimeout(r, 2500));
      await capture('e2e_3_returned_to_selector');

      // Test Earth Dossier
      console.log('Opening Earth Mission Dossier...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.card-view-dossier-btn[data-planet="earth"]');
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 3500));
      await capture('e2e_4_earth_mission_briefing');

      // Return
      await send('Runtime.evaluate', {
        expression: `(() => {
          const iframe = document.getElementById('auroraGameIframe');
          if (iframe && iframe.contentDocument) {
            const retBtn = iframe.contentDocument.getElementById('auroraReturnBtn');
            if (retBtn) retBtn.click();
          }
        })()`
      });
      await new Promise(r => setTimeout(r, 2500));

      // Test Moon Dossier
      console.log('Opening Moon Mission Dossier...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.card-view-dossier-btn[data-planet="moon"]');
          if (btn) btn.click();
        })()`
      });
      await new Promise(r => setTimeout(r, 3500));
      await capture('e2e_5_moon_mission_briefing');

      console.log('All destination tests completed successfully!');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
