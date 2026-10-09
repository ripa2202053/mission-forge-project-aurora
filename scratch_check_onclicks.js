const fs = require('fs');
const js = fs.readFileSync('src/game/dist/assets/index-GBrhA35l.js', 'utf8');
const html = fs.readFileSync('src/game/dist/index.html', 'utf8');

const regex = /u\("([^"]+)"\)\.onclick/g;
let m;
while ((m = regex.exec(js)) !== null) {
  const sel = m[1];
  const inHtml = html.includes(sel.replace(/^[#.]/, ''));
  console.log(`Selector: ${sel} | Found in HTML: ${inHtml}`);
}
