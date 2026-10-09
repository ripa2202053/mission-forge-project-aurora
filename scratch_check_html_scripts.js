const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('0.15 • threshold', '0.15 // threshold');
html = html.replace(/0\.15\s+threshold/g, '0.15 // threshold');

fs.writeFileSync('index.html', html, 'utf8');

const vm = require('vm');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;
let errors = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptIdx++;
  const code = match[1];
  if (!code.trim()) continue;
  try {
    new vm.Script(code);
    console.log(`Script #${scriptIdx}: SYNTAX OK`);
  } catch (err) {
    errors++;
    console.error(`Script #${scriptIdx} SYNTAX ERROR:`, err.message);
    const lines = code.split('\n');
    const errLine = err.stack.match(/<anonymous>:(\d+)/);
    if (errLine) {
      const lineNum = parseInt(errLine[1], 10);
      console.log('Error line', lineNum, ':', lines[lineNum - 1]);
    }
  }
}

console.log('Total script errors remaining:', errors);
