const fs = require('fs');
const path = require('path');

const audioPath = path.join(__dirname, '..', 'src', 'game', 'src', 'audio.js');
let code = fs.readFileSync(audioPath, 'utf8');

// Replace pan
code = code.replace(
  `this.enginePan.pan.setTargetAtTime(moving ? Math.max(-0.6, Math.min(0.6, sim.velocity.x / 25)) : 0, t, 0.1);`,
  `const panVal = (moving && sim && sim.velocity && typeof sim.velocity.x === 'number') ? Math.max(-0.6, Math.min(0.6, sim.velocity.x / 25)) : 0;\n      this.enginePan.pan.setTargetAtTime(panVal, t, 0.1);`
);

// Replace tension
code = code.replace(
  `const speedTension = moving && sim.speed > 22 ? Math.min(1, (sim.speed - 22) / 22) : 0;
      const fuelTension = moving && sim.fuel < 20 ? Math.min(1, (20 - sim.fuel) / 20) : 0;
      const hullTension = moving && sim.hull < 25 ? Math.min(1, (25 - sim.hull) / 25) : 0;`,
  `const speedTension = (moving && typeof sim?.speed === 'number' && sim.speed > 22) ? Math.min(1, (sim.speed - 22) / 22) : 0;
      const fuelTension = (moving && typeof sim?.fuel === 'number' && sim.fuel < 20) ? Math.min(1, (20 - sim.fuel) / 20) : 0;
      const hullTension = (moving && typeof sim?.hull === 'number' && sim.hull < 25) ? Math.min(1, (25 - sim.hull) / 25) : 0;`
);

// Replace warning
code = code.replace(
  `const isWarning = moving && (sim.fuel < 15 || sim.hull < 20 || (sim.heat && sim.heat > 80));`,
  `const isWarning = moving && ((typeof sim?.fuel === 'number' && sim.fuel < 15) || (typeof sim?.hull === 'number' && sim.hull < 20) || (typeof sim?.heat === 'number' && sim.heat > 80));`
);

fs.writeFileSync(audioPath, code, 'utf8');
console.log('✓ Successfully patched audio.js update method safely!');
