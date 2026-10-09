const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9266;
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

      // Test Case 1: Complete mission dialog
      console.log('Simulating mission completion...');
      await send('Runtime.evaluate', {
        expression: `
          // Start simulation and trigger complete
          document.getElementById('design-button')?.click();
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', {
        expression: `
          document.getElementById('launch-button')?.click();
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', {
        expression: `
          document.getElementById('begin-stage')?.click();
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      // Now evaluate completeMission or trigger complete
      console.log('Triggering completeMission...');
      await send('Runtime.evaluate', {
        expression: `
          // Set some score
          if (window.sim) {
            window.sim.score = 240;
            window.sim.hull = 88;
            window.sim.time = 384;
            window.sim.collisions = 1;
          }
          // Call completeMission if exposed or emit complete
          if (typeof completeMission === 'function') {
            completeMission();
          } else if (window.sim) {
            window.sim.emit('complete');
          }
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const shotComplete = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_game_end_complete.png'), Buffer.from(shotComplete.data, 'base64'));

      // Check dialog content
      const dialogInfo = await send('Runtime.evaluate', {
        expression: `
          JSON.stringify({
            dialogOpen: !document.getElementById('modal-layer')?.hidden,
            dialogClasses: document.getElementById('dialog')?.className,
            dialogHtml: document.getElementById('dialog')?.innerHTML.substring(0, 500),
            hasDebriefStats: !!document.querySelector('.debrief-stats'),
            debriefStatsHtml: document.querySelector('.debrief-stats')?.innerHTML
          })
        `
      });
      console.log('Dialog Info (complete):', dialogInfo.result?.value);

      // Test Case 2: Failed mission dialog
      console.log('Triggering failed event...');
      await send('Runtime.evaluate', {
        expression: `
          if (window.sim) {
            window.sim.emit('failed', {
              title: 'CRITICAL IMPACT DETECTED',
              message: 'Severe kinetic collision breached the primary hull structure.'
            });
          }
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const shotFailed = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_game_end_failed.png'), Buffer.from(shotFailed.data, 'base64'));

      const failedInfo = await send('Runtime.evaluate', {
        expression: `
          JSON.stringify({
            dialogOpen: !document.getElementById('modal-layer')?.hidden,
            dialogClasses: document.getElementById('dialog')?.className,
            dialogHtml: document.getElementById('dialog')?.innerHTML.substring(0, 500)
          })
        `
      });
      console.log('Dialog Info (failed):', failedInfo.result?.value);

      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
