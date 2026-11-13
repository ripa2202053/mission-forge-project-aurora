# Active Hands-on Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the passive flight segments of *Project Aurora* into skill-demanding, interactive aerospace challenges by implementing the "Seven Minutes of Terror" Atmospheric Entry & Landing (EDL) minigame, Manual Orbital Docking with boresight crosshairs, and 3-Bus Tactical Power Shunting.

**Architecture:** A modular minigame controller (`flight-minigames.js`) manages the physics loops for Atmospheric Entry (AoA heat management, supersonic parachute deploy window, retro-braking), Orbital Docking (relative velocity, range-rate capture envelope), and Power Shunting (3 hotkey states). It coordinates with `Simulation`, `FlightAudio`, and dynamic glassmorphic HUD overlays rendered during stages 1, 3, and 5.

**Tech Stack:** JavaScript (ES Modules), Web Audio API (procedural synthesis for docking latch, chute sonic boom, power shunting hum), Three.js vector math, CSS3 keyframe HUD reticles, Node.js test runner (`node --test`).

## Global Constraints

- Must preserve all 82 existing unit tests with 0 regressions.
- Non-blocking fail-safes: if keyboard inputs or audio are interrupted, simulation must continue gracefully.
- Responsive HUD overlays: crosshairs and tactical reticles must adapt to mobile, tablet, and 4K desktop screens without obstructing existing flight telemetry.
- Every task ends with an independently testable deliverable and a git commit.

---

### Task 1: Procedural Audio for Active Flight Mechanics in `audio.js`

**Files:**
- Modify: `src/game/src/audio.js`
- Test: `src/game/tests/minigames-audio.test.mjs`

**Interfaces:**
- Produces:
  - `playDockingLatch(): Promise<void>`: Heavy metallic clamp latch with hydraulic hiss.
  - `playParachuteDeploy(): Promise<void>`: Supersonic canopy deployment crack / sonic boom.
  - `playPowerShunt(): void`: High-tech magnetic bus shunting capacitor whine.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/minigames-audio.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes docking latch, parachute deploy, and power shunt audio methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playDockingLatch, 'function');
  assert.equal(typeof audio.playParachuteDeploy, 'function');
  assert.equal(typeof audio.playPowerShunt, 'function');
});

test('FlightAudio active gameplay sounds execute safely in headless environment', async () => {
  const audio = new FlightAudio();
  await assert.doesNotReject(async () => {
    await audio.playDockingLatch();
    await audio.playParachuteDeploy();
    audio.playPowerShunt();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/minigames-audio.test.mjs`
Expected: FAIL with `audio.playDockingLatch is not a function`.

- [ ] **Step 3: Implement active flight SFX in `src/game/src/audio.js`**

Add methods to `FlightAudio` in `src/game/src/audio.js`:
```javascript
  playDockingLatch() {
    if (!this.ctx || this.muted) return Promise.resolve();
    try {
      const t = this.ctx.currentTime;
      // Low metallic clonk (square wave 90Hz -> 45Hz)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      gain.gain.setValueAtTime(0.25 * (this.masterVolume ?? 0.8), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.3);

      // Hydraulic hiss
      this.playRadioStatic(180);
      return new Promise(resolve => setTimeout(resolve, 300));
    } catch (_) {
      return Promise.resolve();
    }
  }

  playParachuteDeploy() {
    if (!this.ctx || this.muted) return Promise.resolve();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
      gain.gain.setValueAtTime(0.35 * (this.masterVolume ?? 0.8), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.46);
      return new Promise(resolve => setTimeout(resolve, 450));
    } catch (_) {
      return Promise.resolve();
    }
  }

  playPowerShunt() {
    if (!this.ctx || this.muted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(980, t + 0.22);
      gain.gain.setValueAtTime(0.12 * (this.masterVolume ?? 0.8), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.26);
    } catch (_) {}
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/minigames-audio.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/audio.js src/game/tests/minigames-audio.test.mjs
git commit -m "feat(audio): implement docking latch, supersonic parachute, and power shunt SFX"
```

---

### Task 2: Core Flight Minigames Mechanics Module (`src/game/src/flight-minigames.js`)

**Files:**
- Create: `src/game/src/flight-minigames.js`
- Test: `src/game/tests/flight-minigames.test.mjs`

**Interfaces:**
- Produces:
  - `updateEdlFlight(sim, inputState, dt)`: Updates heat shield AoA, checks parachute window, handles thermal heating.
  - `triggerParachute(sim)`: Deploys supersonic parachute if within altitude window.
  - `updateDockingApproach(sim, inputState, dt)`: Calculates range, range rate, lateral offset, and checks capture envelope.
  - `applyPowerShunt(sim, mode)`: Sets `'engines' | 'shields' | 'balanced'`, recalculating effective handling, armor, and scan rate.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/flight-minigames.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { updateEdlFlight, triggerParachute, updateDockingApproach, applyPowerShunt } from '../src/flight-minigames.js';

test('applyPowerShunt alters simulation handling and shield values', () => {
  const mockSim = {
    stats: { handling: 1.0, armor: 1.0, yield: 1.0 },
    baseStats: { handling: 1.0, armor: 1.0, yield: 1.0 },
    powerShunt: 'balanced'
  };

  applyPowerShunt(mockSim, 'shields');
  assert.equal(mockSim.powerShunt, 'shields');
  assert.ok(mockSim.stats.armor < 1.0, 'Armor multiplier should improve (lower damage)');

  applyPowerShunt(mockSim, 'engines');
  assert.equal(mockSim.powerShunt, 'engines');
  assert.ok(mockSim.stats.handling > 1.0, 'Handling should increase under engine shunt');
});

test('triggerParachute deploys only within valid altitude window', () => {
  const mockSim = {
    position: { z: -100 },
    velocity: { z: -40 },
    edl: { parachuteDeployed: false, parachuteWindowOpen: false }
  };

  // Outside window
  assert.equal(triggerParachute(mockSim), false);

  // Inside window (-350 to -260)
  mockSim.position.z = -300;
  mockSim.edl.parachuteWindowOpen = true;
  assert.equal(triggerParachute(mockSim), true);
  assert.equal(mockSim.edl.parachuteDeployed, true);
  assert.ok(mockSim.velocity.z > -20, 'Velocity should decelerate sharply');
});

test('updateDockingApproach detects capture when within alignment tolerances', () => {
  const mockSim = {
    position: { x: 0.5, y: 0.2, z: -5.0 },
    velocity: { x: 0, y: 0, z: 0.8 },
    docking: { range: 5.0, closureRate: 0.8, offsetX: 0.5, offsetY: 0.2, captured: false },
    target: { x: 0, y: 0, z: 0 }
  };

  const captured = updateDockingApproach(mockSim, {}, 0.016);
  assert.equal(captured, true);
  assert.equal(mockSim.docking.captured, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/flight-minigames.test.mjs`
Expected: FAIL with `Cannot find module '../src/flight-minigames.js'`.

- [ ] **Step 3: Implement `src/game/src/flight-minigames.js`**

Author `src/game/src/flight-minigames.js` with accurate aerospace mathematics for EDL AoA, parachute deployment, docking boresight alignment, and 3-bus power distribution.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/flight-minigames.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/flight-minigames.js src/game/tests/flight-minigames.test.mjs
git commit -m "feat(minigames): implement EDL AoA alignment, parachute trigger, and orbital docking logic"
```

---

### Task 3: Integration into `Simulation` & `vehicle.js`

**Files:**
- Modify: `src/game/src/simulation.js`
- Test: `src/game/tests/simulation-minigames.test.mjs`

**Interfaces:**
- Consumes: `updateEdlFlight`, `triggerParachute`, `updateDockingApproach`, `applyPowerShunt`
- Produces: Seamless state sync inside `sim.tick()`.

- [ ] **Step 1: Write integration test**

Create `src/game/tests/simulation-minigames.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/simulation.js';

test('Simulation initializes with active flight minigames state', () => {
  const sim = new Simulation({ destination: 'mars' });
  assert.ok(sim.powerShunt);
  assert.ok(sim.edl);
  assert.ok(sim.docking);
});

test('Simulation executes power shunting via hotkey methods', () => {
  const sim = new Simulation({ destination: 'mars' });
  sim.setPowerShunt('shields');
  assert.equal(sim.powerShunt, 'shields');
  sim.setPowerShunt('engines');
  assert.equal(sim.powerShunt, 'engines');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/simulation-minigames.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Update `src/game/src/simulation.js`**

Wire EDL, docking, and power shunting into `Simulation` constructor, `setupStage()`, and `tick()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/simulation-minigames.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/simulation.js src/game/tests/simulation-minigames.test.mjs
git commit -m "feat(simulation): integrate EDL, docking envelope, and power shunting into core loop"
```

---

### Task 4: HUD Reticles, Docking Crosshairs & Visual Styling

**Files:**
- Modify: `src/game/src/mission-ui.js`
- Modify: `src/game/aurora-theme.css`
- Test: `src/game/tests/minigames-ui.test.mjs`

**Interfaces:**
- Produces:
  - `createEdlHudMarkup()`: Entry descent reticle, AoA indicator, parachute prompt.
  - `createDockingHudMarkup()`: Boresight alignment crosshairs, range and closure rate displays.
  - `createPowerShuntMarkup()`: 3-bus power routing indicator (`[1] ENGINES`, `[2] SHIELDS`, `[3] BALANCED`).

- [ ] **Step 1: Write UI tests**

Create `src/game/tests/minigames-ui.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createEdlHudMarkup, createDockingHudMarkup, createPowerShuntMarkup } from '../src/mission-ui.js';

test('createEdlHudMarkup renders AoA reticle and parachute indicator', () => {
  const html = createEdlHudMarkup();
  assert.ok(html.includes('id="edl-hud"'));
  assert.ok(html.includes('edl-aoa-indicator'));
  assert.ok(html.includes('edl-chute-prompt'));
});

test('createDockingHudMarkup renders boresight crosshairs and range rate tags', () => {
  const html = createDockingHudMarkup();
  assert.ok(html.includes('id="docking-hud"'));
  assert.ok(html.includes('docking-crosshair'));
  assert.ok(html.includes('docking-range-rate'));
});

test('createPowerShuntMarkup renders 3 tactile power bus buttons', () => {
  const html = createPowerShuntMarkup();
  assert.ok(html.includes('id="power-shunt-matrix"'));
  assert.ok(html.includes('data-shunt="engines"'));
  assert.ok(html.includes('data-shunt="shields"'));
  assert.ok(html.includes('data-shunt="balanced"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/minigames-ui.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement UI markups & CSS styles**

Implement `createEdlHudMarkup`, `createDockingHudMarkup`, `createPowerShuntMarkup` in `src/game/src/mission-ui.js` and styling in `aurora-theme.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/minigames-ui.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/mission-ui.js src/game/aurora-theme.css src/game/tests/minigames-ui.test.mjs
git commit -m "feat(ui): add EDL AoA crosshair, orbital docking boresight, and tactical power shunt matrix"
```

---

### Task 5: Main Game Loop Wiring, Keybindings & Production Build

**Files:**
- Modify: `src/game/src/main.js`
- Test: Full test suite (`npm test --prefix src/game`)
- Build: `npm run build --prefix src/game`

- [ ] **Step 1: Wire keybindings in `src/game/src/main.js`**

1. Bind keys `1`, `2`, `3` to `sim.setPowerShunt('engines' | 'shields' | 'balanced')`.
2. Bind key `P` or `Space` during Stage 3 to trigger `sim.deployParachute()`.
3. In `tick()`, update `#edl-hud`, `#docking-hud`, and `#power-shunt-matrix` DOM elements.
4. Hook sound effects (`audio.playDockingLatch`, `audio.playParachuteDeploy`, `audio.playPowerShunt`).

- [ ] **Step 2: Run all test suites**

Run: `npm test --prefix src/game`
Expected: All tests pass ($100\%$ pass rate).

- [ ] **Step 3: Compile production build**

Run: `npm run build --prefix src/game`
Expected: Vite build succeeds with 0 errors.

- [ ] **Step 4: Commit and Push**

```bash
git add .
git commit -m "feat(gameplay): deliver active hands-on EDL, docking, and power shunting gameplay"
git push origin main
```
