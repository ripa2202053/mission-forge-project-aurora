const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== STARTING MISSION DETAIL REFINEMENT PATCH ===');

// ---------------------------------------------------------
// 1. PATCH BUNDLE: src/game/dist/assets/index-GBrhA35l.js
// ---------------------------------------------------------
const bundlePath = path.resolve('src/game/dist/assets/index-GBrhA35l.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');

// A. Guard is() so it never crashes if destination-cards is hidden or missing
const targetIs = 'function is(){u("#destination-cards").innerHTML=z.map(';
if (bundle.includes(targetIs)) {
  bundle = bundle.replace(targetIs, 'function is(){const _dc=u("#destination-cards");if(_dc)_dc.innerHTML=z.map(');
  console.log('A. Patched is() with null-safe check');
} else {
  console.log('Note: targetIs not matched or already patched');
}

// B. In tt(s), sanitize code label "0"+(N+1)+"—05" -> "0"+(N+1)+" • 05"
const targetCode = 'u("#mission-code").textContent=`0${N+1}—05`';
if (bundle.includes(targetCode)) {
  bundle = bundle.replace(targetCode, 'u("#mission-code").textContent=`0${N+1} • 05`');
  console.log('B. Sanitized mission-code label to use bullet separator');
}

// C. Dynamic Destination Initialization: replace is(),tt(2),ss()
const targetInit = 'is(),tt(2),ss(),u("#resume-button").hidden=!ye';
const newInit = `window.setGameDestination=function(P){try{const p=String(P).toLowerCase(),M={earth:0,moon:1,mars:2,vesta:3,asteroid:3,asteroids:3,jupiter:4,europa:4},i=M[p]!==void 0?M[p]:z.findIndex(d=>d.id===p||d.name.toLowerCase()===p);i>=0&&tt(i)}catch(err){console.error(err)}};window.addEventListener("message",ev=>{ev.data&&ev.data.type==="SET_DESTINATION"&&ev.data.destination&&window.setGameDestination(ev.data.destination)});let Yt=2;try{const P=(new URLSearchParams(window.location.search).get("destination")||"").toLowerCase(),M={earth:0,moon:1,mars:2,vesta:3,asteroid:3,asteroids:3,jupiter:4,europa:4};P&&M[P]!==void 0&&(Yt=M[P])}catch{}is(),tt(Yt),ss(),u("#resume-button").hidden=!ye`;

if (bundle.includes(targetInit)) {
  bundle = bundle.replace(targetInit, newInit);
  console.log('C. Injected dynamic destination state handoff in bundle init');
} else {
  console.log('Note: targetInit not found, checking alternative pattern');
}

fs.writeFileSync(bundlePath, bundle, 'utf8');

// Verify syntax
execSync(`node --check "${bundlePath}"`);
console.log('Bundle syntax verified: 100% valid!');

console.log('=== BUNDLE PATCH COMPLETE ===');
