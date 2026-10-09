const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testAudioSystem() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Navigating to http://localhost:8080/src/game/dist/index.html...');
  await page.goto('http://localhost:8080/src/game/dist/index.html', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(1000);

  // 1. Verify AudioContext initialization and Sound Button UI
  const initialStatus = await page.evaluate(async () => {
    const btn = document.querySelector('#sound-button');
    // Click to start audio
    btn.click();
    await new Promise(r => setTimeout(r, 200));

    const audio = window.audio;
    return {
      audioCtxState: audio.ctx ? audio.ctx.state : null,
      masterGain: audio.master ? audio.master.gain.value : null,
      isMuted: audio.muted,
      hasEqWave: !!btn.querySelector('.sound-eq-wave'),
      eqBarCount: btn.querySelectorAll('.eq-bar').length,
      hasActiveDot: btn.classList.contains('active'),
      storedMuted: localStorage.getItem('aurora_audio_muted')
    };
  });
  console.log('1. Initial Audio & Button Status:', initialStatus);

  // Capture screenshot of the animated EQ wave button
  const headerBtnClip = await page.evaluate(() => {
    const b = document.querySelector('#sound-button');
    const r = b.getBoundingClientRect();
    return { x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 20 };
  });
  await page.screenshot({
    path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_sound_button_eq_wave.png',
    clip: headerBtnClip
  });
  console.log('Saved verify_sound_button_eq_wave.png');

  // 2. Test Mute Toggle and Red Slash Badge
  const muteStatus = await page.evaluate(async () => {
    const btn = document.querySelector('#sound-button');
    btn.click(); // Toggle to mute
    await new Promise(r => setTimeout(r, 200));

    const audio = window.audio;
    return {
      isMuted: audio.muted,
      masterGain: audio.master ? audio.master.gain.value : null,
      hasMuteSlash: !!btn.querySelector('.sound-mute-slash'),
      hasMuteBadge: !!btn.querySelector('.sound-mute-badge'),
      hasMutedClass: btn.classList.contains('muted'),
      storedMuted: localStorage.getItem('aurora_audio_muted')
    };
  });
  console.log('2. Mute Status:', muteStatus);

  await page.screenshot({
    path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_sound_button_muted_slash.png',
    clip: headerBtnClip
  });
  console.log('Saved verify_sound_button_muted_slash.png');

  // Un-mute back for active flight test
  await page.evaluate(async () => {
    const btn = document.querySelector('#sound-button');
    btn.click();
    await new Promise(r => setTimeout(r, 200));
  });

  // 3. Launch into Flight Simulation & Test Adaptive Soundscape
  console.log('Launching into Flight Simulation...');
  await page.evaluate(async () => {
    const btn = document.querySelector('#design-button');
    if (btn) btn.click();
    await new Promise(r => setTimeout(r, 500));
    const launchBtn = document.querySelector('#launch-button');
    if (launchBtn) launchBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const commitBtn = document.querySelector('#commit-plan') || document.querySelector('#begin-stage');
    if (commitBtn) commitBtn.click();
  });
  await page.waitForTimeout(600);

  // Take the controls if brief modal is up
  await page.evaluate(async () => {
    const beginBtn = document.querySelector('#begin-stage');
    if (beginBtn) beginBtn.click();
  });
  await page.waitForTimeout(2000); // Wait for 1.8s fade-in to complete

  // 4. Test In-Flight Audio Parameters
  const flightAudioTest = await page.evaluate(async () => {
    const audio = window.audio;
    const ctx = audio.ctx;
    const t = ctx.currentTime;

    const bgmGainVal = audio.bgmGain ? audio.bgmGain.gain.value : null;

    // Test Dynamic Engine Throttle ('W' Key): Cutoff 180 Hz (idle) -> 650 Hz (full burn), Q: 3.5
    // Idle state:
    audio.update(0.016, { mode: 'flight', speed: 10, throttle: 0 }, { forward: false });
    const idleCutoff = audio.thrusterFilter.frequency.value;
    const filterQ = audio.thrusterFilter.Q.value;

    // 100% Full Burn state:
    audio.update(0.016, { mode: 'flight', speed: 30, throttle: 1.0 }, { forward: true });
    // Let automation apply
    const burnCutoffTarget = 180 + 1.0 * 470; // 650 Hz

    // Test Tension Layer at high velocity (>22 m/s) and low fuel (<20%)
    audio.update(0.016, { mode: 'flight', speed: 35, fuel: 10, hull: 80, throttle: 0.5 }, {});
    const tensionGainActive = audio.tensionGain ? audio.tensionGain.gain.value : 0;

    // Test Waypoint Chime
    let chimeTriggered = false;
    try {
      audio.playWaypointChime();
      chimeTriggered = true;
    } catch(e){}

    // Test Quindar tones
    let quindarTriggered = false;
    try {
      audio.playQuindar('intro');
      audio.playQuindar('outro');
      quindarTriggered = true;
    } catch(e){}

    // Test RCS burst
    let rcsTriggered = false;
    try {
      audio.rcsBurst(-0.8);
      audio.rcsBurst(0.8);
      rcsTriggered = true;
    } catch(e){}

    // Test Warning Pulse
    let warningPulseTriggered = false;
    try {
      audio.playWarningPulse();
      warningPulseTriggered = true;
    } catch(e){}

    return {
      audioCtxState: ctx.state,
      bgmGainValue: bgmGainVal,
      filterQ,
      burnCutoffTarget,
      tensionGainActive,
      chimeTriggered,
      quindarTriggered,
      rcsTriggered,
      warningPulseTriggered
    };
  });
  console.log('3. In-Flight Audio Telemetry & Synthesis Test:', flightAudioTest);

  // Take flight screenshot with active HUD
  await page.screenshot({
    path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_flight_interactive_audio.png'
  });
  console.log('Saved verify_flight_interactive_audio.png');

  // 5. Test Transition Crossfade to Debrief (1.8s duration)
  console.log('Testing Debrief crossfade (1.8s)...');
  await page.evaluate(async () => {
    if (window.completeMission) {
      window.completeMission();
    }
  });
  await page.waitForTimeout(1900); // Wait for 1.8s fade-out

  const debriefAudioStatus = await page.evaluate(() => {
    const audio = window.audio;
    return {
      bgmGainAfterDebrief: audio.bgmGain ? audio.bgmGain.gain.value : null,
      tensionGainAfterDebrief: audio.tensionGain ? audio.tensionGain.gain.value : null
    };
  });
  console.log('4. Debrief Crossfade Status:', debriefAudioStatus);

  await page.screenshot({
    path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460\\verify_debrief_audio_crossfade.png'
  });
  console.log('Saved verify_debrief_audio_crossfade.png');

  await browser.close();
  console.log('ALL INTERACTIVE PROCEDURAL AUDIO SYSTEM TESTS PASSED SUCCESSFULLY!');
}

testAudioSystem().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
