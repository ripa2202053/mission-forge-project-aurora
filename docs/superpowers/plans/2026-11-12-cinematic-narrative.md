# Cinematic Story & Radio Comms Narrative Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform *Project Aurora* into an emotionally gripping, astronomically authentic space adventure for the NASA Space Apps Challenge by implementing an interactive Apollo/Artemis-style radio comms HUD, authentic Quindar tones, classified mission briefing dossier, and the "Lost Telemetry of Odyssey" narrative arc.

**Architecture:** A lightweight event-driven narrative engine (`narrative.js`) interfaces with the existing `Simulation`, `FlightAudio`, and `SpaceWorld` modules. It synchronizes Web Audio Quindar beeps (2525Hz / 2475Hz), bandpass-filtered radio static, and speech synthesis with a sleek floating NASA HUD widget displaying real-time character communications, camera cues, and NASA PDS dataset resolutions.

**Tech Stack:** JavaScript (ES Modules), Web Audio API (oscillators, biquad bandpass filter, noise buffers), Web Speech API (`SpeechSynthesis`), Three.js camera transitions, CSS3 keyframe animations, Node.js test runner (`node --test`).

## Global Constraints

- Must strictly adhere to authentic Apollo/Artemis NASA Quindar tone frequencies: 2525 Hz intro tone (250 ms), 2475 Hz outro tone (250 ms).
- Audio and speech must be 100% resilient and non-blocking: if audio context is suspended or speech synthesis is unavailable, dialog and visual HUD must continue without errors.
- Zero external runtime dependencies: all synthesis, filters, and UI are native vanilla JS/CSS.
- All 74 existing unit tests must continue to pass with 0 regressions.
- Every task ends with an independently testable deliverable and a git commit.

---

### Task 1: Web Audio Quindar Tones & Radio Static in `audio.js`

**Files:**
- Modify: `src/game/src/audio.js:1-260`
- Test: `src/game/tests/narrative-audio.test.mjs`

**Interfaces:**
- Produces:
  - `playQuindarTone(isStart = true): Promise<void>`: Generates 2525 Hz (start) or 2475 Hz (end) 250ms sine pulse via Web Audio API.
  - `playRadioStatic(durationMs = 200): Promise<void>`: Generates bandpass-filtered radio static burst.
  - `playMissionAlertBeep(severity = 'warning'): void`: Plays tactical NASA alert chime.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/narrative-audio.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes Quindar tone and radio static methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playQuindarTone, 'function');
  assert.equal(typeof audio.playRadioStatic, 'function');
  assert.equal(typeof audio.playMissionAlertBeep, 'function');
});

test('FlightAudio Quindar tones run safely without throwing even without AudioContext', async () => {
  const audio = new FlightAudio();
  // In Node test environment, window/AudioContext may be null/mocked
  await assert.doesNotReject(async () => {
    await audio.playQuindarTone(true);
    await audio.playQuindarTone(false);
    await audio.playRadioStatic(150);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/narrative-audio.test.mjs`
Expected: FAIL with `audio.playQuindarTone is not a function`.

- [ ] **Step 3: Implement Quindar tones & static in `src/game/src/audio.js`**

Add methods to `FlightAudio` class in `src/game/src/audio.js`:
```javascript
  playQuindarTone(isStart = true) {
    if (this.muted || !this.ctx) return Promise.resolve();
    try {
      const freq = isStart ? 2525 : 2475; // Historical NASA Quindar frequencies
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 * (this.masterVolume ?? 0.8), now + 0.02);
      gain.gain.setValueAtTime(0.08 * (this.masterVolume ?? 0.8), now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.master);

      osc.start(now);
      osc.stop(now + 0.26);

      return new Promise(resolve => setTimeout(resolve, 260));
    } catch (_) {
      return Promise.resolve();
    }
  }

  playRadioStatic(durationMs = 200) {
    if (this.muted || !this.ctx) return Promise.resolve();
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * (durationMs / 1000));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05 * (this.masterVolume ?? 0.8), now);
      gain.gain.linearRampToValueAtTime(0.001, now + (durationMs / 1000));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);

      noise.start(now);
      return new Promise(resolve => setTimeout(resolve, durationMs));
    } catch (_) {
      return Promise.resolve();
    }
  }

  playMissionAlertBeep(severity = 'warning') {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = severity === 'critical' ? 880 : 587.33; // D5 or A5

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12 * (this.masterVolume ?? 0.8), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.31);
    } catch (_) {}
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/narrative-audio.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/audio.js src/game/tests/narrative-audio.test.mjs
git commit -m "feat(audio): implement authentic NASA Quindar tones and radio bandpass static"
```

---

### Task 2: Core Radio Comms & Narrative State Machine in `src/game/src/narrative.js`

**Files:**
- Create: `src/game/src/narrative.js`
- Test: `src/game/tests/narrative-engine.test.mjs`

**Interfaces:**
- Consumes: `FlightAudio.playQuindarTone`, `FlightAudio.playRadioStatic`
- Produces:
  - `NARRATIVE_CAST`: Dictionary of character profiles (Imani, Reyes, Sen, Capcom).
  - `STORY_BEATS`: Story milestone definitions for "The Lost Telemetry of Odyssey".
  - `NarrativeDirector`: Class managing transmission queue, event dispatching, and callbacks.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/narrative-engine.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { NarrativeDirector, NARRATIVE_CAST, STORY_BEATS } from '../src/narrative.js';

test('NARRATIVE_CAST defines flight director, engineer, and science officer', () => {
  assert.ok(NARRATIVE_CAST.imani);
  assert.ok(NARRATIVE_CAST.reyes);
  assert.ok(NARRATIVE_CAST.sen);
  assert.equal(NARRATIVE_CAST.imani.callsign, 'HOUSTON · FLIGHT DIRECTOR');
});

test('NarrativeDirector enqueues and triggers story milestones', async () => {
  let receivedTransmission = null;
  const director = new NarrativeDirector({
    onTransmission: (t) => { receivedTransmission = t; }
  });

  const ok = director.triggerBeat('BOOT_HERO');
  assert.equal(ok, true);
  assert.ok(receivedTransmission);
  assert.equal(receivedTransmission.speaker.id, 'imani');
  assert.match(receivedTransmission.message, /Odyssey-01/);
});

test('NarrativeDirector prevents duplicate triggers of one-time milestones', () => {
  const director = new NarrativeDirector();
  assert.equal(director.triggerBeat('BOOT_HERO'), true);
  assert.equal(director.triggerBeat('BOOT_HERO'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/narrative-engine.test.mjs`
Expected: FAIL with `Cannot find module '../src/narrative.js'`.

- [ ] **Step 3: Implement `src/game/src/narrative.js`**

Author `src/game/src/narrative.js`:
```javascript
/**
 * PROJECT AURORA
 * NASA Space Apps Challenge 2026
 * Narrative & Apollo/Artemis Radio Comms Engine
 */

export const NARRATIVE_CAST = {
  imani: {
    id: 'imani',
    name: 'Dr. Imani Vance',
    callsign: 'HOUSTON · FLIGHT DIRECTOR',
    badge: 'FD',
    channel: 'CH 424.15 MHz',
    voicePitch: 0.95,
    voiceRate: 1.0,
    color: '#00f0ff'
  },
  reyes: {
    id: 'reyes',
    name: 'Chief Marcus Reyes',
    callsign: 'PROPULSION & SYSTEMS',
    badge: 'ENG',
    channel: 'CH 424.80 MHz',
    voicePitch: 0.85,
    voiceRate: 1.12,
    color: '#ffb700'
  },
  sen: {
    id: 'sen',
    name: 'Dr. Aris Sen',
    callsign: 'PDS ASTROBIOLOGY LEAD',
    badge: 'SCI',
    channel: 'CH 425.20 MHz',
    voicePitch: 1.1,
    voiceRate: 1.05,
    color: '#39ff14'
  },
  capcom: {
    id: 'capcom',
    name: 'CAPCOM Ground Station',
    callsign: 'CAPE CANAVERAL · CAPCOM',
    badge: 'CC',
    channel: 'CH 420.00 MHz',
    voicePitch: 1.0,
    voiceRate: 1.0,
    color: '#00d2ff'
  }
};

export const STORY_BEATS = {
  BOOT_HERO: {
    id: 'BOOT_HERO',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'Aurora-07, this is Houston Flight Director. Odyssey-01 has gone dark in Jezero Crater after transmitting a deep subterranean telemetry spike. Assemble your spacecraft and bring their science package home.',
    objective: 'Assemble deep-space spacecraft and initiate launch.',
    delayMs: 1200
  },
  HANGAR_PART_ION: {
    id: 'HANGAR_PART_ION',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'STANDARD',
    message: 'High specific impulse confirmed. The Ion Drive gives us incredible fuel margin, Commander, but remember—our thrust-to-weight ratio will require early burn timing.',
    delayMs: 300
  },
  HANGAR_PART_SHIELD: {
    id: 'HANGAR_PART_SHIELD',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'STANDARD',
    message: 'Superconducting magnetic shield locked to the hull bus. If solar weather flares up along the heliocentric corridor, keep your capacitor bank charged.',
    delayMs: 300
  },
  LAUNCH_COUNTDOWN: {
    id: 'LAUNCH_COUNTDOWN',
    speaker: NARRATIVE_CAST.capcom,
    priority: 'CRITICAL',
    message: 'T-minus 10 seconds. Guidance internal. 3... 2... 1... Main engine ignition! Liftoff of Aurora-07! Tower cleared, telemetry is nominal.',
    delayMs: 0
  },
  TRANSIT_CRUISE: {
    id: 'TRANSIT_CRUISE',
    speaker: NARRATIVE_CAST.sen,
    priority: 'STANDARD',
    message: 'Horizons orbital solution verified. We are coasting along the Hohmann ellipse. Deep space background radiation is steady, but keep eyes on the solar wind monitor.',
    delayMs: 1500
  },
  CME_STORM_ALERT: {
    id: 'CME_STORM_ALERT',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'CRITICAL',
    message: 'WARNING! Severe Coronal Mass Ejection detected on solar monitor! Divert emergency power to the magnetic shield before ionizing proton flux fries our guidance core!',
    delayMs: 100
  },
  RETRO_CAPTURE_BURN: {
    id: 'RETRO_CAPTURE_BURN',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'CRITICAL',
    message: 'Target orbital intercept reached! Prepare for 1.4 km/s retrograde capture burn. Burn throttle on my mark... NOW!',
    delayMs: 300
  },
  ATMOSPHERIC_ENTRY: {
    id: 'ATMOSPHERIC_ENTRY',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'Aurora-07, entry interface in 30 seconds. Atmospheric friction will cause complete ionization blackout for the next 3 minutes. Welcome to the Seven Minutes of Terror. Godspeed.',
    delayMs: 500
  },
  SURFACE_TOUCHDOWN: {
    id: 'SURFACE_TOUCHDOWN',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'TOUCHDOWN CONFIRMED! Houston copies telemetry! Aurora-07 is intact on the surface of Jezero Crater! Deploying Perseverance rover and Ingenuity scout drone now.',
    delayMs: 400
  },
  BEACON_LOCATED: {
    id: 'BEACON_LOCATED',
    speaker: NARRATIVE_CAST.sen,
    priority: 'CRITICAL',
    message: 'EUREKA! Rover spectro-scanner locked onto Odyssey-01 emergency beacon! PDS Level-3 telemetry recovered: ancient hydrated clay carbonates and high-probability organic biogenic markers confirmed!',
    delayMs: 300
  }
};

export class NarrativeDirector {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.onTransmission = options.onTransmission || (() => {});
    this.onTransmissionEnd = options.onTransmissionEnd || (() => {});
    this.history = [];
    this.triggeredBeats = new Set();
    this.queue = [];
    this.isTransmitting = false;
    this.voiceEnabled = options.voiceEnabled ?? true;
  }

  triggerBeat(beatId, customData = {}) {
    const beat = STORY_BEATS[beatId];
    if (!beat) return false;
    if (this.triggeredBeats.has(beatId)) return false;

    this.triggeredBeats.add(beatId);
    const transmission = {
      ...beat,
      ...customData,
      timestamp: Date.now()
    };

    this.enqueue(transmission);
    return true;
  }

  enqueue(transmission) {
    if (transmission.priority === 'CRITICAL') {
      this.queue.unshift(transmission);
    } else {
      this.queue.push(transmission);
    }
    this.processQueue();
  }

  async processQueue() {
    if (this.isTransmitting || this.queue.length === 0) return;
    this.isTransmitting = true;
    const item = this.queue.shift();

    if (item.delayMs > 0) {
      await new Promise(r => setTimeout(r, item.delayMs));
    }

    // Play Quindar start beep & radio noise
    if (this.audio?.playQuindarTone) {
      await this.audio.playQuindarTone(true);
      await this.audio.playRadioStatic(180);
    }

    this.history.push(item);
    this.onTransmission(item);

    // Audio Voice Speech Synthesis if supported
    if (this.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && !this.audio?.muted) {
      try {
        const utterance = new SpeechSynthesisUtterance(item.message);
        utterance.pitch = item.speaker.voicePitch || 1.0;
        utterance.rate = item.speaker.voiceRate || 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        
        await new Promise(resolve => {
          utterance.onend = resolve;
          utterance.onerror = resolve;
          // Fallback timeout in case onend never fires
          setTimeout(resolve, 8000);
        });
      } catch (_) {}
    } else {
      // Simulate speech reading duration
      const duration = Math.min(6000, Math.max(2500, item.message.length * 45));
      await new Promise(r => setTimeout(r, duration));
    }

    // Play Quindar end beep
    if (this.audio?.playQuindarTone) {
      await this.audio.playQuindarTone(false);
    }

    this.onTransmissionEnd(item);
    this.isTransmitting = false;

    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 500);
    }
  }

  reset() {
    this.triggeredBeats.clear();
    this.queue = [];
    this.isTransmitting = false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/narrative-engine.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/narrative.js src/game/tests/narrative-engine.test.mjs
git commit -m "feat(narrative): implement radio comms queue and story milestone engine"
```

---

### Task 3: Radio Comms HUD Widget, Briefing Dossier & Visual Styling

**Files:**
- Modify: `src/game/aurora-theme.css`
- Modify: `src/game/src/mission-ui.js`
- Test: `src/game/tests/narrative-ui.test.mjs`

**Interfaces:**
- Produces:
  - `renderRadioCommsHudContainer()`: Injects HUD widget DOM container.
  - `displayCommsTransmission(item)`: Animates typewriter text, VU meter bars, and speaker badge.
  - `showClassifiedBriefingModal(destination, onAccept)`: Displays the classified NASA mission dossier on screen.

- [ ] **Step 1: Write the failing test**

Create `src/game/tests/narrative-ui.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommsHudMarkup, createBriefingDossierMarkup } from '../src/mission-ui.js';

test('createCommsHudMarkup generates valid accessible DOM string', () => {
  const html = createCommsHudMarkup();
  assert.ok(html.includes('id="radio-comms-hud"'));
  assert.ok(html.includes('radio-waveform-bar'));
  assert.ok(html.includes('comms-speaker-callsign'));
});

test('createBriefingDossierMarkup includes classified header, lore, and CTA', () => {
  const html = createBriefingDossierMarkup({ destination: 'mars', callsign: 'Odyssey-07' });
  assert.ok(html.includes('EXPEDITION BRIEFING'));
  assert.ok(html.includes('ODYSSEY-01'));
  assert.ok(html.includes('AUTHORIZE EXPEDITION'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/game/tests/narrative-ui.test.mjs`
Expected: FAIL with `createCommsHudMarkup is not a function`.

- [ ] **Step 3: Implement HUD & Briefing markups in `src/game/src/mission-ui.js` and styles in `aurora-theme.css`**

In `src/game/src/mission-ui.js`:
Add `createCommsHudMarkup` and `createBriefingDossierMarkup`.
In `src/game/aurora-theme.css`:
Add styles for `#radio-comms-hud`, `.radio-waveform`, `#classified-briefing-modal`, Quindar animated transmission scanlines.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/game/tests/narrative-ui.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/src/mission-ui.js src/game/aurora-theme.css src/game/tests/narrative-ui.test.mjs
git commit -m "feat(ui): add NASA classified mission briefing and animated radio comms HUD"
```

---

### Task 4: Main Game Integration & Story Milestones Wiring in `src/game/src/main.js`

**Files:**
- Modify: `src/game/src/main.js`
- Test: `src/game/tests/narrative-integration.test.mjs`

**Interfaces:**
- Consumes: `NarrativeDirector`, `STORY_BEATS`, `showClassifiedBriefingModal`
- Produces: Live story milestones connected to Boot, Hangar selection, Launch, CME hazard, Retro burn, Atmospheric entry, Touchdown, and Blackbox scan.

- [ ] **Step 1: Write integration test**

Create `src/game/tests/narrative-integration.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { NarrativeDirector, STORY_BEATS } from '../src/narrative.js';

test('Story milestones map to all core gameplay states', () => {
  const requiredMilestones = [
    'BOOT_HERO',
    'HANGAR_PART_ION',
    'LAUNCH_COUNTDOWN',
    'CME_STORM_ALERT',
    'RETRO_CAPTURE_BURN',
    'ATMOSPHERIC_ENTRY',
    'SURFACE_TOUCHDOWN',
    'BEACON_LOCATED'
  ];

  for (const m of requiredMilestones) {
    assert.ok(STORY_BEATS[m], `Missing required story milestone: ${m}`);
    assert.ok(STORY_BEATS[m].message.length > 20);
    assert.ok(STORY_BEATS[m].speaker);
  }
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test src/game/tests/narrative-integration.test.mjs`
Expected: PASS.

- [ ] **Step 3: Wire `NarrativeDirector` into `src/game/src/main.js`**

1. Instantiate `director = new NarrativeDirector({ audio, voiceEnabled: true, onTransmission, onTransmissionEnd })`.
2. Render `#radio-comms-hud` on startup.
3. Show `#classified-briefing-modal` on first click of "START EXPEDITION" or boot.
4. Hook part selection in `assembly.js` / `main.js` to trigger `HANGAR_PART_ION` or `HANGAR_PART_SHIELD`.
5. Hook `startRocketLaunch` in `launch.js` / `main.js` to trigger `LAUNCH_COUNTDOWN`.
6. Hook CME space weather trigger to fire `CME_STORM_ALERT`.
7. Hook orbital insertion burn to fire `RETRO_CAPTURE_BURN`.
8. Hook atmospheric stage descent to trigger `ATMOSPHERIC_ENTRY`.
9. Hook touchdown to trigger `SURFACE_TOUCHDOWN`.
10. Hook rover sample/beacon scan in `SurfaceOperations` / `main.js` to fire `BEACON_LOCATED`.

- [ ] **Step 4: Run all test suites**

Run: `npm test --prefix src/game`
Expected: All 74 original tests + 4 new narrative tests PASS (78 passed).

- [ ] **Step 5: Commit**

```bash
git add src/game/src/main.js src/game/tests/narrative-integration.test.mjs
git commit -m "feat(game): wire narrative director and story beats into complete flight loop"
```

---

### Task 5: Production Build, Browser Smoke Verification & Final Commit

**Files:**
- Test: `src/game/tests/production-smoke.mjs`
- Build: `npm run build --prefix src/game`

- [ ] **Step 1: Execute production build**

Run: `npm run build --prefix src/game`
Expected: Vite build succeeds with zero errors, generating fresh `src/game/dist/`.

- [ ] **Step 2: Run all unit & smoke tests**

Run: `npm test --prefix src/game`
Expected: 100% test pass rate.

- [ ] **Step 3: Commit & Push**

```bash
git add .
git commit -m "feat(nasa): deliver professional cinematic story and radio narrative for space apps challenge"
git push origin main
```
