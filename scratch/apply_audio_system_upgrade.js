const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'game', 'src', 'main.js');
let mainCode = fs.readFileSync(mainJsPath, 'utf8');

// 1. Audio initialization and localStorage persistence
const oldInitPattern = /const settings=getSaved\('odyssey-settings',\{voice:true,quality:true,muted:false\}\);audio\.voice=settings\.voice;audio\.muted=settings\.muted;/;
const newInitCode = `const settings=getSaved('odyssey-settings',{voice:true,quality:true,muted:false});
  const storedMuted = (typeof localStorage !== 'undefined') ? localStorage.getItem('aurora_audio_muted') : null;
  audio.voice = settings.voice;
  audio.muted = (storedMuted !== null) ? (storedMuted === 'true') : settings.muted;`;

if (oldInitPattern.test(mainCode)) {
  mainCode = mainCode.replace(oldInitPattern, newInitCode);
  console.log('✓ Updated audio settings initialization');
} else {
  console.log('Notice: audio initialization pattern not matched directly, checking if already updated');
}

// 2. persistSettings
const oldPersistPattern = /function persistSettings\(\)\{save\('odyssey-settings',\{voice:audio\.voice,quality:world\?\.highQuality\?\?true,muted:audio\.muted\}\);\}/;
const newPersistCode = `function persistSettings(){
    save('odyssey-settings',{voice:audio.voice,quality:world?.highQuality??true,muted:audio.muted});
    try { if(typeof localStorage !== 'undefined') localStorage.setItem('aurora_audio_muted', String(audio.muted)); } catch(e){}
  }`;

if (oldPersistPattern.test(mainCode)) {
  mainCode = mainCode.replace(oldPersistPattern, newPersistCode);
  console.log('✓ Updated persistSettings');
}

// 3. updateAudioButton with animated cyan EQ wave and muted red slash badge
const oldUpdateAudioPattern = /function updateAudioButton\(\)\{[^}]+\}/;
const newUpdateAudioCode = `function updateAudioButton(){
    const b=$('#sound-button');
    if(!b)return;
    b.setAttribute('aria-pressed',String(!audio.muted));
    b.title=audio.muted?'Enable audio (M)':'Mute audio (M)';
    b.classList.toggle('active',!audio.muted);
    b.classList.toggle('muted',audio.muted);
    if(!audio.muted){
      b.innerHTML = '<span class="sound-eq-wave" aria-hidden="true"><span class="eq-bar bar-1"></span><span class="eq-bar bar-2"></span><span class="eq-bar bar-3"></span><span class="eq-bar bar-4"></span></span><span class="sound-icon-note">♫</span>';
    } else {
      b.innerHTML = '<span class="sound-mute-wrap" aria-hidden="true"><span class="sound-icon-note muted">♪</span><span class="sound-mute-slash"></span><span class="sound-mute-badge"></span></span>';
    }
  }`;

if (oldUpdateAudioPattern.test(mainCode)) {
  mainCode = mainCode.replace(oldUpdateAudioPattern, newUpdateAudioCode);
  console.log('✓ Updated updateAudioButton with EQ wave & red slash badge');
}

// 4. communicate() with Apollo Quindar intro and outro tones
const oldCommunicatePattern = /function communicate\(speaker,message,speak=true\)\{transcript=message;typed=0;\$('#comm-speaker')\.textContent=speaker\.toUpperCase\(\);\$('#comm-state')\.textContent='INCOMING TRANSMISSION';if\(speak\)audio\.speak\(message\);/g;
const newCommunicateCode = `function communicate(speaker,message,speak=true){
    transcript=message;
    typed=0;
    $('#comm-speaker').textContent=speaker.toUpperCase();
    $('#comm-state').textContent='INCOMING TRANSMISSION';
    audio.playQuindar('intro');
    if(speak){
      audio.speak(message, () => {
        setTimeout(() => audio.playQuindar('outro'), 220);
      });
    } else {
      setTimeout(() => {
        audio.playQuindar('outro');
      }, Math.min(2400, Math.max(800, message.length * 36)));
    }`;

if (oldCommunicatePattern.test(mainCode)) {
  mainCode = mainCode.replace(oldCommunicatePattern, newCommunicateCode);
  console.log('✓ Updated communicate with Quindar intro & outro tones');
}

// 5. Waypoint & Gate chime in handleEvent: event.type === 'target'
mainCode = mainCode.replace(
  `if(event.type==='target'){audio.cue('success');notify('✓ '+event.name+' COMPLETE');updateObjectives();}`,
  `if(event.type==='target'){audio.playWaypointChime();notify('✓ '+event.name+' COMPLETE');updateObjectives();}`
);

// 6. Crossfade durations set to 1.8s
mainCode = mainCode.replace(/audio\.fadeOutBgm\(1\.5\)/g, `audio.fadeOutBgm(1.8)`);
mainCode = mainCode.replace(/audio\.fadeInBgm\(1\.5\)/g, `audio.fadeInBgm(1.8)`);
mainCode = mainCode.replace(/audio\.fadeOutBgm\(1\.0\)/g, `audio.fadeOutBgm(1.8)`);
mainCode = mainCode.replace(/audio\.fadeOutBgm\(0\.6\)/g, `audio.fadeOutBgm(1.8)`);

fs.writeFileSync(mainJsPath, mainCode, 'utf8');
console.log('✓ Successfully saved updated main.js');

// 7. Update aurora-theme.css with Sound Button styles
const cssPath = path.join(__dirname, '..', 'src', 'game', 'aurora-theme.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

const soundButtonCss = `
/* 8. Top Header Sound Toggle: Animated Cyan Equalizer Wave & Muted Red Slash Badge */
#sound-button {
  transition: all 0.25s ease !important;
  position: relative !important;
  border-radius: 6px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 4px 9px !important;
  min-width: 46px !important;
  height: 34px !important;
  overflow: visible !important;
  cursor: pointer !important;
}

#sound-button.active {
  border-color: #00e5ff !important;
  color: #00e5ff !important;
  background: rgba(0, 229, 255, 0.15) !important;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.5), inset 0 0 8px rgba(0, 229, 255, 0.2) !important;
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

/* Animated Cyan Equalizer Wave */
.sound-eq-wave {
  display: inline-flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 16px;
}

.sound-eq-wave .eq-bar {
  display: block;
  width: 2.5px;
  border-radius: 1.5px;
  background: #00e5ff;
  box-shadow: 0 0 6px rgba(0, 229, 255, 0.85);
  animation-duration: 0.8s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
}

.sound-eq-wave .bar-1 {
  height: 5px;
  animation-name: eqWaveAnim1;
  animation-duration: 0.65s;
}

.sound-eq-wave .bar-2 {
  height: 14px;
  animation-name: eqWaveAnim2;
  animation-duration: 0.45s;
}

.sound-eq-wave .bar-3 {
  height: 8px;
  animation-name: eqWaveAnim3;
  animation-duration: 0.75s;
}

.sound-eq-wave .bar-4 {
  height: 12px;
  animation-name: eqWaveAnim4;
  animation-duration: 0.52s;
}

@keyframes eqWaveAnim1 {
  0% { height: 4px; opacity: 0.6; }
  100% { height: 14px; opacity: 1; }
}

@keyframes eqWaveAnim2 {
  0% { height: 15px; opacity: 1; }
  100% { height: 5px; opacity: 0.7; }
}

@keyframes eqWaveAnim3 {
  0% { height: 6px; opacity: 0.7; }
  100% { height: 16px; opacity: 1; }
}

@keyframes eqWaveAnim4 {
  0% { height: 13px; opacity: 1; }
  100% { height: 4px; opacity: 0.6; }
}

.sound-icon-note {
  font-size: 14px;
  line-height: 1;
}

/* Red Slash Badge when Muted */
#sound-button.muted {
  border-color: rgba(239, 68, 68, 0.45) !important;
  color: #94a3b8 !important;
  background: rgba(15, 23, 42, 0.7) !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2) !important;
}

.sound-mute-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sound-icon-note.muted {
  color: #64748b;
  opacity: 0.6;
}

.sound-mute-slash {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 2px;
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
  transform: translate(-50%, -50%) rotate(-45deg);
  border-radius: 1px;
}

.sound-mute-badge {
  position: absolute;
  top: -4px;
  right: -5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}
`;

// Replace existing #sound-button section in css
if (cssCode.includes('/* 8. Top Header Sound Toggle Cyan Status Indicator */')) {
  cssCode = cssCode.replace(/\/\* 8\. Top Header Sound Toggle Cyan Status Indicator \*\/[\s\S]*?(?=\n\n\/\*|\n\n$|$)/, soundButtonCss.trim());
} else if (cssCode.includes('/* 8. Top Header Sound Toggle: Animated Cyan Equalizer Wave')) {
  cssCode = cssCode.replace(/\/\* 8\. Top Header Sound Toggle: Animated Cyan Equalizer Wave[\s\S]*?(?=\n\n\/\*|\n\n$|$)/, soundButtonCss.trim());
} else {
  cssCode += '\n' + soundButtonCss;
}

fs.writeFileSync(cssPath, cssCode, 'utf8');
console.log('✓ Successfully saved updated aurora-theme.css');
