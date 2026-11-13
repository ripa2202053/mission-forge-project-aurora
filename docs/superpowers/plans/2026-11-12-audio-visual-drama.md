# Audio-Visual Drama & Cinematic Game Feel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Project Aurora's audiovisual immersion into an authentic, cinematic space expedition experience featuring dynamic wheel dust roosts, drone downwash vortices, biometric tension heartbeat audio, helmet-muffled acoustics, speed warp star streaks, emergency cockpit strobes, and discovery bloom flares.

**Architecture:** Extend `audio.js` with dual-sine astronaut heartbeat generator and helmet low-pass muffling. Extend `world.js` with wheel dust particle pools, drone downwash, bloom flare triggers, and emergency ambient lighting. Integrate emergency vignettes and discovery hit-stops in `main.js` and `aurora-theme.css`.

**Tech Stack:** JavaScript (ES Modules), Web Audio API (sub-bass biometrics, modulated biquad filters), Three.js (particle systems, UnrealBloomPass manipulation, dynamic ambient lighting), CSS3 CRT warning vignettes, Node.js test runner (`node --test`).

---

### Task 1: Biometric Tension Audio & Helmet Muffle Filter (`audio.js`)

**Files:**
- Modify: `src/game/src/audio.js`
- Test: `src/game/tests/audio-drama.test.mjs`

- [ ] **Step 1: Write failing test `audio-drama.test.mjs`**
  Verify `audio.updateBiometricTension(heartrateBpm, emergencyLevel)` and `audio.stopBiometricTension()`.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement biometric tension heartbeat and helmet filter in `audio.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 2: Rover Wheel Dust Spray & Drone Downwash Particles (`world.js`)

**Files:**
- Modify: `src/game/src/world.js`
- Test: `src/game/tests/visual-drama.test.mjs`

- [ ] **Step 1: Write failing test `visual-drama.test.mjs`**
  Verify wheel dust particle emission and drone downwash ground vortex.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement wheel dust particles and drone ground downwash in `world.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 3: Discovery Bloom Surge, Emergency Lighting & Speed Warp Streaks (`world.js`)

**Files:**
- Modify: `src/game/src/world.js`
- Test: `src/game/tests/bloom-warp.test.mjs`

- [ ] **Step 1: Write failing test `bloom-warp.test.mjs`**
  Verify `triggerDiscoveryBloom()`, emergency cockpit ambient interpolation, and star streak scaling.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement bloom surge and warp effects in `world.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 4: Emergency HUD Vignette & Hit-Stop Discovery Integration (`aurora-theme.css` & `main.js`)

**Files:**
- Modify: `src/game/aurora-theme.css`
- Modify: `src/game/src/main.js`
- Test: Full test suite (`npm test --prefix src/game`)
- Build: `npm run build --prefix src/game`

- [ ] **Step 1: Add emergency CRT vignette and tactical warning stripes to `aurora-theme.css`**
- [ ] **Step 2: Wire biometric heartbeat, emergency cockpit lighting, and discovery hit-stop into `tick()` in `main.js`**
- [ ] **Step 3: Run full test suite ($100\%$ pass rate)**
- [ ] **Step 4: Compile production build via Vite**
- [ ] **Step 5: Commit and push to `origin/main`**
