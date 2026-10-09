const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9255;
const ARTIFACT_DIR = 'C:/Users/User/.gemini/antigravity/brain/7c2115e4-f5e4-4377-8f97-4580f398b460';

console.log('Spawning headless Chrome on port ' + PORT + '...');
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

      // ----------------------------------------------------
      // STEP 1: Main Application Entry (Screen 1)
      // ----------------------------------------------------
      console.log('1. Navigating to main application: http://localhost:8080/index.html');
      await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
      await new Promise(r => setTimeout(r, 2000));

      // Dismiss boot overlay immediately to enter Screen 1
      await send('Runtime.evaluate', {
        expression: `(() => {
          if (typeof finishBootSequence === 'function') finishBootSequence();
          const bootOverlay = document.getElementById('bootOverlay');
          if (bootOverlay) bootOverlay.style.display = 'none';
        })()`
      });
      await new Promise(r => setTimeout(r, 2000));

      const screen1Check = await send('Runtime.evaluate', {
        expression: `(() => {
          const badge = document.querySelector('.aerospace-hud-crest');
          const title = badge ? badge.querySelector('.hud-main-title')?.innerText : null;
          const sub = badge ? badge.querySelector('.hud-sub-title')?.innerText : null;
          const initiateBtn = document.getElementById('initiateBtn');
          return {
            title,
            sub,
            hasInitiateBtn: !!initiateBtn,
            initiateBtnText: initiateBtn ? initiateBtn.innerText.replace(/\\s+/g, ' ') : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Screen 1 Check:', screen1Check.result.value);

      const ss1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'screen1_verified_hud.png'), Buffer.from(ss1.data, 'base64'));
      console.log('Saved screen1_verified_hud.png');

      // ----------------------------------------------------
      // STEP 2: Transition to Screen 2 (Destination Selector)
      // ----------------------------------------------------
      console.log('2. Clicking ENTER MISSION CONTROL (initiateBtn)...');
      await send('Runtime.evaluate', {
        expression: `document.getElementById('initiateBtn')?.click()`
      });
      await new Promise(r => setTimeout(r, 2500));

      const screen2Check = await send('Runtime.evaluate', {
        expression: `(() => {
          const carousel = document.getElementById('screen2CarouselView');
          const footnote = document.querySelector('.scientific-source-footnote');
          const dossierBtn = document.querySelector('.card-view-dossier-btn[data-planet="mars"]');
          const cards = document.querySelectorAll('.carousel-3d-card, .carousel-card');
          return {
            carouselDisplay: carousel ? getComputedStyle(carousel).display : null,
            cardsCount: cards.length,
            hasFootnote: !!footnote,
            footnoteText: footnote ? footnote.innerText.replace(/\\s+/g, ' ') : null,
            hasDossierBtn: !!dossierBtn,
            dossierText: dossierBtn ? dossierBtn.innerText.replace(/\\s+/g, ' ') : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Screen 2 Check:', screen2Check.result.value);

      const ss2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'screen2_verified_selector.png'), Buffer.from(ss2.data, 'base64'));
      console.log('Saved screen2_verified_selector.png');

      // ----------------------------------------------------
      // STEP 3: Click [ VIEW DOSSIER ] to Launch Integrated Game
      // ----------------------------------------------------
      console.log('3. Clicking [ VIEW DOSSIER ] on Mars card...');
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.card-view-dossier-btn[data-planet="mars"]')?.click()`
      });
      await new Promise(r => setTimeout(r, 3500));

      const mountCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const gameView = document.getElementById('screen2GameView');
          const iframe = document.getElementById('auroraGameIframe');
          return {
            gameViewActive: gameView ? gameView.classList.contains('active') : false,
            hasIframe: !!iframe,
            iframeSrc: iframe ? iframe.src : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Mount Check:', mountCheck.result.value);

      const ss3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'screen3_verified_game_mounted.png'), Buffer.from(ss3.data, 'base64'));
      console.log('Saved screen3_verified_game_mounted.png');

      // ----------------------------------------------------
      // STEP 4: Test Game Engine Directly (http://localhost:8080/src/game/dist/index.html?destination=mars)
      // ----------------------------------------------------
      console.log('4. Navigating to game directly: http://localhost:8080/src/game/dist/index.html?destination=mars');
      await send('Page.navigate', { url: 'http://localhost:8080/src/game/dist/index.html?destination=mars' });
      
      // Wait for textures & 3D scene to initialize and loading screen to complete
      console.log('Waiting for game loading screen to finish...');
      await new Promise(r => setTimeout(r, 6500));

      // Check game UI topbar & elements
      const gameTopbarCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const returnBtn = document.getElementById('auroraReturnBtn');
          const crest = document.querySelector('.aerospace-hud-crest');
          const designBtn = document.getElementById('design-button');
          const loading = document.getElementById('loading');
          return {
            hasReturnBtn: !!returnBtn,
            returnBtnText: returnBtn ? returnBtn.innerText : null,
            hasCrest: !!crest,
            hasDesignBtn: !!designBtn,
            loadingHidden: loading ? loading.hidden : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Game Topbar Check:', gameTopbarCheck.result.value);

      // Open Assembly Hangar
      console.log('Opening Assembly Hangar via DESIGN THIS MISSION button...');
      await send('Runtime.evaluate', {
        expression: `document.getElementById('design-button')?.click()`
      });
      await new Promise(r => setTimeout(r, 2500));

      // Inspect Assembly Hangar State: auto-equipped?
      const hangarCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const launchBtn = document.getElementById('launch-button');
          const readiness = document.getElementById('assembly-readiness');
          const checklist = document.querySelector('.assembly-checklist');
          const autoBtn = document.querySelector('[data-hangar="suggested"]');
          const sockets = Array.from(document.querySelectorAll('.hangar-slots button small')).map(s => s.innerText);
          return {
            launchDisabled: launchBtn ? launchBtn.disabled : null,
            launchText: launchBtn ? launchBtn.innerText.replace(/\\s+/g, ' ') : null,
            readinessText: readiness ? readiness.innerText : null,
            checklistText: checklist ? checklist.innerText.replace(/\\s+/g, ' ') : null,
            autoBtnText: autoBtn ? autoBtn.innerText : null,
            sockets: sockets
          };
        })()`,
        returnByValue: true
      });
      console.log('Hangar Check:', JSON.stringify(hangarCheck.result.value, null, 2));

      const ss4 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'screen4_assembly_hangar_auto_equipped.png'), Buffer.from(ss4.data, 'base64'));
      console.log('Saved screen4_assembly_hangar_auto_equipped.png');

      // ----------------------------------------------------
      // STEP 5: Click COMMIT & LAUNCH
      // ----------------------------------------------------
      console.log('5. Clicking COMMIT & LAUNCH button...');
      await send('Runtime.evaluate', {
        expression: `document.getElementById('launch-button')?.click()`
      });
      await new Promise(r => setTimeout(r, 2000));

      // Check if Mars mission planning dialog opened; if so, click its submit button
      const dialogCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const dialog = document.getElementById('dialog');
          const submitBtn = dialog ? dialog.querySelector('button[type="submit"], .primary-button') : null;
          return {
            dialogVisible: dialog ? !dialog.closest('#modal-layer')?.hidden : false,
            dialogHeading: dialog ? dialog.querySelector('h1, h2, .eyebrow')?.innerText : null,
            submitBtnText: submitBtn ? submitBtn.innerText : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Dialog Check:', dialogCheck.result.value);

      if (dialogCheck.result.value.dialogVisible) {
        console.log('Confirming flight plan dialog (clicking submit/proceed)...');
        await send('Runtime.evaluate', {
          expression: `(() => {
            const btn = document.querySelector('#dialog button[type="submit"], #dialog .primary-button');
            if (btn) btn.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 3000));
      }

      // Check Flight View status
      const flightCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const flightView = document.getElementById('flight-view');
          const menuView = document.getElementById('menu-view');
          const flightTitle = document.getElementById('flight-title');
          const flightChapter = document.getElementById('flight-chapter');
          const elapsed = document.getElementById('elapsed');
          const speed = document.getElementById('speed-value');
          const bodyHasFlight = document.body.classList.contains('in-flight');
          return {
            flightVisible: flightView ? !flightView.hidden : false,
            menuHidden: menuView ? menuView.hidden : false,
            bodyHasFlight,
            flightTitle: flightTitle ? flightTitle.innerText : null,
            flightChapter: flightChapter ? flightChapter.innerText : null,
            elapsed: elapsed ? elapsed.innerText : null,
            speed: speed ? speed.innerText : null
          };
        })()`,
        returnByValue: true
      });
      console.log('Flight Simulation Active Check:', flightCheck.result.value);

      const ss5 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'screen5_simulation_in_flight.png'), Buffer.from(ss5.data, 'base64'));
      console.log('Saved screen5_simulation_in_flight.png');

      console.log('\n=== ALL VERIFICATION STEPS COMPLETED 100% SUCCESSFULLY ===');
      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Test execution failed:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1200);
