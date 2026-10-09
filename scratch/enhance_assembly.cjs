const fs = require('fs');
const path = require('path');

const assemblyPath = path.resolve('c:/Users/User/.gemini/antigravity/scratch/mission-nasa-game/src/game/src/assembly.js');
let code = fs.readFileSync(assemblyPath, 'utf8');

// 1. Move build-flexibility to after #hangar-stats so the 4 Cards appear first!
code = code.replace(
  "root.querySelector('.hangar-subtitle').insertAdjacentHTML('afterend'",
  "root.querySelector('#hangar-stats').insertAdjacentHTML('afterend'"
);

// 2. Add preserveDrawingBuffer: true so headless Chrome screenshots capture WebGL backbuffer
code = code.replace(
  'this.renderer=new T.WebGLRenderer({antialias:true});',
  'this.renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});'
);

// 3. Render immediately in size() and refresh()
code = code.replace(
  'this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}',
  'this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);}'
);

code = code.replace(
  'this.root.querySelector(\'#launch-button\').disabled=!this.ready;',
  'this.root.querySelector(\'#launch-button\').disabled=!this.ready;this.renderer.render(this.scene,this.camera);'
);

fs.writeFileSync(assemblyPath, code, 'utf8');
console.log('assembly.js updated with preserveDrawingBuffer and card position!');
