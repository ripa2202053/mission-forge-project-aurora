const fs = require('fs');

const jsPath = 'src/game/dist/assets/index-GBrhA35l.js';
const js = fs.readFileSync(jsPath, 'utf8');

const idx = js.indexOf('{id:"tanks"');
console.log(js.substring(idx, idx + 100));
