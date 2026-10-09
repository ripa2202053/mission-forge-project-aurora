const fs = require('fs');
const path = require('path');

const assemblyPath = path.resolve('c:/Users/User/.gemini/antigravity/scratch/mission-nasa-game/src/game/src/assembly.js');
let code = fs.readFileSync(assemblyPath, 'utf8');

// Find index of 'buildCheck(stats)'
const idx = code.indexOf('buildCheck(stats){');
if (idx === -1) {
  console.error('buildCheck not found');
  process.exit(1);
}

const cleanTail = `buildCheck(stats){const issues=[],massLimit=this.expanded?120:85,costLimit=this.expanded?600:320;if(stats.cost>costLimit)issues.push(\`Reduce cost below $\${costLimit}M\`);if(stats.mass>massLimit)issues.push(\`Reduce wet mass below \${massLimit} t\`);if(stats.powerMargin<0)issues.push('Power deficit: choose a stronger power system or lower-demand components');return {issues,valid:issues.length===0,massLimit,costLimit};}
  refresh(){
    const stats=designStats(this.loadout,this.destination.id);
    Object.assign(stats,this.buildCheck(stats));
    const count=this.installed.filter(Boolean).length,complete=count===SYSTEMS.length,busy=this.animations.some(n=>n>0);
    this.ready=complete&&stats.valid;
    this.root.querySelectorAll('[data-quick-slot]').forEach(s=>{const i=Number(s.dataset.quickSlot);s.value=this.installed[i]?String(this.loadout[i]):'-1';});
    const nextSlot=this.installed.findIndex(connected=>!connected);
    this.root.querySelectorAll('[data-slot]').forEach((b,i)=>{b.classList.toggle('socket-installed',this.installed[i]);b.classList.toggle('socket-next',i===nextSlot);this.root.querySelector('#socket-'+i).textContent=this.installed[i]?SYSTEMS[i].choices[this.loadout[i]].name:i===nextSlot?'NEXT: SELECT A MODULE':'EMPTY SOCKET';});
    const installedParts=stats.parts.filter((_,i)=>this.installed[i]);
    const currentMass=12+(this.installed[8]?stats.fuelMass:0)+installedParts.reduce((n,p)=>n+p.mass,0),currentCost=60+installedParts.reduce((n,p)=>n+p.cost,0);
    const rows=[
      ['ASSEMBLED WET MASS',currentMass+' • '+stats.massLimit+' t',currentMass<=stats.massLimit],
      ['ASSEMBLED COST','$'+currentCost+' • '+stats.costLimit+'M',currentCost<=stats.costLimit],
      ['PROJECTED IDEAL Δv',stats.deltaV.toFixed(2)+' km/s',true],
      ['REAL INITIAL ACCEL.',stats.acceleration<.001?stats.acceleration.toExponential(2)+' m/s²':stats.acceleration.toFixed(2)+' m/s²',true],
      ['DESTINATION GENERATION',stats.generatedKW.toFixed(2)+' kW',true],
      ['PROJECTED DEMAND',stats.demandKW.toFixed(2)+' kW',true],
      ['POWER MARGIN',(stats.powerMargin>=0?'+':'')+stats.powerMargin.toFixed(2)+' kW',stats.powerMargin>=0],
      ['FULL PROPELLANT BURN',stats.burnSeconds>86400?(stats.burnSeconds/86400).toFixed(0)+' days':(stats.burnSeconds/60).toFixed(1)+' min',true],
      ['RELAY ACQUISITION','×'+stats.link.toFixed(2),true],
      ['COOLING RATE','×'+stats.cooling.toFixed(1),true],
      ['CONTROL RESPONSE','×'+stats.handling.toFixed(2),true],
      ['SCIENCE YIELD','×'+(stats.yield*stats.recovery).toFixed(2),true],
      ['PROPELLANT LOAD',stats.fuelMass+' t',true]
    ];
    const statItem = ([label, value, ok]) => \`<div class="readiness-item \${ok ? '' : 'invalid'}"><span class="readiness-item-label">\${label}</span><b class="readiness-item-val">\${value}</b></div>\`;
    const card1 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">01</span><h4 class="readiness-card-title">MASS & BUDGET</h4></div><div class="readiness-card-body">\${statItem(rows[0])}\${statItem(rows[1])}</div></div>\`;
    const card2 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">02</span><h4 class="readiness-card-title">PROPULSION DYNAMICS</h4></div><div class="readiness-card-body">\${statItem(rows[2])}\${statItem(rows[3])}</div></div>\`;
    const card3 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">03</span><h4 class="readiness-card-title">POWER & THERMAL</h4></div><div class="readiness-card-body">\${statItem(rows[4])}\${statItem(rows[5])}\${statItem(rows[6])}</div></div>\`;
    const statusText = !complete ? 'Install one component in every socket.' : busy ? 'Securing module mounts…' : stats.valid ? '✓ Structure, budget and continuous power checks passed.' : stats.issues.join('<br>');
    const card4 = \`<div class="readiness-card systems-verification-card"><div class="readiness-card-header"><span class="readiness-card-tag \${complete && stats.valid ? 'verified' : ''}">04</span><h4 class="readiness-card-title">SYSTEMS VERIFICATION</h4></div><div class="readiness-card-body"><b class="systems-count-text">\${count} • \${SYSTEMS.length} SYSTEMS CONNECTED</b><p class="systems-status-copy">\${statusText}</p></div></div>\`;
    this.root.querySelector('#hangar-stats').innerHTML=\`<div class="readiness-cards-container">\${card1}\${card2}\${card3}\${card4}</div><details class="engineering-extra"><summary>MORE ENGINEERING READOUTS</summary>\${rows.slice(7).map(([label,value,ok])=>\`<div class="hangar-stat \${ok?'':'invalid'}"><span>\${label}</span><b>\${value}</b></div>\`).join('')}</details><p class="projection-note">\${complete?'All modules installed.':'Performance projects all nine selected modules. Assembled mass/cost count installed parts only.'}</p>\`;
    const oldChecklist = this.root.querySelector('.assembly-checklist');
    if (oldChecklist) oldChecklist.style.display = 'none';
    this.root.querySelector('#assembly-readiness').textContent=this.ready?'VEHICLE READY · CONTINUE TO FLIGHT PLANNING':!complete?'STEP '+(count+1)+' • 9 • '+(SYSTEMS.length-count)+' MODULES TO INSTALL':busy?'SECURING THE LAST MODULE':stats.issues[0];
    this.root.querySelector('#launch-button').disabled=!this.ready;
    this.root.querySelector('[data-hangar="remove"]').disabled=!this.installed[this.slot];
  }
  update(dt){if(this.disposed)return;this.time+=dt;let finished=false;this.modules.forEach((m,i)=>{if(!m)return;if(this.animations[i]>0){this.animations[i]=Math.max(0,this.animations[i]-dt*.8);if(!this.animations[i])finished=true;}const target=new T.Vector3().fromArray(OFFSETS[i]).multiplyScalar(this.exploded?.65:0);if(this.animations[i]>0)target.add(new T.Vector3().fromArray(OFFSETS[i]).multiplyScalar(this.animations[i]**3*1.5));m.position.lerp(target,Math.min(1,dt*10));});if(finished){this.root.querySelector('#assembly-message').textContent='Module secured. Connections established. Select the next subsystem or revise your design.';this.refresh();}const active=this.animations.findIndex(n=>n>0);
    const target=active>=0?new T.Vector3().fromArray(MOUNTS[active]).add(this.modules[active].position):new T.Vector3(9,-2,3);
    this.armTip.lerp(target,Math.min(1,dt*4));const base=new T.Vector3(12,-4.7,4),elbow=base.clone().lerp(this.armTip,.45);elbow.y+=4;
    const points=[base,elbow,this.armTip];this.armJoints.forEach((m,i)=>m.position.copy(points[i]));this.armLinks.forEach((m,i)=>{const a=points[i],b=points[i+1],direction=b.clone().sub(a);m.position.copy(a).add(b).multiplyScalar(.5);m.scale.y=direction.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());});
    this.controls.update();this.renderer.render(this.scene,this.camera);
    const w=this.previewHost.clientWidth,h=this.previewHost.clientHeight;if(w&&h){this.previewRenderer.setScissorTest(true);this.previewScenes.forEach((s,i)=>{s.userData.pivot.rotation.set(.18,this.time*.35+i*.7,0);this.previewRenderer.setViewport(i*w/3,0,w/3,h);this.previewRenderer.setScissor(i*w/3,0,w/3,h);this.previewRenderer.render(s,this.previewCamera);});this.previewRenderer.setScissorTest(false);}}
  dispose(){this.disposed=true;this.resize.disconnect();this.root.removeEventListener('click',this.click);this.root.removeEventListener('keydown',this.navigate);this.root.removeEventListener('change',this.change);this.controls.dispose();disposeModel(this.scene);this.previewScenes.forEach(disposeModel);this.renderer.dispose();this.previewRenderer.dispose();this.renderer.forceContextLoss();this.previewRenderer.forceContextLoss();}
}
`;

const newCode = code.slice(0, idx) + cleanTail;
fs.writeFileSync(assemblyPath, newCode, 'utf8');
console.log('assembly.js cleanTail successfully written!');
