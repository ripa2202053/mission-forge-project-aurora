const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9267;
const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';

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

      // Click DESIGN THIS MISSION
      await send('Runtime.evaluate', { expression: `document.getElementById('design-button')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      // Click COMMIT & LAUNCH
      await send('Runtime.evaluate', { expression: `document.getElementById('launch-button')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      // Moon has no planning dialog, goes straight to briefing
      await send('Runtime.evaluate', { expression: `document.getElementById('begin-stage')?.click()` });
      await new Promise(r => setTimeout(r, 1000));

      console.log('Flight initialized. Now testing completeMission...');
      await send('Runtime.evaluate', {
        expression: `
          // Find the sim instance and set score
          const sim = window.__sim || (window.audio && window.world ? (function(){
            // sim is in scope in main.js closure, but we can call completeMission or emit complete
            // Let's trigger complete event via audio/world or dispatch
            return true;
          })() : null);
        `
      });

      // Let's inspect window objects
      const testComplete = await send('Runtime.evaluate', {
        expression: `
          (function() {
            // Can we trigger handleEvent({type: 'complete'})?
            // In main.js, handleEvent is passed to sim.
            // Let's check how we can trigger complete:
            // What if we dispatch key or call completeMission?
            return typeof sim;
          })()
        `
      });
      console.log('sim typeof in page:', testComplete.result?.value);

      // Let's inspect what's on window or in main.js
      const debugInfo = await send('Runtime.evaluate', {
        expression: `
          JSON.stringify({
            dialogOpen: !document.getElementById('modal-layer')?.hidden,
            dialogClasses: document.getElementById('dialog')?.className,
            flightViewHidden: document.getElementById('flight-view')?.hidden
          })
        `
      });
      console.log('Flight status:', debugInfo.result?.value);

      // Now let's trigger completeMission by evaluating inside page context or simulating game end
      await send('Runtime.evaluate', {
        expression: `
          // We can simulate completion by calling showDialog('complete', ...) directly or calling sim methods
          // Let's check what functions are available
        `
      });

      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
