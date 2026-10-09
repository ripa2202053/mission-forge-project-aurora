const fs = require('fs');

let js = fs.readFileSync('src/game/dist/assets/index-GBrhA35l.js', 'utf8');

const target = 'let Yt=2;try{const P=(new URLSearchParams(window.location.search).get("destination")||"").toLowerCase(),M={earth:0,moon:1,mars:2,vesta:3,asteroid:3,asteroids:3,jupiter:4,europa:4};P&&M[P]!==void 0&&(Yt=M[P])}catch{}is(),tt(Yt)';
const replacement = 'let _targetDestIndex=2;try{const P=(new URLSearchParams(window.location.search).get("destination")||"").toLowerCase(),M={earth:0,moon:1,mars:2,vesta:3,asteroid:3,asteroids:3,jupiter:4,europa:4};P&&M[P]!==void 0&&(_targetDestIndex=M[P])}catch{}is(),tt(_targetDestIndex)';

if (!js.includes(target)) {
  console.error('Target string not found in index-GBrhA35l.js!');
  process.exit(1);
}

js = js.replace(target, replacement);
fs.writeFileSync('src/game/dist/assets/index-GBrhA35l.js', js, 'utf8');
console.log('Successfully replaced Yt with _targetDestIndex in bundle!');
