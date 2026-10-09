const fs = require('fs');

function checkFile(name) {
  const content = fs.readFileSync(name, 'utf8');
  // Look for // that are not in URLs (http:// or https://) and not JS comments (/* or // at start of line)
  const lines = content.split('\n');
  const dbls = [];
  lines.forEach((line, idx) => {
    // strip http://, https://, and comment starts
    let trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    const match = line.match(/(?<!https?:)\/\/(?!\/)/g);
    if (match) {
      dbls.push({ line: idx + 1, text: line.trim() });
    }
  });
  console.log(name, 'Found double slashes count:', dbls.length);
  if (dbls.length) {
    console.log(dbls.slice(0, 5));
  }
}

checkFile('src/game/dist/index.html');
checkFile('src/game/index.html');
checkFile('src/game/aurora-theme.css');
checkFile('src/game/dist/assets/index-GBrhA35l.js');
