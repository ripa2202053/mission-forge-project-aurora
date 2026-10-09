const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9291;
const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';

const chrome = spawn(CHROME_PATH, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1600,1000'
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

      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html' });
      await new Promise(r => setTimeout(r, 2000));

      const res = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const failSim = {
              score: 95,
              hull: 0,
              time: 184,
              collisions: 4,
              stage: 1,
              fuel: 18,
              power: 24,
              destination: {
                name: 'Mars',
                id: 'mars',
                science: 'Interplanetary approach corridors require precision retro-burn timing.',
                source: 'https://science.nasa.gov'
              }
            };
            const failEvent = {
              type: 'failed',
              title: 'CRITICAL HULL DECOMPRESSION',
              message: 'Vehicle exceeded thermal and structural tolerance during corridor descent. Checkpoint saved.'
            };
            const html = window.buildDebriefCarousel(failSim, true, failEvent);
            window.showDialog('failed', html, true);
            window.initDebriefCarousel(failSim, true, failEvent, { score: 95, rank: 'F', time: 184, hull: 0, destination: 'Mars' });
            return 'SUCCESS';
          })()
        `
      });
      console.log('Evaluate result:', res);

      await new Promise(r => setTimeout(r, 1000));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_failed_carousel_card0.png'), Buffer.from(shot.data, 'base64'));
      console.log('Saved verify_failed_carousel_card0.png');

      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
