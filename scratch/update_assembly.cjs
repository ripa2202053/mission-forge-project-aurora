const fs = require('fs');
const path = require('path');

const assemblyPath = path.resolve('c:/Users/User/.gemini/antigravity/scratch/mission-nasa-game/src/game/src/assembly.js');
let code = fs.readFileSync(assemblyPath, 'utf8');

// 1. Change ORBITAL ASSEMBLY BAY 07 to ORBITAL ASSEMBLY BAY • VESSEL ODYSSEY 07
code = code.replace(
  '<span>ORBITAL ASSEMBLY BAY <b>07</b></span>',
  '<span class="assembly-subheader">ORBITAL ASSEMBLY BAY • VESSEL ODYSSEY 07</span>'
);

// 2. Update camera position to bring vehicle closer in viewport
code = code.replace(
  'this.camera=new T.PerspectiveCamera(40,1,.1,200);this.camera.position.set(16,12,19);',
  'this.camera=new T.PerspectiveCamera(40,1,.1,200);this.camera.position.set(13,9.8,15.5);'
);
code = code.replace(
  "if(action==='reset'){this.camera.position.set(16,12,19);this.controls.target.set(0,0,0);}",
  "if(action==='reset'){this.camera.position.set(13,9.8,15.5);this.controls.target.set(0,0,0);}"
);

// 3. Update right panel header with cyber hamburger toggle
const oldHeader = '<aside class="hangar-readiness"><span class="eyebrow">FLIGHT ENGINEERING</span><h3>${destination.name} EXPEDITION</h3>';
const newHeader = '<aside class="hangar-readiness"><div class="readiness-header-row"><div><span class="eyebrow">FLIGHT ENGINEERING</span><h3>${destination.name} EXPEDITION</h3></div><button class="cyber-hamburger-btn" data-hangar="engineering" aria-label="Toggle Flight Engineering" title="Toggle Engineering Panel"><span class="cyber-hamburger"><i></i><i></i><i></i></span></button></div>';
code = code.replace(oldHeader, newHeader);

// 4. Update refresh() to render the 4 individual floating dark-blue glass Cards
const oldRefreshRows = `const rows=[['ASSEMBLED WET MASS',currentMass+' / 85 t',currentMass<=85],['ASSEMBLED COST','$'+currentCost+' / 320M',currentCost<=320],['PROJECTED IDEAL Δv',stats.deltaV.toFixed(2)+' km/s',true],['REAL INITIAL ACCEL.',stats.acceleration<.001?stats.acceleration.toExponential(2)+' m/s²':stats.acceleration.toFixed(2)+' m/s²',true],['DESTINATION GENERATION',stats.generatedKW.toFixed(2)+' kW',true],['PROJECTED DEMAND',stats.demandKW.toFixed(2)+' kW',true],['POWER MARGIN',(stats.powerMargin>=0?'+':'')+stats.powerMargin.toFixed(2)+' kW',stats.powerMargin>=0],['FULL PROPELLANT BURN',stats.burnSeconds>86400?(stats.burnSeconds/86400).toFixed(0)+' days':(stats.burnSeconds/60).toFixed(1)+' min',true],['RELAY ACQUISITION','×'+stats.link.toFixed(2),true],['COOLING RATE','×'+stats.cooling.toFixed(1),true],['CONTROL RESPONSE','×'+stats.handling.toFixed(2),true],['SCIENCE YIELD','×'+(stats.yield*stats.recovery).toFixed(2),true],['PROPELLANT LOAD',stats.fuelMass+' t',true]];
    rows[0]=['ASSEMBLED WET MASS',currentMass+' / '+stats.massLimit+' t',currentMass<=stats.massLimit];rows[1]=['ASSEMBLED COST','$'+currentCost+' / '+stats.costLimit+'M',currentCost<=stats.costLimit];
    this.root.querySelector('#hangar-stats').innerHTML=rows.slice(0,7).map(([label,value,ok])=>\`<div class="hangar-stat \${ok?'':'invalid'}"><span>\${label}</span><b>\${value}</b></div>\`).join('')+\`<details class="engineering-extra"><summary>MORE ENGINEERING READOUTS</summary>\${rows.slice(7).map(([label,value,ok])=>\`<div class="hangar-stat \${ok?'':'invalid'}"><span>\${label}</span><b>\${value}</b></div>\`).join('')}</details><p class="projection-note">\${complete?'All modules installed.':'Performance projects all nine selected modules. Assembled mass/cost count installed parts only.'}</p>\`;
    this.root.querySelector('.assembly-checklist').innerHTML=\`<b>\${count} • \${SYSTEMS.length} SYSTEMS CONNECTED</b><p>\${!complete?'Install one component in every socket.':busy?'Securing module mounts…':stats.valid?'✓ Structure, budget and continuous power checks passed.':stats.issues.join('<br>')}</p>\`;`;

const newRefreshRows = `const rows=[['ASSEMBLED WET MASS',currentMass+' • '+stats.massLimit+' t',currentMass<=stats.massLimit],['ASSEMBLED COST','$'+currentCost+' • '+stats.costLimit+'M',currentCost<=stats.costLimit],['PROJECTED IDEAL Δv',stats.deltaV.toFixed(2)+' km/s',true],['REAL INITIAL ACCEL.',stats.acceleration<.001?stats.acceleration.toExponential(2)+' m/s²':stats.acceleration.toFixed(2)+' m/s²',true],['DESTINATION GENERATION',stats.generatedKW.toFixed(2)+' kW',true],['PROJECTED DEMAND',stats.demandKW.toFixed(2)+' kW',true],['POWER MARGIN',(stats.powerMargin>=0?'+':'')+stats.powerMargin.toFixed(2)+' kW',stats.powerMargin>=0],['FULL PROPELLANT BURN',stats.burnSeconds>86400?(stats.burnSeconds/86400).toFixed(0)+' days':(stats.burnSeconds/60).toFixed(1)+' min',true],['RELAY ACQUISITION','×'+stats.link.toFixed(2),true],['COOLING RATE','×'+stats.cooling.toFixed(1),true],['CONTROL RESPONSE','×'+stats.handling.toFixed(2),true],['SCIENCE YIELD','×'+(stats.yield*stats.recovery).toFixed(2),true],['PROPELLANT LOAD',stats.fuelMass+' t',true]];
    const statItem = ([label, value, ok]) => \`<div class="readiness-item \${ok ? '' : 'invalid'}"><span class="readiness-item-label">\${label}</span><b class="readiness-item-val">\${value}</b></div>\`;
    const card1 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">01</span><h4 class="readiness-card-title">MASS & BUDGET</h4></div><div class="readiness-card-body">\${statItem(rows[0])}\${statItem(rows[1])}</div></div>\`;
    const card2 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">02</span><h4 class="readiness-card-title">PROPULSION DYNAMICS</h4></div><div class="readiness-card-body">\${statItem(rows[2])}\${statItem(rows[3])}</div></div>\`;
    const card3 = \`<div class="readiness-card"><div class="readiness-card-header"><span class="readiness-card-tag">03</span><h4 class="readiness-card-title">POWER & THERMAL</h4></div><div class="readiness-card-body">\${statItem(rows[4])}\${statItem(rows[5])}\${statItem(rows[6])}</div></div>\`;
    const statusText = !complete ? 'Install one component in every socket.' : busy ? 'Securing module mounts…' : stats.valid ? '✓ Structure, budget and continuous power checks passed.' : stats.issues.join('<br>');
    const card4 = \`<div class="readiness-card systems-verification-card"><div class="readiness-card-header"><span class="readiness-card-tag \${complete && stats.valid ? 'verified' : ''}">04</span><h4 class="readiness-card-title">SYSTEMS VERIFICATION</h4></div><div class="readiness-card-body"><b class="systems-count-text">\${count} • \${SYSTEMS.length} SYSTEMS CONNECTED</b><p class="systems-status-copy">\${statusText}</p></div></div>\`;
    this.root.querySelector('#hangar-stats').innerHTML=\`<div class="readiness-cards-container">\${card1}\${card2}\${card3}\${card4}</div><details class="engineering-extra"><summary>MORE ENGINEERING READOUTS</summary>\${rows.slice(7).map(([label,value,ok])=>\`<div class="hangar-stat \${ok?'':'invalid'}"><span>\${label}</span><b>\${value}</b></div>\`).join('')}</details><p class="projection-note">\${complete?'All modules installed.':'Performance projects all nine selected modules. Assembled mass/cost count installed parts only.'}</p>\`;
    const oldChecklist = this.root.querySelector('.assembly-checklist');
    if (oldChecklist) oldChecklist.style.display = 'none';`;

code = code.replace(oldRefreshRows, newRefreshRows);

fs.writeFileSync(assemblyPath, code, 'utf8');
console.log('assembly.js updated successfully!');
