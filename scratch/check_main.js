const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'game', 'src', 'main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

const startIdx = code.indexOf('function completeMission(){');
const endIdx = code.indexOf('function pauseMenu(){');

console.log('Snippet to replace:');
console.log(code.substring(startIdx, endIdx));
