const fs = require('fs');

const bundlePath = 'src/game/dist/assets/index-GBrhA35l.js';
let js = fs.readFileSync(bundlePath, 'utf8');

const target = '"09 / PROPELLANT STORAGE"';
const replacement = '"09 • PROPELLANT STORAGE"';

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync(bundlePath, js, 'utf8');
  console.log(`✓ Replaced: ${target} -> ${replacement}`);
} else {
  console.log(`Already replaced or not found`);
}
