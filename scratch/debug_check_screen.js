const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9245;
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

      console.log('--- Testing direct URL: /src/game/dist/index.html?destination=mars ---');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=mars' });
      await new Promise(r => setTimeout(r, 3000));

      const directDiag = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          menuViewDisplay: window.getComputedStyle(document.getElementById('menu-view')).display,
          briefPanelDisplay: window.getComputedStyle(document.querySelector('.brief-panel')).display,
          briefPanelOpacity: window.getComputedStyle(document.querySelector('.brief-panel')).opacity,
          briefPanelVisibility: window.getComputedStyle(document.querySelector('.brief-panel')).visibility,
          worldCanvasExists: !!document.querySelector('#world canvas'),
          worldCanvasSize: document.querySelector('#world canvas') ? { w: document.querySelector('#world canvas').width, h: document.querySelector('#world canvas').height } : null,
          planetName: document.getElementById('planet-name')?.textContent,
          designBtn: !!document.getElementById('design-button')
        })`
      });
      console.log('Direct Diag:', directDiag.result?.value);

      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_direct_mars.png'), Buffer.from(shot1.data, 'base64'));

      console.log('--- Testing root URL: http://localhost:8080/ ---');
      await send('Page.navigate', { url: 'http://localhost:8080/' });
      await new Promise(r => setTimeout(r, 4500)); // wait for boot sequence

      // Click VIEW DOSSIER on Mars card
      const clickResult = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('.card-view-dossier-btn[data-planet="mars"]');
          if (btn) {
            btn.click();
            return 'clicked mars dossier btn';
          }
          const altBtn = document.querySelector('.carousel-3d-card.active .card-view-dossier-btn');
          if (altBtn) {
            altBtn.click();
            return 'clicked active card dossier btn';
          }
          return 'btn not found';
        })()`
      });
      console.log('Click result:', clickResult.result?.value);

      await new Promise(r => setTimeout(r, 3500));

      const rootDiag = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          screen2GameViewClass: document.getElementById('screen2GameView')?.className,
          screen2GameViewDisplay: document.getElementById('screen2GameView') ? window.getComputedStyle(document.getElementById('screen2GameView')).display : null,
          iframeSrc: document.getElementById('auroraGameIframe')?.src,
          iframeOffsetH: document.getElementById('auroraGameIframe')?.offsetHeight,
          iframeOffsetW: document.getElementById('auroraGameIframe')?.offsetWidth
        })`
      });
      console.log('Root Diag after click:', rootDiag.result?.value);

      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_root_after_click_mars.png'), Buffer.from(shot2.data, 'base64'));

      console.log('Screenshots saved. Done.');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
