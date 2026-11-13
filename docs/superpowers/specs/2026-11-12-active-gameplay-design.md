# Technical Specification: Active Hands-on Gameplay Systems
**Project:** Project Aurora (NASA Space Apps Challenge 2026)  
**Date:** 2026-11-12  
**Author:** Lead Astronomer & Game Systems Architect  
**Status:** Approved  

---

## 1. Executive Summary & Objective

### 1.1 Goal
Elevate *Project Aurora* from a passive click-through cruise into a thrilling, skill-demanding space simulation with active, hands-on flight mechanics for the **NASA Space Apps Challenge**.

### 1.2 Core Gameplay Pillars
1. **Pillar 1: "Seven Minutes of Terror" Atmospheric Entry & Descent (EDL - Stage 3):**
   - Active Heat Shield Alignment: Keep the blunt body heat shield pointed within the compression plasma cone ($\pm 15^\circ$ AoA) using attitude controls.
   - Supersonic Parachute Deploy: Timed deployment window matching authentic Martian dynamic pressure ($q$).
   - Sky-Crane / Retro-Thruster Terminal Descent: Manual throttle braking to achieve soft touchdown ($V_z \le 3.5\text{ m/s}$) on Jezero Crater or the Moon.
2. **Pillar 2: Authentic Manual Orbital Docking System (Stage 5):**
   - Apollo/Artemis-grade docking crosshair HUD overlay displaying Range ($R$), Range Rate ($\dot{R}$), and X/Y boresight offset.
   - RCS translation thrusters (`W`/`S` surge, `A`/`D` sway, `Q`/`E` heave) to align into the recovery station's capture envelope.
   - Hard latch capture lock at soft impact velocity ($0.2 \le \dot{R} \le 1.8\text{ m/s}$).
3. **Pillar 3: Active Space Hazard Navigation & Tactical Power Routing (Stage 1 / Hazards):**
   - Real-time 3-bus Power Distribution Matrix (Propulsion, Magnetic Shield, Sensors) with instant tactile hotkeys (`1`, `2`, `3`).
   - Solar CME Coronal Wave evasion and proximity warning alarms for incoming high-velocity micrometeoroid fields with vector guidance.

---

## 2. Detailed Gameplay Mechanics

### 2.1 Atmospheric Entry & Landing (EDL) Mechanics
* **Angle-of-Attack (AoA) Crosshair HUD (`#edl-hud`):**
  * Active during Stage 3 when atmospheric density rises.
  * An animated flight director reticle displays current orientation vs atmospheric velocity vector.
  * If the player drifts outside the safe cone, vehicle thermal stress ($T$) escalates exponentially ($+8\%\text{/sec}$), triggering hull ablation alarms and violent camera shake.
  * Holding steering controls (`A`/`D`/`W`/`S` or Arrow Keys) applies torque to keep the heat shield centered.
* **Supersonic Parachute Trigger:**
  * At distance marker $Z \in [-350, -280]$, a high-contrast HUD indicator flashes:  
    `[MACH 2.2 DEPLOY WINDOW OPEN // PRESS P OR SPACE]`.
  * Successful trigger deploys parachute, instantly bleeding $65\%$ forward velocity and stabilizing flight.
* **Terminal Retrograde Touchdown:**
  * Terminal $80\text{ m}$ to surface: Gravity accelerates descent.
  * Player feathers retrograde thrusters (`W` or `Up`) to brake.
  * Landing categories:
    * **Flawless Touchdown** ($V \le 3.5\text{ m/s}$, offset $\le 14\text{ m}$): $+50$ science points, zero damage, flawless commendation.
    * **Nominal Touchdown** ($3.5 < V \le 6.0\text{ m/s}$): standard score.
    * **Hard Landing / Structural Damage** ($V > 6.0\text{ m/s}$): $-25\text{ HP}$, science instruments degraded.

### 2.2 Manual Orbital Docking Mechanics
* **Docking HUD Boresight (`#docking-hud`):**
  * Active during Stage 5 when within $180\text{ m}$ of the Kepler Recovery Station / Lunar Gateway.
  * Displays:
    * `RANGE`: Distance to docking port in meters.
    * `CLOSURE RATE`: Relative speed in m/s (ideal: $0.5 - 1.2\text{ m/s}$).
    * `ALIGNMENT RETICLE`: Target ring and crosshair showing lateral offset $(\Delta X, \Delta Y)$.
* **Controls:**
  * `W` / `S`: Forward / Reverse RCS thruster pulse ($\pm 0.4\text{ m/s}^2$).
  * `A` / `D`: Left / Right RCS translation.
  * `Q` / `E`: Roll / fine alignment.
* **Capture Condition:**
  * $|\Delta X| \le 2.2\text{ m}$ AND $|\Delta Y| \le 2.2\text{ m}$ AND $0.2 \le \text{Speed} \le 1.8\text{ m/s}$ at Range $< 6.0\text{ m}$.
  * Triggers metallic capture latch sound, green seal indicator, and CAPCOM confirmation: *"Capture confirmed, docking latches hard-locked!"*

### 2.3 Tactical Power Distribution & Hazard Steering
* **Power Shunt Matrix:**
  * **Key 1 / ENGINE BOOST:** Routes $70\%$ power to Ion/Chemical engines. Max speed $+40\%$, handling $+30\%$, shields $-50\%$.
  * **Key 2 / DEFLECTION SHIELDS:** Routes $70\%$ power to Magnetic/Thermal shields. Negates CME solar wind damage by $85\%$ and reduces collision impulse by $60\%$.
  * **Key 3 / BALANCED RECON:** Standard $33/33/33\%$ distribution. Science scan speed $+50\%$.
* **Evasive Threat Detection:**
  * Proximity sensor warns when micrometeoroids or orbital debris are within $45\text{ m}$ on collision trajectory.
  * Tactical HUD arrows highlight the optimal clearance vector.

---

## 3. Architecture & File Structure

```
src/game/src/
├── simulation.js     // Extended with EDL state machine, docking boresight, and power shunting
├── flight-minigames.js // NEW: Dedicated EDL, Docking, and Hazard logic & HUD bindings
├── audio.js          // Docking latch sound, parachute deploy crack, thruster pulse audio
├── aurora-theme.css  // Tactical EDL crosshair, Docking reticle, and Power Matrix styles
└── main.js           // Input routing, keybindings (1/2/3/P), and UI loop integration
```

---

## 4. Verification & Testing Plan
* **Unit Tests:**
  * Verify EDL AoA heat calculation and parachute deploy window logic in `src/game/tests/flight-minigames.test.mjs`.
  * Verify docking capture conditions (range, speed, offset tolerances).
  * Verify power shunt state transitions and stat recalculations.
* **Full Integration & Regression:**
  * All 82 existing unit tests must continue to pass ($100\%$ pass rate).
  * Vite production build must compile with zero errors.
