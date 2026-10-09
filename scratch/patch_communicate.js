const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'game', 'src', 'main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

const target = "function communicate(speaker,message,speak=true){transcript=message;typed=0;$('#comm-speaker').textContent=speaker.toUpperCase();$('#comm-state').textContent='INCOMING TRANSMISSION';if(speak)audio.speak(message);}";
const replacement = "function communicate(speaker,message,speak=true){transcript=message;typed=0;$('#comm-speaker').textContent=speaker.toUpperCase();$('#comm-state').textContent='INCOMING TRANSMISSION';audio.playQuindar('intro');if(speak){audio.speak(message,()=>{setTimeout(()=>audio.playQuindar('outro'),200);});}else{setTimeout(()=>{audio.playQuindar('outro');},Math.min(2400,Math.max(800,message.length*36)));}}";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(mainJsPath, code, 'utf8');
  console.log('✓ Successfully patched communicate with Quindar intro & outro!');
} else {
  console.log('Target not found in main.js');
}
