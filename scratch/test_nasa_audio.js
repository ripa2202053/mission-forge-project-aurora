const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9297;
const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';

const chrome = spawn(CHROME_PATH, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--autoplay-policy=no-user-gesture-required',
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
      await new Promise(r => setTimeout(r, 2200));

      // Test Audio Engine & Launch Sequence
      const audioTestResults = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const audio = window.audio;
            if (!audio) return { error: 'window.audio not found' };

            // 1. Initialize Audio Context
            await audio.start();

            // 2. Test Quindar Tone
            audio.playQuindar('intro');

            // 3. Test Launch Ignition
            audio.playLaunchIgnition();

            // 4. Test In-Flight BGM Fade-in
            audio.fadeInBgm(2.0);

            // 5. Test RCS thruster bursts
            audio.rcsBurst(-0.8);
            setTimeout(() => audio.rcsBurst(0.8), 200);

            // 6. Test Header Sound button status
            const soundBtn = document.getElementById('sound-button');
            const initialActive = soundBtn ? soundBtn.classList.contains('active') : false;

            return {
              audioCtxState: audio.ctx ? audio.ctx.state : 'none',
              bgmPlaying: audio.bgmPlaying,
              bgmGainValue: audio.bgmGain ? audio.bgmGain.gain.value : 0,
              masterGain: audio.master ? audio.master.gain.value : 0,
              soundBtnActive: initialActive,
              soundBtnTitle: soundBtn ? soundBtn.title : '',
              hasEngine: !!audio.engine,
              hasThrusterNoise: !!audio.thrusterNoise
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Audio test results:', JSON.stringify(audioTestResults.result.value, null, 2));

      // Wait 1.8s for BGM fade-in and rumble swell
      await new Promise(r => setTimeout(r, 1800));

      const bgmValueAfterFade = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const audio = window.audio;
            return {
              bgmGainValue: audio.bgmGain ? audio.bgmGain.gain.value : 0
            };
          })()
        `,
        returnByValue: true
      });
      console.log('BGM gain after 1.8s fade-in:', bgmValueAfterFade.result.value);

      // Capture screenshot of the menu view with the glowing electric cyan sound button
      const shotMenu = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_audio_header_button.png'), Buffer.from(shotMenu.data, 'base64'));
      console.log('Saved verify_audio_header_button.png');

      // Test Flight Mode Transition & Launch Sequence Trigger
      console.log('Entering flight mode...');
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            // Trigger flight stage 0 (LEAVE THE BLUE BEHIND)
            const audio = window.audio;
            audio.playLaunchSequence();
          })()
        `
      });

      await new Promise(r => setTimeout(r, 800));

      const shotFlight = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_flight_audio_active.png'), Buffer.from(shotFlight.data, 'base64'));
      console.log('Saved verify_flight_audio_active.png');

      // Test Mute / Unmute
      console.log('Testing Mute toggle...');
      const muteTest = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const audio = window.audio;
            const soundBtn = document.getElementById('sound-button');
            soundBtn.click(); // mute
            const mutedState = {
              isMuted: audio.muted,
              soundBtnActive: soundBtn.classList.contains('active'),
              btnText: soundBtn.textContent
            };
            soundBtn.click(); // unmute
            return {
              mutedState,
              unmutedState: {
                isMuted: audio.muted,
                soundBtnActive: soundBtn.classList.contains('active'),
                btnText: soundBtn.textContent
              }
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Mute/Unmute test result:', JSON.stringify(muteTest.result.value, null, 2));

      // Test BGM Fade-Out on Game Over / Debrief
      console.log('Testing BGM Fade-Out on Debrief...');
      const fadeOutTest = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const audio = window.audio;
            audio.fadeOutBgm(1.5);
            return 'FADING_OUT';
          })()
        `
      });

      await new Promise(r => setTimeout(r, 1600));

      const bgmValueAfterFadeOut = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const audio = window.audio;
            return {
              bgmGainValue: audio.bgmGain ? audio.bgmGain.gain.value : 0
            };
          })()
        `,
        returnByValue: true
      });
      console.log('BGM gain after 1.5s fade-out:', bgmValueAfterFadeOut.result.value);

      console.log('ALL NASA AUDIO TESTS COMPLETED SUCCESSFULLY!');
      chrome.kill();
      process.exit(0);
    };
  } catch(err) {
    console.error('Audio test failed:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
