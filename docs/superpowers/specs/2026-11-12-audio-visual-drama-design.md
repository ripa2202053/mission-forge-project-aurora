# Technical Specification: Audio-Visual Drama & Cinematic Game Feel
**Project:** Project Aurora (NASA Space Apps Challenge 2026)  
**Date:** 2026-11-12  
**Author:** Lead Game Systems Architect & Astronomer  
**Status:** Approved  

---

## 1. Executive Summary & Objective

### 1.1 Goal
Elevate the tactile "Game Feel", audiovisual immersion, and cinematic tension across all 5 NASA planetary expeditions. Deliver AAA-quality game juice: dynamic wheel dust roosts, high-G speed warp streaks, biometric tension heartbeat audio, helmet-muffled acoustic filtering, emergency cockpit strobe illumination, and celebratory discovery bloom flares.

### 1.2 Core Pillars
1. **Dynamic Rover Wheel Dust Roosts & Drone Downwash (`world.js`):**
   - As Perseverance drives through Jezero Crater or lunar rover navigates Shackleton Crater, rotating wheels spray physical dust particles backwards matching planetary surface mineralogy (warm red-orange for Mars clay/sand, ash-gray for lunar regolith).
   - Ingenuity helicopter downwash produces a ground-plane dust vortex directly beneath the flight sortie.
2. **High-G Warp Speed Streaks & Elastic FOV Warping (`world.js`):**
   - As velocity increases beyond $35\text{ m/s}$ or under rocket boost, starfield points elongate into hyper-speed streaks.
   - Camera FOV elastically expands from $46^\circ$ up to $68^\circ$ with speed, creating cinematic acceleration perspective warp.
3. **Biometric Tension Heartbeat & Helmet-Muffled Audio (`audio.js`):**
   - When hull $< 25\%$, battery $< 15\%$, or during extreme radiation surges, an authentic two-phase sub-bass astronaut heartbeat ("lub-dub" at 60 → 135 BPM) pulses through the master audio bus.
   - External BGM and environmental sounds are dampened by a $450\text{ Hz}$ low-pass filter, simulating the acoustic interior of a sealed astronaut helmet.
4. **Emergency Cockpit Strobe & Lens Bloom Flares (`world.js` & `aurora-theme.css`):**
   - Critical alarms bathe the ship and terrain in pulsing crimson emergency lighting.
   - A pulsing tactical CRT edge vignette warns of impending system failure.
   - Successful orbital docking capture or rock core sample extraction triggers a satisfying golden lens bloom flare (`bloom.strength: 0.4 → 0.95`).
5. **Satisfying Discovery Hit-Stop Micro-Dilation (`main.js`):**
   - A subtle 120ms cinematic slow-motion hit-stop accompanies mission-critical scientific discoveries, amplifying tactile weight and psychological accomplishment.

---

## 2. Verification & Testing Strategy
- Unit tests in `src/game/tests/audio-visual-drama.test.mjs`:
  - Verify biometric tension heartbeat audio node lifecycle.
  - Verify wheel dust particle pool creation and emission.
  - Verify bloom surge trigger and decay mathematics.
  - Verify emergency cockpit ambient lighting interpolation.
- Full test suite: all 120 existing tests must continue to pass with 0 regressions.
- Vite production build must compile with 0 errors.
