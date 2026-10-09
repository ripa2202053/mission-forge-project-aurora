const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'game', 'src', 'main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 1. Update updateAudioButton
code = code.replace(
  `function updateAudioButton(){const b=$('#sound-button');b.textContent=audio.muted?'♪':'♫';b.setAttribute('aria-pressed',String(!audio.muted));b.title=audio.muted?'Enable audio (M)':'Mute audio (M)';}`,
  `function updateAudioButton(){const b=$('#sound-button');if(!b)return;b.textContent=audio.muted?'♪':'♫';b.setAttribute('aria-pressed',String(!audio.muted));b.title=audio.muted?'Enable audio (M)':'Mute audio (M)';b.classList.toggle('active',!audio.muted);}`
);

// 2. Update returnMenu
code = code.replace(
  `closeDialog();audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;sim=null;view='menu';`,
  `closeDialog();audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);audio.fadeOutBgm(1.0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;sim=null;view='menu';`
);

// 3. Update handleEvent begin: audio.playLaunchSequence()
code = code.replace(
  `if(event.type==='begin'){const s=stageInfo();communicate(s.commander,s.message);audio.cue('success');}`,
  `if(event.type==='begin'){const s=stageInfo();communicate(s.commander,s.message);audio.playLaunchSequence();}`
);

// 4. Update stageComplete: audio.fadeOutBgm(1.5)
code = code.replace(
  `keys={};audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`,
  `keys={};audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);audio.fadeOutBgm(1.5);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`
);

// 5. Update failed event: audio.fadeOutBgm(1.5)
code = code.replace(
  `audio.cue('alert');audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');keys={};`,
  `audio.cue('alert');audio.stopKlaxon();audio.updateWind(0);audio.fadeOutBgm(1.5);document.body.classList.remove('hud-alert-critical','hud-alert-warning');keys={};`
);

// 6. Update completeMission: audio.fadeOutBgm(1.5)
code = code.replace(
  `function completeMission(){\r\n  keys={};audio.cue('success');audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`,
  `function completeMission(){\r\n  keys={};audio.cue('success');audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);audio.fadeOutBgm(1.5);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`
);
// Handle \n as well
code = code.replace(
  `function completeMission(){\n  keys={};audio.cue('success');audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`,
  `function completeMission(){\n  keys={};audio.cue('success');audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);audio.fadeOutBgm(1.5);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;`
);

// 7. Update pauseMenu
code = code.replace(
  `if(!sim||!['flight','paused'].includes(sim.mode))return;sim.pause();audio.stopVoice();keys={};`,
  `if(!sim||!['flight','paused'].includes(sim.mode))return;sim.pause();audio.stopVoice();audio.fadeOutBgm(0.6);keys={};`
);

// 8. Update resume-flight
code = code.replace(
  `if(b.id==='resume-flight'){closeDialog();sim.resume();}`,
  `if(b.id==='resume-flight'){closeDialog();audio.fadeInBgm(1.5);sim.resume();}`
);

// 9. Update keydown for A / D RCS bursts
code = code.replace(
  `if(sim?.mode==='flight'){
    if(e.code==='KeyE'&&!e.repeat)sim.requestInteraction();`,
  `if(sim?.mode==='flight'){
    if(e.code==='KeyE'&&!e.repeat)sim.requestInteraction();
    if(!e.repeat){
      if(e.code==='KeyA'||e.code==='ArrowLeft')audio.rcsBurst(-0.8);
      if(e.code==='KeyD'||e.code==='ArrowRight')audio.rcsBurst(0.8);
    }`
);
code = code.replace(
  `if(sim?.mode==='flight'){\r\n    if(e.code==='KeyE'&&!e.repeat)sim.requestInteraction();`,
  `if(sim?.mode==='flight'){\r\n    if(e.code==='KeyE'&&!e.repeat)sim.requestInteraction();\r\n    if(!e.repeat){\r\n      if(e.code==='KeyA'||e.code==='ArrowLeft')audio.rcsBurst(-0.8);\r\n      if(e.code==='KeyD'||e.code==='ArrowRight')audio.rcsBurst(0.8);\r\n    }`
);

// 10. Update tick(now) to pass keys to audio.update
code = code.replace(
  `assembly?.update(dt);if(!assembly)world.update(dt,view==='flight'?sim:null);audio.update(dt,sim);`,
  `assembly?.update(dt);if(!assembly)world.update(dt,view==='flight'?sim:null);audio.update(dt,sim,keys);`
);

fs.writeFileSync(mainJsPath, code, 'utf8');
console.log('Successfully patched main.js with NASA audio hooks!');

// Now append CSS for #sound-button.active
const cssPath = path.join(__dirname, '..', 'src', 'game', 'aurora-theme.css');
let css = fs.readFileSync(cssPath, 'utf8');

const soundButtonCss = `
/* 8. Top Header Sound Toggle Cyan Status Indicator */
#sound-button {
  transition: all 0.25s ease !important;
  position: relative !important;
  border-radius: 4px !important;
}

#sound-button.active {
  border-color: #00e5ff !important;
  color: #00e5ff !important;
  background: rgba(0, 229, 255, 0.2) !important;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.6), inset 0 0 8px rgba(0, 229, 255, 0.25) !important;
  text-shadow: 0 0 10px #00e5ff !important;
}

#sound-button.active::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 8px #00e5ff, 0 0 14px #00e5ff;
}
`;

if (!css.includes('Top Header Sound Toggle Cyan Status Indicator')) {
  css += soundButtonCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully added sound-button CSS to aurora-theme.css!');
}
