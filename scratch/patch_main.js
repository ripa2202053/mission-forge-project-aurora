const fs = require('fs');

let code = fs.readFileSync('src/game/src/main.js', 'utf8');

const target1 = `  if(event.type==='failed'){audio.cue('alert');audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');keys={};showDialog('failed',\`\${header('MISSION INTERRUPTED',event.title)}<p>\${event.message}</p><div class="dialog-actions"><button class="primary-button" id="retry-button"><span>RETRY STAGE CHECKPOINT</span><b>↗</b></button><button class="outline-button" data-menu>MISSION SELECTION</button></div>\`);}`;

const replacement1 = `  if(event.type==='failed'){
    audio.cue('alert');audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');keys={};
    const finalScore = Math.round(sim ? sim.score : 0);
    const finalHull = Math.round(sim ? sim.hull : 0);
    const finalTime = sim ? formatTime(sim.time) : '00:00';
    const finalCollisions = sim ? sim.collisions : 0;
    const stageNum = sim ? (sim.stage + 1) : 1;
    showDialog('failed', \`<div class="rank-badge failure-badge">!</div>\${header('MISSION INTERRUPTED / CHAPTER 0' + stageNum, event.title)}<p class="dialog-lead event-warning">\${event.message}</p><div class="debrief-stats"><div class="score-card"><b>\${finalScore}</b><span>SCIENCE RETURN</span></div><div><b>\${finalHull}%</b><span>VEHICLE INTEGRITY</span></div><div><b>\${finalTime}</b><span>FLIGHT TIME</span></div><div><b>\${finalCollisions}</b><span>COLLISIONS</span></div></div><div class="dialog-actions"><button class="primary-button" id="retry-button"><span>RETRY STAGE CHECKPOINT</span><b>↗</b></button><button class="outline-button" data-menu>MISSION SELECTION</button></div>\`);
  }`;

const target2 = `<div class="debrief-stats"><div><b>\${result.score}</b><span>SCIENCE RETURN</span></div>`;
const replacement2 = `<div class="debrief-stats"><div class="score-card"><b>\${result.score}</b><span>SCIENCE RETURN</span></div>`;

if (!code.includes(target1)) {
  console.error('Target 1 not found!');
  process.exit(1);
}
code = code.replace(target1, replacement1);

if (!code.includes(target2)) {
  console.error('Target 2 not found!');
  process.exit(1);
}
code = code.replace(target2, replacement2);

fs.writeFileSync('src/game/src/main.js', code, 'utf8');
console.log('Successfully updated main.js');
