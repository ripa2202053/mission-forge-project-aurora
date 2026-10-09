const fs = require('fs');

let js = fs.readFileSync('src/game/dist/assets/index-GBrhA35l.js', 'utf8');

// Update Mars in z array
js = js.replace('distance:"225 million km · mean"', 'distance:"225M KM • MEAN",riskText:"CLASS III • HABITABLE VOID"');
js = js.replace('type:"Search & discovery"', 'type:"SEARCH • DISCOVERY"');

// Update Earth in z array
js = js.replace('distance:"408 km orbit"', 'distance:"408 KM • LEO",riskText:"CLASS I • CLIMATE SENTINEL"');
js = js.replace('type:"Orbital recovery"', 'type:"ORBITAL • RECOVERY"');

// Update Moon in z array
js = js.replace('distance:"384,400 km"', 'distance:"384,400 KM • LUNAR",riskText:"CLASS II • POLAR BASIN"');
js = js.replace('type:"Polar expedition"', 'type:"POLAR • EXPEDITION"');

// Update Vesta in z array
js = js.replace('distance:"2.36 AU · mean orbit"', 'distance:"2.36 AU • BELT",riskText:"CLASS IV • ANCIENT REGOLITH"');
js = js.replace('type:"Ancient sample return"', 'type:"SAMPLE • RETURN"');

// Update Jupiter in z array
js = js.replace('distance:"5.2 AU · mean orbit"', 'distance:"5.2 AU • MEAN",riskText:"CLASS V • RADIATION BELT"');
js = js.replace('type:"Deep-space flyby"', 'type:"DEEP SPACE • FLYBY"');

// Update tt(s) to use riskText if available
const oldTtPart = 'u("#risk-label").textContent="CLASS "+["I","II","III","IV","V"][e.difficulty-1]';
const newTtPart = 'u("#risk-label").textContent=e.riskText||("CLASS "+["I","II","III","IV","V"][e.difficulty-1])';
if (js.includes(oldTtPart)) {
  js = js.replace(oldTtPart, newTtPart);
  console.log('Updated tt(s) risk-label assignment');
}

fs.writeFileSync('src/game/dist/assets/index-GBrhA35l.js', js, 'utf8');
console.log('Successfully updated destination specs in index-GBrhA35l.js');
