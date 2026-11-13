# Surface Survival & Ingenuity Drone Recon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Stage 4 surface exploration on Mars (Jezero Crater) and the Moon (Shackleton Rim) into an authentic planetary survival game featuring LIDAR Sonar Pings, dynamic Solar vs. Shadow power balancing, Martian dust storm ridge sheltering, and deployable Ingenuity drone aerial reconnaissance.

**Architecture:** A dedicated surface survival controller (`surface-survival.js`) monitors planetary environmental states (sunlight vectors, cliff shadow masks, dust optical depth, and wind shear). It synchronizes procedural Web Audio (LIDAR sonar ping, twin-rotor drone hum) with Three.js camera transitions (switching between Perseverance ground driving and Ingenuity high-angle aerial scouting) and a tactical `#surface-survival-hud` overlay.

**Tech Stack:** JavaScript (ES Modules), Web Audio API (acoustic sonar reverberation, modulated rotor saw waves), Three.js vector mathematics & ground height sampling, CSS3 tactical gauges, Node.js test runner (`node --test`).

## Global Constraints

- Must preserve all 93 existing unit tests with 0 regressions.
- Non-blocking execution: drone flights, sonar pulses, and storm cycles must never freeze or crash gameplay.
- Seamless compatibility with both Mars (Perseverance + Ingenuity) and Moon (Lunar Rover + Shackleton PSR) environments.
- Every task ends with an independently testable deliverable and a git commit.

---

### Task 1: Procedural Audio for Surface Survival in `audio.js`

**Files:**
- Modify: `src/game/src/audio.js`
- Test: `src/game/tests/surface-audio.test.mjs`

**Interfaces:**
- Produces:
  - `playLidarPing(): Promise<void>`: High-frequency sonar chirping pulse with cavernous decay.
  - `playDroneRotor(active = true): void`: Modulated twin-rotor helicopter blade hum.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/surface-audio.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes LIDAR ping and drone rotor audio methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playLidarPing, 'function');
  assert.equal(typeof audio.playDroneRotor, 'function');
});

test('FlightAudio surface audio methods execute safely without errors', async () => {
  const audio = new FlightAudio();
  await assert.doesNotReject(async () => {
    await audio.playLidarPing();
    audio.playDroneRotor(true);
    audio.playDroneRotor(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/surface-audio.test.mjs`
Expected: FAIL with `audio.playLidarPing is not a function`.

- [ ] **Step 3: Implement `playLidarPing` and `playDroneRotor` in `src/game/src/audio.js`**

Add methods to `FlightAudio` class in `src/game/src/audio.js`:
```javascript
  playLidarPing() {
    if (!this.ctx || this.muted) return Promise.resolve();
    try {
      const t = this.ctx.currentTime;
      // High-frequency sonar chirp (1800 Hz -> 600 Hz)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.35);

      gain.gain.setValueAtTime(0.2 * (this.masterVolume ?? 0.8), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.52);

      return new Promise(resolve => setTimeout(resolve, 380));
    } catch (_) {
      return Promise.resolve();
    }
  }

  playDroneRotor(active = true) {
    if (!this.ctx || this.muted) return;
    try {
      if (!active) {
        if (this._rotorOsc) {
          try { this._rotorOsc.stop(); this._rotorOsc.disconnect(); } catch (_) {}
          this._rotorOsc = null;
        }
        return;
      }

      if (this._rotorOsc) return;
      const t = this.ctx.currentTime;
      this._rotorOsc = this.ctx.createOscillator();
      this._rotorGain = this.ctx.createGain();
      this._rotorOsc.type = 'sawtooth';
      this._rotorOsc.frequency.setValueAtTime(85, t); // 85 Hz helicopter rotor rotation rate

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, t);

      this._rotorGain.gain.setValueAtTime(0.08 * (this.masterVolume ?? 0.8), t);
      this._rotorOsc.connect(filter);
      filter.connect(this._rotorGain);
      this._rotorGain.connect(this.master);
      this._rotorOsc.start(t);
    } catch (_) {}
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/surface-audio.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/audio.js src/game/tests/surface-audio.test.mjs
git commit -m "feat(audio): implement LIDAR sonar ping and Ingenuity drone rotor SFX"
```

---

### Task 2: Core Surface Survival Mechanics (`src/game/src/surface-survival.js`)

**Files:**
- Create: `src/game/src/surface-survival.js`
- Test: `src/game/tests/surface-survival.test.mjs`

**Interfaces:**
- Produces:
  - `updateSurfaceSurvival(sim, dt)`: Computes solar vs shadow thermal power, ridge sheltering, and drone battery.
  - `triggerLidarPing(sim)`: Locates closest target or Odyssey beacon, returning range and bearing.
  - `toggleDroneSortie(sim)`: Toggles Ingenuity aerial drone reconnaissance state.
  - `checkTerrainShelter(sim)`: Evaluates geological cliff deflection.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/surface-survival.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { updateSurfaceSurvival, triggerLidarPing, toggleDroneSortie, checkTerrainShelter } from '../src/flight-minigames.js';

test('triggerLidarPing returns range and bearing to closest target or beacon', () => {
  const mockSim = {
    position: { x: 0, y: 0, z: -50 },
    targets: [{ x: 50, y: 0, z: -50, name: 'ODYSSEY-01 BEACON' }]
  };

  const ping = triggerLidarPing(mockSim);
  assert.ok(ping);
  assert.equal(ping.range, 50);
  assert.ok(ping.bearing !== undefined);
  assert.match(ping.targetName, /ODYSSEY-01/);
});

test('checkTerrainShelter identifies ridge protection on Mars', () => {
  const mockSimMars = {
    destination: { id: 'mars' },
    position: { x: -65, z: -100 }
  };
  assert.equal(checkTerrainShelter(mockSimMars), true, 'Position behind west ridge should be sheltered');

  mockSimMars.position.x = 10;
  assert.equal(checkTerrainShelter(mockSimMars), false, 'Open plain should be exposed');
});

test('toggleDroneSortie toggles drone mode and respects battery exhaustion', () => {
  const mockSim = {
    surfaceSurvival: { droneActive: false, droneBattery: 30 }
  };

  assert.equal(toggleDroneSortie(mockSim), true);
  assert.equal(mockSim.surfaceSurvival.droneActive, true);

  // When battery depleted, cannot fly
  mockSim.surfaceSurvival.droneBattery = 0;
  assert.equal(toggleDroneSortie(mockSim), false);
  assert.equal(mockSim.surfaceSurvival.droneActive, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/surface-survival.test.mjs`
Expected: FAIL with `triggerLidarPing is not exported`.

- [ ] **Step 3: Implement `src/game/src/surface-survival.js` and export in `flight-minigames.js`**

Author `src/game/src/surface-survival.js` with comprehensive terrain sheltering, drone battery decay, solar/shadow power equations, and LIDAR range calculation.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/surface-survival.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/surface-survival.js src/game/src/flight-minigames.js src/game/tests/surface-survival.test.mjs
git commit -m "feat(survival): implement LIDAR sonar ping, terrain sheltering, and drone sortie logic"
```

---

### Task 3: Integration into `Simulation` & `world.js`

**Files:**
- Modify: `src/game/src/simulation.js`
- Modify: `src/game/src/world.js`
- Test: `src/game/tests/simulation-survival.test.mjs`

**Interfaces:**
- Produces:
  - `sim.surfaceSurvival`: Object tracking real-time surface parameters.
  - `sim.triggerLidar()`: Public method calling sonar ping.
  - `sim.toggleDrone()`: Public method toggling Ingenuity flight.
  - `world.js`: Smooth camera elevator lift to 18m during drone flight.

- [ ] **Step 1: Write integration test**

Create `src/game/tests/simulation-survival.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/simulation.js';

test('Simulation exposes surface survival state and action methods', () => {
  const sim = new Simulation({ destination: 'mars' });
  assert.ok(sim.surfaceSurvival);
  assert.equal(typeof sim.triggerLidar, 'function');
  assert.equal(typeof sim.toggleDrone, 'function');
});

test('Simulation triggerLidar emits event and updates survival state', () => {
  const sim = new Simulation({ destination: 'mars' });
  sim.stage = 4;
  let emitted = null;
  sim.onEvent = (e) => { emitted = e; };
  const ping = sim.triggerLidar();
  assert.ok(ping);
  assert.ok(emitted);
  assert.equal(emitted.type, 'lidarPing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/simulation-survival.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Update `src/game/src/simulation.js` and `src/game/src/world.js`**

Wire `surfaceSurvival` into `Simulation` and update `world.js` camera tracking for drone altitude.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/simulation-survival.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/simulation.js src/game/src/world.js src/game/tests/simulation-survival.test.mjs
git commit -m "feat(simulation): integrate surface survival and aerial drone camera lift into world engine"
```

---

### Task 4: Surface Survival HUD & Visual Styling

**Files:**
- Modify: `src/game/src/mission-ui.js`
- Modify: `src/game/aurora-theme.css`
- Test: `src/game/tests/surface-ui.test.mjs`

**Interfaces:**
- Produces:
  - `createSurfaceSurvivalHudMarkup()`: Tactical HUD overlay displaying Solar vs Shadow status, Storm optical depth, Ridge shelter status, and Ingenuity drone flight button.

- [ ] **Step 1: Write UI tests**

Create `src/game/tests/surface-ui.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurfaceSurvivalHudMarkup } from '../src/mission-ui.js';

test('createSurfaceSurvivalHudMarkup generates accessible surface telemetry overlay', () => {
  const html = createSurfaceSurvivalHudMarkup();
  assert.ok(html.includes('id="surface-survival-hud"'));
  assert.ok(html.includes('survival-power-pill'));
  assert.ok(html.includes('survival-shelter-pill'));
  assert.ok(html.includes('survival-drone-btn'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/surface-ui.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement markup in `mission-ui.js` and styles in `aurora-theme.css`**

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/surface-ui.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/mission-ui.js src/game/aurora-theme.css src/game/tests/surface-ui.test.mjs
git commit -m "feat(ui): add surface survival HUD with solar status, storm depth, and drone sortie dock"
```

---

### Task 5: Main Game Loop Wiring, Keybindings & Production Build

**Files:**
- Modify: `src/game/src/main.js`
- Test: Full test suite (`npm test --prefix src/game`)
- Build: `npm run build --prefix src/game`

- [ ] **Step 1: Wire keybindings & loop in `src/game/src/main.js`**

1. Bind Key `Q` or pulse button to `sim.triggerLidar()` and `audio.playLidarPing()`.
2. Bind Key `H` or drone button to `sim.toggleDrone()` and `audio.playDroneRotor(active)`.
3. In `tick()`, update `#surface-survival-hud` values.

- [ ] **Step 2: Run full test suite**

Run: `npm test --prefix src/game`
Expected: All tests pass ($100\%$ pass rate).

- [ ] **Step 3: Compile production build**

Run: `npm run build --prefix src/game`
Expected: Vite build succeeds with 0 errors.

- [ ] **Step 4: Commit and Push**

```bash
git add .
git commit -m "feat(survival): deliver active surface survival and ingenuity drone recon system"
git push origin main
```
