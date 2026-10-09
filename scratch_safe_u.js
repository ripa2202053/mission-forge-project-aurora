const fs = require('fs');

let js = fs.readFileSync('src/game/dist/assets/index-GBrhA35l.js', 'utf8');

const target = 'const u=s=>document.querySelector(s),';
const replacement = 'const u=s=>document.querySelector(s)||document.createElement("div"),';

if (!js.includes(target)) {
  console.error('Target u definition not found!');
  process.exit(1);
}

js = js.replace(target, replacement);
fs.writeFileSync('src/game/dist/assets/index-GBrhA35l.js', js, 'utf8');
console.log('Successfully made u null-safe!');
