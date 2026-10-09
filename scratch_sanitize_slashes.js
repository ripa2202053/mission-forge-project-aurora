const fs = require('fs');

let js = fs.readFileSync('src/game/dist/assets/index-GBrhA35l.js', 'utf8');

const replacements = [
  ['"MISSION FORGE / "', '"MISSION FORGE • "'],
  ['"MISSION PLANNING / MARS"', '"MISSION PLANNING • MARS"'],
  ['"FIELD OPERATIONS / "', '"FIELD OPERATIONS • "'],
  ['"CHAPTER "+s.chapter+" / "', '"CHAPTER "+s.chapter+" • "'],
  ['"FLIGHT COMPUTER / PAUSED"', '"FLIGHT COMPUTER • PAUSED"'],
  ['"SCIENCE / ASSETS / MODEL"', '"SCIENCE • ASSETS • MODEL"'],
  ['"EXPEDITION COMPLETE / "', '"EXPEDITION COMPLETE • "'],
  ['"DOCKING / RELATIVE MOTION"', '"DOCKING • RELATIVE MOTION"'],
  ['"LANDING / CAPTURE CORRIDOR"', '"LANDING • CAPTURE CORRIDOR"'],
  ['FRAGMENT ${s.index+1} / 3 RECOVERED', 'FRAGMENT ${s.index+1} • 3 RECOVERED'],
  ['0${e+1} / ', '0${e+1} • '],
  ['"Pause / resume"', '"Pause • resume"'],
  ['"Controls / flight log"', '"Controls • flight log"'],
  ['"Mute / fullscreen"', '"Mute • fullscreen"'],
  ['"Thrust / rover forward"', '"Thrust • rover forward"'],
  ['"Brake / reverse"', '"Brake • reverse"'],
  ['"Translate / rover steering"', '"Translate • rover steering"'],
  ['"Altitude / rover drive"', '"Altitude • rover drive"'],
  ['"Engine / science / shield power"', '"Engine • science • shield power"'],
  ['NASA / JPL / Caltech', 'NASA • JPL • Caltech'],
  ['${s.chapter} / ${s.short.toUpperCase()}', '${s.chapter} • ${s.short.toUpperCase()}'],
  ['padStart(2,"0")} / ${String(l.targets.length)', 'padStart(2,"0")} • ${String(l.targets.length)']
];

let count = 0;
for (const [from, to] of replacements) {
  if (js.includes(from)) {
    js = js.split(from).join(to);
    count++;
  } else {
    console.log('Not found:', from);
  }
}

console.log('Successfully replaced items:', count);
fs.writeFileSync('src/game/dist/assets/index-GBrhA35l.js', js, 'utf8');
