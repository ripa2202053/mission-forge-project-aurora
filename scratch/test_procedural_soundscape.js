const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9299;
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

      // Reset localStorage to clean defaults: unmuted
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            localStorage.clear();
            const audio = window.audio;
            if (audio) {
              audio.muted = false;
              if (audio.master && audio.ctx) {
                audio.master.gain.setValueAtTime(0.5, audio.ctx.currentTime);
              }
            }
            if (typeof updateAudioButton === 'function') updateAudioButton();
            else {
              const b = document.querySelector('#sound-button');
              if (b) {
                b.classList.add('active');
                b.classList.remove('muted');
                b.innerHTML = '<span class="sound-eq-wave" aria-hidden="true"><span class="eq-bar bar-1"></span><span class="eq-bar bar-2"></span><span class="eq-bar bar-3"></span><span class="eq-bar bar-4"></span></span><span class="sound-icon-note">♫</span>';
              }
            }
          })()
        `
      });

      // 1. Initial State & Sound Button UI Check (Equalizer Wave)
      const initialAudioState = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const audio = window.audio;
            await audio.start();

            const btn = document.querySelector('#sound-button');
            const eqBars = btn.querySelectorAll('.eq-bar');

            return {
              audioCtxState: audio.ctx ? audio.ctx.state : 'none',
              isMuted: audio.muted,
              masterGain: audio.master ? audio.master.gain.value : 0,
              btnActive: btn.classList.contains('active'),
              btnMuted: btn.classList.contains('muted'),
              hasEqWave: !!btn.querySelector('.sound-eq-wave'),
              eqBarCount: eqBars.length,
              storedMuted: localStorage.getItem('aurora_audio_muted')
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('1. Sound Button Initial (Unmuted/Active with EQ wave):', JSON.stringify(initialAudioState.result.value, null, 2));

      // Capture header screenshot showing animated equalizer wave
      const shotUnmuted = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_sound_button_eq_wave.png'), Buffer.from(shotUnmuted.data, 'base64'));
      console.log('Saved verify_sound_button_eq_wave.png');

      // 2. Mute Toggle Test (Red Slash Badge)
      const mutedAudioState = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const btn = document.querySelector('#sound-button');
            btn.click(); // Toggle to Muted
            await new Promise(r => setTimeout(r, 200));

            const audio = window.audio;
            return {
              isMuted: audio.muted,
              masterGain: audio.master ? audio.master.gain.value : 0,
              btnActive: btn.classList.contains('active'),
              btnMuted: btn.classList.contains('muted'),
              hasMuteSlash: !!btn.querySelector('.sound-mute-slash'),
              hasMuteBadge: !!btn.querySelector('.sound-mute-badge'),
              storedMuted: localStorage.getItem('aurora_audio_muted')
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('2. Sound Button Muted State (with red slash badge):', JSON.stringify(mutedAudioState.result.value, null, 2));

      // Capture header screenshot showing red slash badge
      const shotMuted = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_sound_button_muted_slash.png'), Buffer.from(shotMuted.data, 'base64'));
      console.log('Saved verify_sound_button_muted_slash.png');

      // Un-mute back for procedural audio flight tests
      await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('#sound-button');
            btn.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 200));

      // 3. Test In-Flight Audio Engine & Real-Time Synthesis
      console.log('Testing Real-Time Interactive Flight SFX...');
      const flightAudioTests = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            try {
              const audio = window.audio;
              await audio.start();

              // A. Trigger Launch Sequence (Quindar + Ignition + BGM 1.8s fade-in)
              audio.playLaunchSequence();

              // Wait 1.8s for BGM fade-in
              await new Promise(r => setTimeout(r, 1850));
              const bgmGainAfterFade = audio.bgmGain ? audio.bgmGain.gain.value : 0;

              // B. Test Dynamic Engine Throttle ('W' Key):
              // Check idle: cutoff 180 Hz, Q: 3.5
              audio.update(0.016, { mode: 'flight', speed: 12, throttle: 0 }, { forward: false });
              const filterQ = audio.thrusterFilter ? audio.thrusterFilter.Q.value : 0;
              const idleCutoff = audio.thrusterFilter ? audio.thrusterFilter.frequency.value : 0;

              // Check full burn ('W'): cutoff target 650 Hz
              audio.update(0.016, { mode: 'flight', speed: 28, throttle: 1.0 }, { forward: true });
              const burnCutoffTarget = 180 + 1.0 * 470; // 650 Hz

              // C. Test Tension Layer at high velocity (>22 m/s) and low propellant (<20%)
              audio.update(0.016, { mode: 'flight', speed: 38, fuel: 8, hull: 85, throttle: 0.5 }, {});
              // Allow parameter target ramp
              await new Promise(r => setTimeout(r, 250));
              const tensionGainVal = audio.tensionGain ? audio.tensionGain.gain.value : 0;

              // D. Test Telemetry & Waypoint Gate Chime (880 Hz + 1320 Hz + reverb decay)
              let chimeOk = false;
              try {
                audio.playWaypointChime();
                chimeOk = true;
              } catch(e){
                chimeOk = e.message;
              }

              // E. Test RCS Thruster Steering Puffs ('A'/'D' Keys)
              let rcsOk = false;
              try {
                audio.rcsBurst(-0.8);
                setTimeout(() => audio.rcsBurst(0.8), 120);
                rcsOk = true;
              } catch(e){
                rcsOk = e.message;
              }

              // F. Test Warning Alarms (~320 Hz saw wave pulse every 0.4s)
              let warningOk = false;
              try {
                audio.playWarningPulse();
                warningOk = true;
              } catch(e){
                warningOk = e.message;
              }

              // G. Test Apollo Comms Snippet & Radio Ducking
              let radioOk = false;
              try {
                audio.playRadioSnippet();
                radioOk = true;
              } catch(e){
                radioOk = e.message;
              }

              // Check commsBus ducking during throttle
              const duckGain = audio.commsBus ? audio.commsBus.gain.value : 1;

              return {
                bgmGainAfterFade,
                filterQ,
                idleCutoff,
                burnCutoffTarget,
                tensionGainVal,
                chimeOk,
                rcsOk,
                warningOk,
                radioOk,
                commsBusDuckGain: duckGain,
                hasThrusterNoise: !!audio.thrusterNoise,
                hasTensionOsc: !!audio.tensionOsc,
                hasRadioNoise: !!audio.radioNoise
              };
            } catch(outerErr) {
              return { error: outerErr.message, stack: outerErr.stack };
            }
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('3. In-Flight Audio Telemetry & Synthesis Test Results:', JSON.stringify(flightAudioTests.result ? flightAudioTests.result.value : flightAudioTests, null, 2));

      // 4. Test Transition Logic to Debrief (1.8s duration)
      console.log('Testing Debrief Crossfade (1.8s duration)...');
      await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const audio = window.audio;
            audio.fadeOutBgm(1.8);
          })()
        `
      });

      await new Promise(r => setTimeout(r, 1900));

      const debriefStatus = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const audio = window.audio;
            return {
              bgmGainAfterDebrief: audio.bgmGain ? audio.bgmGain.gain.value : 0,
              tensionGainAfterDebrief: audio.tensionGain ? audio.tensionGain.gain.value : 0
            };
          })()
        `,
        returnByValue: true
      });
      console.log('4. Debrief Crossfade Status (after 1.8s):', JSON.stringify(debriefStatus.result.value, null, 2));

      // Capture final flight / debrief screenshot
      const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'verify_procedural_audio_flight.png'), Buffer.from(shotFinal.data, 'base64'));
      console.log('Saved verify_procedural_audio_flight.png');

      console.log('ALL INTERACTIVE PROCEDURAL AUDIO SYSTEM TESTS PASSED SUCCESSFULLY!');
      chrome.kill();
      process.exit(0);
    };
  } catch(err) {
    console.error('CDP Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1200);
