const fs = require('fs');
const path = require('path');

const dataPath = path.resolve('c:/Users/User/.gemini/antigravity/scratch/mission-nasa-game/src/game/src/data.js');
let code = fs.readFileSync(dataPath, 'utf8');

code = code.replace(/name:'Chemical [^']+'/, "name:'Chemical / LH2'");
code = code.replace(/name:'Ion [^']+'/, "name:'Ion / Xenon'");

fs.writeFileSync(dataPath, code, 'utf8');
console.log('data.js updated with exact original names!');
