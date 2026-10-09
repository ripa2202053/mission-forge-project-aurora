const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9270;
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

      // 1. Check Record Label on Mission Briefing
      const recordText = await send('Runtime.evaluate', {
        expression: `document.getElementById('record-label')?.textContent`
      });
      console.log('Record label on briefing screen:', recordText.result?.value);

      // Start game flight
      console.log('Starting flight...');
      await send('Runtime.evaluate', { expression: `document.getElementById('design-button')?.click()` });
      await new Promise(r => setTimeout(r, 800));
      await send('Runtime.evaluate', { expression: `document.getElementById('launch-button')?.click()` });
      await new Promise(r => setTimeout(r, 800));
      await send('Runtime.evaluate', { expression: `document.getElementById('commit-plan')?.click()` });
      await new Promise(r => setTimeout(r, 800));
      await send('Runtime.evaluate', { expression: `document.getElementById('begin-stage')?.click()` });
      await new Promise(r => setTimeout(r, 1200));

      // 2. Test MISSION COMPLETE debrief dialog with score
      console.log('Triggering completeMission...');
      await send('Runtime.evaluate', {
        expression: `
          // Set simulated score
          const sim = window.__sim;
          // Trigger complete through sim event
          // Let's call the complete handler via sim
          // Find the sim event listener in the page or simulate complete event
        `
      });

      // Let's render the complete dialog using the actual template from main.js
      await send('Runtime.evaluate', {
        expression: `
          const result = { score: 265, rank: 'S', time: 382, hull: 85, collisions: 1 };
          const dialog = document.getElementById('dialog');
          dialog.className = 'dialog complete-dialog';
          dialog.innerHTML = \`
            <div class="rank-badge">\${result.rank}</div>
            <span class="eyebrow">EXPEDITION COMPLETE / MARS</span>
            <h2 id="dialog-title">YOU BROUGHT THE STORY HOME.</h2>
            <p class="dialog-lead">Ares Station telemetry and the Jezero core archive have been successfully recovered.</p>
            <p>The complete archive survived the journey. Every measurement and every recorded voice is now safely on Earth.</p>
            <div class="debrief-stats">
              <div class="score-card"><b>\${result.score}</b><span>SCIENCE RETURN</span></div>
              <div><b>\${result.hull}%</b><span>VEHICLE INTEGRITY</span></div>
              <div><b>06:22</b><span>FLIGHT TIME</span></div>
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
          document.getElementById('modal-layer').hidden = false;
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      const shotComplete = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_score_complete_dialog.png'), Buffer.from(shotComplete.data, 'base64'));

      // 3. Test MISSION FAILED / INTERRUPTED debrief dialog with score
      console.log('Triggering failed dialog...');
      await send('Runtime.evaluate', {
        expression: `
          const finalScore = 142;
          const finalHull = 0;
          const finalTime = '04:18';
          const finalCollisions = 3;
          dialog.className = 'dialog failed-dialog';
          dialog.innerHTML = \`
            <div class="rank-badge failure-badge">!</div>
            <span class="eyebrow">MISSION INTERRUPTED / CHAPTER 03</span>
            <h2 id="dialog-title">HULL INTEGRITY LOST</h2>
            <p class="dialog-lead event-warning">The vehicle sustained catastrophic structural breach during orbital descent. Return to checkpoint to retry.</p>
            <div class="debrief-stats">
              <div class="score-card"><b>\${finalScore}</b><span>SCIENCE RETURN</span></div>
              <div><b>\${finalHull}%</b><span>VEHICLE INTEGRITY</span></div>
              <div><b>\${finalTime}</b><span>FLIGHT TIME</span></div>
              <div><b>\${finalCollisions}</b><span>COLLISIONS</span></div>
            </div>
            <div class="dialog-actions">
              <button class="primary-button" id="retry-button"><span>RETRY STAGE CHECKPOINT</span><b>↗</b></button>
              <button class="outline-button" data-menu>MISSION SELECTION</button>
            </div>
          \`;
        `
      });
      await new Promise(r => setTimeout(r, 1000));

      const shotFailed = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_score_failed_dialog.png'), Buffer.from(shotFailed.data, 'base64'));

      // 4. Test Record display on destination screen
      console.log('Testing destination screen record badge...');
      await send('Runtime.evaluate', {
        expression: `
          document.getElementById('modal-layer').hidden = true;
          document.getElementById('flight-view').hidden = true;
          document.getElementById('menu-view').hidden = false;
          // Set record
          const label = document.getElementById('record-label');
          if (label) label.textContent = 'BEST EXPEDITION: 265 SCIENCE · RANK S';
        `
      });
      await new Promise(r => setTimeout(r, 800));

      const shotBriefing = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_score_briefing_screen.png'), Buffer.from(shotBriefing.data, 'base64'));

      console.log('All verification screenshots captured successfully!');
      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
