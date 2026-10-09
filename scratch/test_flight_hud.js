const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9269;
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

      console.log('Navigating to game Moon destination...');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=moon' });
      await new Promise(r => setTimeout(r, 2000));

      await send('Runtime.evaluate', { expression: `document.getElementById('design-button')?.click()` });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: `document.getElementById('launch-button')?.click()` });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: `document.getElementById('begin-stage')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      const shotFlight = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_flight_hud.png'), Buffer.from(shotFlight.data, 'base64'));

      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
