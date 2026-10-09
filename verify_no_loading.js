const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9260;
const ARTIFACT_DIR = 'C:/Users/User/.gemini/antigravity/brain/7c2115e4-f5e4-4377-8f97-4580f398b460';

console.log('Spawning headless Chrome to verify loading screen elimination...');
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

      console.log('Navigating directly to game: http://localhost:8080/src/game/dist/index.html?destination=mars');
      await send('Page.navigate', { url: `http://localhost:8080/src/game/dist/index.html?v=${Date.now()}&destination=mars` });
      
      // Wait 1.5 seconds (earlier, loading screen was shown here)
      await new Promise(r => setTimeout(r, 1500));

      const loadingCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const loading = document.getElementById('loading');
          const loadingScreen = document.querySelector('.loading-screen');
          return {
            loadingExists: !!loading,
            loadingDisplay: loading ? getComputedStyle(loading).display : null,
            loadingOpacity: loading ? getComputedStyle(loading).opacity : null,
            loadingVisibility: loading ? getComputedStyle(loading).visibility : null,
            loadingHidden: loading ? loading.hidden : null,
            menuViewDisplay: document.getElementById('menu-view') ? getComputedStyle(document.getElementById('menu-view')).display : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Loading Check Result (1.5s after load):', loadingCheck.result.value);

      // Capture screenshot at 1.5s - verify no loading screen visible
      const ssEarly = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'no_loading_screen_verified.png'), Buffer.from(ssEarly.data, 'base64'));
      console.log('Saved no_loading_screen_verified.png');

      // Wait additional 2.5s for 3D elements to spin
      await new Promise(r => setTimeout(r, 2500));
      const ssFull = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'game_active_immediate.png'), Buffer.from(ssFull.data, 'base64'));
      console.log('Saved game_active_immediate.png');

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Test failed:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1000);
