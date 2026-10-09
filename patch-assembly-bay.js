const fs = require('fs');

const bundlePath = 'src/game/dist/assets/index-GBrhA35l.js';
let js = fs.readFileSync(bundlePath, 'utf8');

const replacements = [
  // Subsystem labels
  ['"01 / PROPULSION"', '"01 • PROPULSION"'],
  ['"Chemical / LH₂"', '"Chemical • LH₂"'],
  ['"Ion / Xenon"', '"Ion • Xenon"'],
  ['"02 / POWER SYSTEM"', '"02 • POWER SYSTEM"'],
  ['"03 / VEHICLE PROTECTION"', '"03 • VEHICLE PROTECTION"'],
  ['"04 / SCIENCE PAYLOAD"', '"04 • SCIENCE PAYLOAD"'],
  ['"05 / COMMUNICATIONS"', '"05 • COMMUNICATIONS"'],
  ['"06 / THERMAL CONTROL"', '"06 • THERMAL CONTROL"'],
  ['"07 / ATTITUDE CONTROL"', '"07 • ATTITUDE CONTROL"'],
  ['"08 / RECOVERY BAY"', '"08 • RECOVERY BAY"'],
  ['"09 / PROPELLANT TANKS"', '"09 • PROPELLANT TANKS"'],
  // Phases and steps
  ['PHASE 00 / BUILD YOUR VEHICLE', 'PHASE 00 • BUILD YOUR VEHICLE'],
  ['ODYSSEY / MODULAR EXPLORER', 'ODYSSEY • MODULAR EXPLORER'],
  ['STEP 1 / 9 — Select a propulsion module below to start building Odyssey 07.', 'STEP 1 • 9 — Select a propulsion module below to start building Odyssey 07.'],
  ['" / 9 · "', '" • 9 · "'],
  ['" / SELECT TO INSTALL"', '" • SELECT TO INSTALL"'],
  // Single-line clean aerospace subheader
  ['<span>ORBITAL ASSEMBLY BAY <b>07</b></span>', '<span class="assembly-subheader">ORBITAL ASSEMBLY BAY • VESSEL ODYSSEY 07</span>'],
  // Three.js scene colors in ki
  ['this.scene.background=new U(463647),this.scene.fog=new Hs(463647,55,130)', 'this.scene.background=new U(132630),this.scene.fog=new Hs(132630,55,130)'],
  ['this.renderer.setClearColor(463647)', 'this.renderer.setClearColor(132630)'],
  ['new Fs(140,70,1857897,1058356)', 'new Fs(140,70,58879,17300)'],
  ['new ee({color:2982290})', 'new ee({color:58879,transparent:!0,opacity:.8})'],
  ['this.camera=new ht(40,1,.1,200),this.camera.position.set(16,12,19)', 'this.camera=new ht(37,1,.1,200),this.camera.position.set(13.2,9.8,15.5)']
];

let count = 0;
for (const [target, replacement] of replacements) {
  if (js.includes(target)) {
    js = js.replace(target, replacement);
    count++;
    console.log(`✓ Replaced: ${target.substring(0, 45)}...`);
  } else {
    console.warn(`⚠ Not found: ${target.substring(0, 45)}...`);
  }
}

fs.writeFileSync(bundlePath, js, 'utf8');
console.log(`Done! Total ${count} / ${replacements.length} replacements applied.`);
