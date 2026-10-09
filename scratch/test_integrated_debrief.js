const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9288;
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

      console.log('Navigating to http://localhost:8080/src/game/dist/index.html...');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html' });
      await new Promise(r => setTimeout(r, 2500));

      // 1. Trigger Complete Mission
      console.log('Triggering complete mission in game...');
      await send('Runtime.evaluate', {
        expression: `
          const mockSim = {
            score: 228,
            hull: 88,
            time: 342,
            collisions: 1,
            stage: 5,
            fuel: 75,
            power: 86,
            fullArchive: true,
            destination: {
              name: 'Mars',
              id: 'mars',
              science: 'Atmospheric aero-braking and chemical/ion staging determine optimal return trajectory margins.',
              source: 'https://science.nasa.gov'
            }
          };
          const html = window.buildDebriefCarousel(mockSim, false, null);
          window.showDialog('complete', html, true);
          window.initDebriefCarousel(mockSim, false, null, { score: 228, rank: 'A+', time: 342, hull: 88, destination: 'Mars' });
        `
      });

      await new Promise(r => setTimeout(r, 1000));

      // Shot 1: Card 0 (MISSION TELEMETRY)
      const shot0 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_complete_carousel_card0.png'), Buffer.from(shot0.data, 'base64'));
      console.log('Captured verify_complete_carousel_card0.png');

      // Click Next Chevron -> Card 1 (PERFORMANCE GAPS)
      await send('Runtime.evaluate', { expression: `document.getElementById('carouselNext').click()` });
      await new Promise(r => setTimeout(r, 800));

      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_complete_carousel_card1.png'), Buffer.from(shot1.data, 'base64'));
      console.log('Captured verify_complete_carousel_card1.png');

      // Click Next Chevron -> Card 2 (AEROSPACE INSIGHTS)
      await send('Runtime.evaluate', { expression: `document.getElementById('carouselNext').click()` });
      await new Promise(r => setTimeout(r, 800));

      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_complete_carousel_card2.png'), Buffer.from(shot2.data, 'base64'));
      console.log('Captured verify_complete_carousel_card2.png');

      // Click Next Chevron -> Card 3 (FLIGHT DIRECTIVE)
      await send('Runtime.evaluate', { expression: `document.getElementById('carouselNext').click()` });
      await new Promise(r => setTimeout(r, 800));

      const shot3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_complete_carousel_card3.png'), Buffer.from(shot3.data, 'base64'));
      console.log('Captured verify_complete_carousel_card3.png');

      // 2. Trigger Failed Mission Dialog
      console.log('Triggering failed mission in game...');
      await send('Runtime.evaluate', {
        expression: `
          const failSim = {
            score: 110,
            hull: 0,
            time: 215,
            collisions: 3,
            stage: 2,
            fuel: 12,
            power: 28,
            destination: {
              name: 'Mars',
              id: 'mars',
              science: 'Atmospheric aero-braking requires strict velocity deceleration prior to interface.',
              source: 'https://science.nasa.gov'
            }
          };
          const failEvent = {
            type: 'failed',
            title: 'STRUCTURAL DECELERATION OVERLOAD',
            message: 'Vehicle speed exceeded dynamic pressure tolerance during Martian orbital capture corridor.'
          };
          const html = window.buildDebriefCarousel(failSim, true, failEvent);
          window.showDialog('failed', html, true);
          window.initDebriefCarousel(failSim, true, failEvent, { score: 110, rank: 'F', time: 215, hull: 0, destination: 'Mars' });
        `
      });

      await new Promise(r => setTimeout(r, 1000));

      const shotFail = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_failed_carousel_card0.png'), Buffer.from(shotFail.data, 'base64'));
      console.log('Captured verify_failed_carousel_card0.png');

      console.log('All screenshots captured successfully!');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
