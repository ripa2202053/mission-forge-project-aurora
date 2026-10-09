const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const origPath = 'C:\\Users\\User\\Downloads\\Astraea-Mission-Control\\Astraea-Mission-Control\\dist\\assets\\index-GBrhA35l.js';
const bundlePath = path.resolve('src/game/dist/assets/index-GBrhA35l.js');

// Copy fresh original
fs.copyFileSync(origPath, bundlePath);
console.log('Restored original bundle from Downloads.');

let code = fs.readFileSync(bundlePath, 'utf8');
console.log('Original bundle length:', code.length);

// 1. In refresh: this.ready=i&&e.valid&&!n -> this.ready=i&&e.valid
const targetRefresh = 'this.ready=i&&e.valid&&!n';
if (!code.includes(targetRefresh)) {
  console.error('FAILED to find targetRefresh');
  process.exit(1);
}
code = code.replace(targetRefresh, 'this.ready=i&&e.valid');
console.log('1. Patched targetRefresh');

// 2. Call autoEquipAll in constructor
const targetCtorEnd = 'module below to start building Odyssey 07.",this.size()}';
if (!code.includes(targetCtorEnd)) {
  console.error('FAILED to find targetCtorEnd');
  process.exit(1);
}
code = code.replace(targetCtorEnd, 'module below to start building Odyssey 07.",this.size(),this.autoEquipAll()}');
console.log('2. Patched constructor to call autoEquipAll');

// 3. Add autoEquipAll method right before dispose() - NOTE: in ES6 class NO COMMA between methods!
const targetDispose = 'dispose(){this.disposed=!0';
if (!code.includes(targetDispose)) {
  console.error('FAILED to find targetDispose');
  process.exit(1);
}
const autoEquipMethod = `autoEquipAll(){try{const t=Qs(this.destination.id);for(let i=0;i<T.length;i++){const c=(t&&t.loadout&&t.loadout[i]!==void 0)?t.loadout[i]:0;this.loadout[i]=c;this.installed[i]=!0;if(this.modules[i]){this.ship.remove(this.modules[i]);ve(this.modules[i]);}const p=pt(i,c);p.userData.flames.forEach(n=>n.visible=!1);p.position.fromArray(ot[i]);this.ship.add(p);this.modules[i]=p;this.animations[i]=0;}this.animations=this.animations.map(()=>0);this.onChange([...this.loadout]);this.selectSlot(0);this.ready=!0;this.refresh();const lb=this.root.querySelector("#launch-button");if(lb)lb.disabled=!1;}catch(err){console.error("autoEquipAll error:",err);}}dispose(){this.disposed=!0`;
code = code.replace(targetDispose, autoEquipMethod);
console.log('3. Added autoEquipAll method (no comma)');

// 4. Update launch-button click listener: e.id==="launch-button"&&X?.ready&&Di()
const targetLaunchBtn = 'e.id==="launch-button"&&X?.ready&&Di()';
if (!code.includes(targetLaunchBtn)) {
  console.error('FAILED to find targetLaunchBtn');
  process.exit(1);
}
code = code.replace(targetLaunchBtn, 'e.id==="launch-button"&&(X&&(!X.ready&&X.autoEquipAll&&X.autoEquipAll()),Di())');
console.log('4. Patched launch-button click handler');

// 5. Enhance SUGGESTED button text
const targetSuggestedBtn = '<button data-hangar="suggested">INSTALL SUGGESTED BUILD</button>';
if (code.includes(targetSuggestedBtn)) {
  code = code.replace(targetSuggestedBtn, '<button data-hangar="suggested" class="aurora-auto-btn">⚡ AUTO-EQUIP ALL (9/9)</button>');
  console.log('5. Replaced suggested button with Aurora styled button');
}

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('Successfully updated bundle. New length:', code.length);

// Verify syntax
execSync(`node --check "${bundlePath}"`);
console.log('BUNDLE SYNTAX VERIFIED: 100% VALID JAVASCRIPT!');
