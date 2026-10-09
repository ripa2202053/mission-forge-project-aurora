const fs = require('fs');
const path = require('path');

const assemblyPath = path.resolve('c:/Users/User/.gemini/antigravity/scratch/mission-nasa-game/src/game/src/assembly.js');
let code = fs.readFileSync(assemblyPath, 'utf8');

// 1. Rewrite componentCard function to match exact content from prompt
const oldComponentCardRegex = /function componentCard\(hangar,slot,choice\)\{[\s\S]*?\n\}\n\nconst OFFSETS/;

const newComponentCard = `function componentCard(hangar,slot,choice){
  const preview=componentPreview(hangar.loadout,hangar.destination.id,slot,choice),p=preview.part,installed=hangar.installed[slot]&&hangar.loadout[slot]===choice;
  Object.assign(preview.after,hangar.buildCheck(preview.after));
  
  let fullTitle = p.name;
  if(slot === 0){
    if(choice === 0) fullTitle = 'Balanced: Chemical / LH2';
    else if(choice === 1) fullTitle = 'Endurance: Ion / Xenon';
    else if(choice === 2) fullTitle = 'Performance: Advanced chemical';
  } else {
    const tagTitle = p.tag.charAt(0).toUpperCase() + p.tag.slice(1).toLowerCase();
    fullTitle = p.name.toLowerCase().startsWith(tagTitle.toLowerCase()) ? p.name : tagTitle + ': ' + p.name;
  }

  let specsLine = '';
  if(slot === 0){
    const demandVal = choice === 1 ? '5.148 kW' : '0.150 kW';
    const thrustVal = choice === 1 ? '0.35 N' : '200 kN';
    specsLine = 'Power draw ' + demandVal + ' / Thrust ' + thrustVal;
  } else if(preview.specs && preview.specs.length > 0){
    specsLine = preview.specs.map(([label, value]) => label + ' ' + value).join(' / ');
  }

  return \`<button data-part="\${choice}" data-demand="\${p.demand}" data-margin="\${preview.after.powerMargin}" aria-label="Install \${fullTitle}" aria-pressed="\${installed}">
    <span class="part-number"><span class="cyber-num-pill">0\${choice+1}</span><span class="part-tag-text">\${p.tag}</span></span>
    <strong class="part-title">\${fullTitle}</strong>
    <small class="part-specs-row">\${p.mass} t structure • $\${p.cost}M</small>
    <span class="part-description">\${p.description}</span>
    <span class="component-specs-label">\${specsLine}</span>
    <div class="part-icons-row">
      <span class="meta-item"><svg class="meta-icon" viewBox="0 0 12 12" fill="none"><path d="M2.5 10.5H9.5L8 4.5H4L2.5 10.5Z" stroke="currentColor" stroke-width="1.1"/><circle cx="6" cy="3" r="1.3" stroke="currentColor" stroke-width="1.1"/></svg>\${p.mass} t</span>
      <span class="meta-bullet">•</span>
      <span class="meta-item"><span class="currency-tag">$</span>\${p.cost}M</span>
      \${p.demand ? \`<span class="meta-bullet">•</span><span class="meta-item"><svg class="meta-icon spark-icon" viewBox="0 0 12 12" fill="none"><path d="M6 1L2.5 6.5H5.8L5 11L9.5 5H6.2L6 1Z" fill="currentColor"/></svg>\${Number(p.demand).toFixed(3)} kW</span>\` : ''}
    </div>
    <span class="part-comparison">
      <em>FULL BUILD PREVIEW • VS SELECTED DESIGN</em>
      <span>Wet mass <b>\${preview.after.mass.toFixed(1)} t (\${signed(preview.delta.mass)})</b></span>
      <span>Cost <b>$\${preview.after.cost}M (\${signed(preview.delta.cost,0)})</b></span>
      <span>Ideal Δv <b>\${preview.after.deltaV.toFixed(2)} km/s (\${signed(preview.delta.deltaV,2)})</b></span>
      <span>Power margin <b class="\${preview.after.powerMargin<0?'invalid':''}">\${signed(preview.after.powerMargin,2)} kW</b></span>
    </span>
    <span class="part-validity \${preview.after.valid?'':'invalid'}">\${preview.after.valid?'✓ WITHIN DESIGN LIMITS':preview.after.issues[0]}</span>
    <b class="install-action-btn">\${installed?'✓ INSTALLED':'+ INSTALL MODULE'}</b>
  </button>\`;
}

const OFFSETS`;

code = code.replace(oldComponentCardRegex, newComponentCard);

// 2. Middle cards: preserve slot slash "/":
const oldSlotsRegex = /<div class="hangar-slots"[^>]*>[\s\S]*?<\/div>/;
const newSlots = `<div class="hangar-slots" role="group" aria-label="Assembly subsystems">\${SYSTEMS.map((s,i)=>{ const labelClean = s.label.replace(/^\\d+\\s*[\\/•]\\s*/,''); return \`<button data-slot="\${i}" aria-pressed="\${i===0}"><span class="slot-pill"><b class="slot-num">0\${i+1}</b></span><b class="slot-title">\${labelClean}</b><span class="slot-slash">/</span><small id="socket-\${i}" class="slot-sub">EMPTY SOCKET</small></button>\`; }).join('')}</div>`;

code = code.replace(oldSlotsRegex, newSlots);

fs.writeFileSync(assemblyPath, code, 'utf8');
console.log('assembly.js updated with exact content and layout!');
