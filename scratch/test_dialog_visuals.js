const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9268;
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

      // Inject the complete dialog HTML directly into #dialog and show modal-layer
      console.log('Rendering complete dialog...');
      await send('Runtime.evaluate', {
        expression: `
          const dialog = document.getElementById('dialog');
          const modal = document.getElementById('modal-layer');
          const rank = 'S';
          const result = { score: 248, rank: 'S', time: 345, hull: 92, collisions: 0 };
          dialog.className = 'dialog complete-dialog';
          dialog.innerHTML = \`
            <div class="rank-badge">\${rank}</div>
            <span class="eyebrow">EXPEDITION COMPLETE / MARS</span>
            <h2 id="dialog-title">YOU BROUGHT THE STORY HOME.</h2>
            <p class="dialog-lead">Ares Station telemetry and the Jezero core archive have been successfully recovered.</p>
            <p>The complete archive survived the journey. Every measurement and every recorded voice is now safely on Earth.</p>
            <div class="debrief-stats">
              <div><b>\${result.score}</b><span>SCIENCE RETURN</span></div>
              <div><b>\${result.hull}%</b><span>VEHICLE INTEGRITY</span></div>
              <div><b>05:45</b><span>FLIGHT TIME</span></div>
              <div><b>\${result.collisions}</b><span>COLLISIONS</span></div>
            </div>
            <div class="briefing-fact">
              <span>⌬</span>
              <p>NASA's Mars Sample Return mission concepts aim to retrieve core tubes cached by Perseverance.<br><a href="#" style="color:var(--cyan)">Explore the NASA science ↗</a></p>
            </div>
            <div class="dialog-actions">
              <button class="primary-button" data-menu><span>CHOOSE THE NEXT FRONTIER</span><b>↗</b></button>
              <button class="outline-button" id="export-button">EXPORT MISSION LOG ↓</button>
            </div>
          \`;
          modal.hidden = false;
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      const shotComplete = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_complete_dialog_visual.png'), Buffer.from(shotComplete.data, 'base64'));

      // Now let's test failed dialog
      console.log('Rendering failed dialog...');
      await send('Runtime.evaluate', {
        expression: `
          dialog.className = 'dialog failed-dialog';
          dialog.innerHTML = \`
            <span class="eyebrow">MISSION INTERRUPTED</span>
            <h2 id="dialog-title">HULL INTEGRITY LOST</h2>
            <p>The vehicle can no longer maintain a safe flight. Return to the stage checkpoint and approach more carefully.</p>
            <div class="dialog-actions">
              <button class="primary-button" id="retry-button"><span>RETRY STAGE CHECKPOINT</span><b>↗</b></button>
              <button class="outline-button" data-menu>MISSION SELECTION</button>
            </div>
          \`;
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      const shotFailed = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_failed_dialog_visual.png'), Buffer.from(shotFailed.data, 'base64'));

      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
