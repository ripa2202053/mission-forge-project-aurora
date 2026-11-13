# Technical Specification: Cinematic Story & Radio Comms Narrative Engine
**Project:** Project Aurora (NASA Space Apps Challenge 2026)  
**Date:** 2026-11-12  
**Author:** Lead Astronomer & Game Systems Architect  
**Status:** Approved  

---

## 1. Executive Summary & Objective

### 1.1 Goal
Transform *Project Aurora* from a passive scientific visualizer into an emotionally gripping, astronomically authentic space adventure game suitable for competitive submission to the **NASA Space Apps Challenge**. 

### 1.2 Core Pillars
1. **Compelling Narrative Arc ("The Lost Telemetry of Odyssey"):** An urgent rescue and discovery mission to recover critical subterranean biosignature and water-ice data from a dark Mars outpost.
2. **Authentic Apollo/Artemis Radio Comms HUD:** High-immersion, real-time audio transmission widget featuring authentic NASA Quindar tones (2525 Hz intro, 2475 Hz outro), synthesized radio static/bandpass filter, animated audio VU waveform meters, and typewriter dialogue.
3. **Cinematic Mission Briefing Dossier:** An interactive, classified NASA Flight Operations briefing modal on boot with orbital reconnaissance imagery, mission timeline, and audio clearance authorization.
4. **Astronomical & Telemetry Fidelity:** Seamless integration with real NASA Planetary Data System (PDS) datasets (CRISM, PIXL, HiRISE, RIMFAX) and space physics (Hohmann transfer, 1.4 km/s capture burn, 7 Minutes of Terror entry).

---

## 2. Narrative Design: "The Lost Telemetry of Odyssey"

### 2.1 The Lore & Premise
In late 2025, NASA's automated precursor station **Odyssey-01** made landfall in Jezero Crater, Mars. While executing deep subsurface drilling into the ancient Neretva Vallis delta mudstones, its suite of instruments (PIXL & RIMFAX) detected an anomalous subterranean reservoir containing high-concentration hydrated carbonates and potential organic signatures.

Before transmission could complete, a severe category-5 global Martian dust storm severely compromised the station's main solar array and high-gain antenna. The station engaged emergency low-power mode, cached its raw telemetry to its surface rover data recorder, and went dark.

The player assumes command of **Aurora-07**—NASA's next-generation rapid-response flight crew. Your mission:
1. Engineer a spacecraft in the Assembly Hangar with sufficient $\Delta V$, thermal protection, and life support.
2. Navigate a 214-day heliocentric Hohmann transfer orbit while mitigating Class-X Solar Coronal Mass Ejections (CMEs).
3. Execute the 1.4 km/s retrograde capture burn and survive the harrowing atmospheric entry interface ("7 Minutes of Terror").
4. Deploy the surface exploration rover and Ingenuity scout drone to pinpoint the beacon of Odyssey-01, scan the target mineral strata, and extract the cached NASA PDS science recorder.

---

## 3. Characters & Voice Roster

| Call Sign | Name | Role | Tone & Personality |
|---|---|---|---|
| **[FD]** | **Dr. Imani Vance** | Flight Director, NASA JSC Mission Control | Calm, authoritative, tactical, clear executive commands. |
| **[ENG]** | **Chief Marcus Reyes** | Lead Propulsion & Systems Engineer | Fast-talking, technical, hyper-vigilant over mass/thrust ratios and thermal loads. |
| **[SCI]** | **Dr. Aris Sen** | Chief Astrobiologist & PDS Lead | Passionate, observant, translates complex spectral data into exhilarating discoveries. |
| **[CAPCOM]** | **Capsule Communicator** | Ground Communication Officer | Military precision, standardized NASA countdown protocols and status calls. |

---

## 4. System Architecture & Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT AURORA CORE                      │
│ (src/game/src/main.js, world.js, simulation.js, launch.js)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼ Event Triggers               ▼ Telemetry State
┌──────────────────────────────┐ ┌────────────────────────────┐
│      narrative.js (NEW)      │ │         audio.js           │
│ ──────────────────────────── │ │ ────────────────────────── │
│ • RadioCommsQueue            │ │ • Quindar Tones (2525Hz/   │
│ • StoryMilestoneStateMachine │ │   2475Hz Web Audio)        │
│ • Speech/TTS Engine          │ │ • Radio Bandpass Static FX │
│ • Dialogue Transcripts       │ │ • Red Alert / Klaxon Sirens│
│ • Briefing Dossier Manager   │ │ • Cinematic Exhaust Rumble │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼ DOM & WebGL Overlays
┌─────────────────────────────────────────────────────────────┐
│                  CINEMATIC UI / HUD                         │
│ • #cinematic-briefing-modal (Classified NASA Dossier)       │
│ • #radio-comms-hud (Floating Walkie-Talkie VU Meter Widget) │
│ • #reentry-vignette (Atmospheric Plasma Glow & Shake)       │
│ • #solar-storm-alarm (Tactical Klaxon & CRT Scanlines)      │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 `src/game/src/narrative.js` (Core Narrative Engine)
* **`RadioCommsQueue`**:
  * Prevents speech overlap; enqueues transmissions with priorities (`CRITICAL`, `STANDARD`, `LORE`).
  * Triggers opening Quindar tone $\rightarrow$ radio static burst $\rightarrow$ typewriter text display + synthesized radio voice $\rightarrow$ closing Quindar tone.
  * Provides manual skip / acknowledge option (`Space` or click).
* **`BriefingDossierModal`**:
  * Rendered on initial boot before launch.
  * Shows animated classified stamping, target orbital parameters, reconnaissance telemetry, and "AUTHORIZE EXPEDITION" CTA.
* **`StoryMilestones`**:
  * `BOOT_HERO`: Welcome to NASA Space Operations; Odyssey-01 briefing.
  * `DESTINATION_SELECT`: Dr. Sen breaks down destination orbital characteristics.
  * `ASSEMBLY_PART_ATTACH`: Chief Reyes provides reactive feedback on propulsion, delta-V, and heat shields.
  * `LAUNCH_COUNTDOWN`: CAPCOM countdown sequence with synchronized engine ignition audio.
  * `ORBITAL_TRANSIT`: Mid-flight routine check and mission pacing.
  * `CME_HAZARD`: Emergency siren, Chief Reyes urgent instructions to activate superconducting shield.
  * `RETRO_BURN`: 1.4 km/s Mars capture burn execution.
  * `ATMOSPHERIC_ENTRY`: 7 Minutes of Terror; ionization blackout warning from Dr. Imani.
  * `TOUCHDOWN_SURFACE`: Triumphant landing confirmation.
  * `ODYSSEY_BEACON_DISCOVERY`: Dr. Sen verifies Odyssey-01 blackbox recovery with authentic NASA PDS citations.

### 4.2 `src/game/src/audio.js` Enhancements
* **`playQuindarTone(isStart = true)`**:
  * Web Audio API synthesized sine wave oscillator.
  * Start tone: 2525 Hz for 250 ms at 0.08 gain.
  * End tone: 2475 Hz for 250 ms at 0.08 gain.
* **`playRadioStatic(durationMs = 300)`**:
  * Bandpass-filtered white noise buffer (Q=3, center frequency 1200 Hz) simulating VHF/UHF space communication burst.
* **`playKlaxonAlarm()`**:
  * Modulated dual-frequency emergency alarm for CME storms and critical thermal warnings.

### 4.3 UI/UX Specifications (`aurora-theme.css`)
* **Mission Briefing Modal (`#cinematic-briefing-modal`):**
  * Aesthetic: Retro-futuristic NASA Apollo/Artemis mission operations terminal.
  * Styling: Deep slate background (`#070b14`), luminous cyan and amber typography (`#00f0ff`, `#ffb700`), high-contrast monospace metadata, glowing classified watermark.
* **Floating Radio Comms HUD (`#radio-comms-hud`):**
  * Positioned at top-center/right of viewport.
  * Shows speaker callsign badge (e.g., `[FD] DR. IMANI`), frequency display (`CH 424.15 MHz`), real-time animated CSS audio waveform bars, typewriter text box, and pulse transmission indicator.

---

## 5. Technical Implementation Details

### 5.1 Voice Generation & Bandpass Synthesis
To ensure maximum reliability without requiring external API keys:
1. Primary: Browser `window.speechSynthesis` with character-specific pitch/rate profiles:
   - Dr. Imani: Pitch 0.95, Rate 1.0 (calm, authoritative female/neutral voice).
   - Chief Reyes: Pitch 0.85, Rate 1.15 (energetic, technical male voice).
   - Dr. Sen: Pitch 1.10, Rate 1.05 (expressive scientist voice).
2. Audio Filter: Audio routing through a Web Audio `BiquadFilterNode` (`type: 'bandpass'`, `frequency: 1400Hz`) to give that unmistakable NASA astronaut radio headset timbre.
3. Fallback: If `speechSynthesis` is disabled, unsupported, or muted by user, typewriter text and Quindar tones execute flawlessly without disruption.

### 5.2 Responsive & Non-Intrusive UX
* The Comms HUD must never obscure critical flight controls (docking buttons, rover steering, or navigation throttles).
* An unobtrusive "Mute Radio" toggle button is provided directly on the Comms HUD for accessibility.
* All story events save progress in `localStorage` under `aurora_narrative_progress` to prevent repetitive dialog on reloads.

---

## 6. Verification & Quality Assurance Plan

1. **Unit & Logic Verification:**
   - Verify `RadioCommsQueue` handles back-to-back transmissions without dropping or deadlocking.
   - Verify Quindar tone frequencies match historical NASA Apollo/Artemis specs (2525 Hz and 2475 Hz).
2. **Integration Verification:**
   - Test full playthrough loop from Hero $\rightarrow$ Assembly $\rightarrow$ Launch $\rightarrow$ CME $\rightarrow$ Retro Burn $\rightarrow$ Entry $\rightarrow$ Surface.
   - Ensure all 6 story beats trigger cleanly at their intended milestones.
3. **Audio & Visual Inspection:**
   - Confirm audio works smoothly across Chrome, Edge, and Firefox.
   - Confirm layout looks sharp and legible on mobile, tablet, and 4K displays.
   - Verify zero console errors and clean fallback when audio is muted.
