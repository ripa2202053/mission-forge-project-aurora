# Technical Specification: Surface Survival & Ingenuity Recon System
**Project:** Project Aurora (NASA Space Apps Challenge 2026)  
**Date:** 2026-11-12  
**Author:** Lead Astronomer & Game Systems Architect  
**Status:** Approved  

---

## 1. Executive Summary & Objective

### 1.1 Goal
Transform Stage 4 (Surface Operations in Jezero Crater / Moon Shackleton) from a simple driving simulator into a high-stakes, authentic planetary exploration and survival experience.

### 1.2 Core Pillars
1. **LIDAR Sonar Radar Ping (Fog of War & Beacon Tracker):** Active sonar pulse triggered via Key `Q` or HUD button, cutting through dense atmospheric dust to highlight boulder hazards, terrain slope gradients, and the lost *Odyssey-01* emergency beacon.
2. **Dynamic Solar vs Shadow Battery Thermals:** Real-time power balance based on direct sunlight vs crater shadow / dust storm attenuation. Equipping an RTG (Radioisotope) provides constant baseline power, whereas solar panels require strategic sun exposure.
3. **Martian Dust Storm & Terrain Sheltering:** Environmental hazard where dust storms surge to category-5 intensity. Driving behind natural ridge cliffs mitigates wind shear and dust deposition.
4. **Ingenuity Aerial Drone Scout (Dual-Vehicle Recon):** Player can deploy the Ingenuity helicopter (Key `H` or HUD button) for a 30-second high-altitude aerial reconnaissance sortie, revealing hidden rock core sites and scouting safe navigational paths.

---

## 2. Detailed Mechanics Specification

### 2.1 LIDAR Sonar Radar Ping
* **Trigger:** Key `Q` or clicking `SCAN PULSE [Q]`.
* **Behavior:**
  * Plays high-tech sonar acoustic echo (`audio.playLidarPing()`).
  * Emits an expanding visual 3D radar wave on the terrain up to $150\text{ m}$ radius.
  * Calculates and displays vector and distance to the closest target or lost beacon:  
    `[LIDAR HIT // ODYSSEY-01 EMERGENCY BEACON DETECTED AT 165m BEARING 310°]`.

### 2.2 Solar vs Shadow Power Balance
* **Surface Power Equation:**
  $$\Delta P = (P_{\text{solar}} \cdot S_{\text{sun}} \cdot (1 - 0.85 \cdot I_{\text{storm}}) + P_{\text{rtg}} - P_{\text{drain}}) \cdot \Delta t$$
  - $S_{\text{sun}} = 1.0$ in direct sunlight, $0.05$ in deep crater shadow / cliff overhangs.
  - $I_{\text{storm}}$: Dust storm intensity ($0.0 \to 1.0$).
  - $P_{\text{rtg}} = 0.035$ if nuclear battery equipped, else $0.0$.
  - $P_{\text{drain}} = 0.04$ idle, $0.09$ when driving, $0.15$ in loose Séítah dunes.
* **Low Power Threshold:** If battery drops below $15\%$, rover enters emergency crawl mode and illuminates flashing warning strobes.

### 2.3 Martian Dust Storm & Terrain Sheltering
* **Storm Cycle:** Storms dynamically build every $50 - 90\text{ s}$, howling wind audio scales with intensity.
* **Sheltered Zones:** Defined by geological scarp boundaries (e.g. $X < -50$ or proximity within $20\text{ m}$ of Neretva Vallis breach wall).
* **Shelter Effect:**
  - Wind force reduced by $75\%$.
  - Solar array dust accumulation halted.
  - HUD displays: `[TERRAIN SHELTER CONFIRMED // CLIFF DEFLECTING DUST STREAM]`.

### 2.4 Ingenuity Scout Helicopter Reconnaissance
* **Toggle:** Key `H` or clicking `DEPLOY INGENUITY DRONE`.
* **Sortie Mode:**
  - Camera transitions to aerial perspective at $+18\text{ m}$ altitude.
  - Plays authentic counter-rotating rotor whir (`audio.playDroneRotor()`).
  - Flight time budget: $30\text{ s}$ battery capacity per flight.
  - Drone moves at $2\times$ rover speed to scout terrain fissures, marking optimal rover routes.
  - Pressing `H` again or battery exhaustion lands the drone safely and returns camera to Perseverance rover.

---

## 3. UI/UX & HUD Architecture (`#surface-survival-hud`)

* **Position:** Fixed bottom-left / top-center during Stage 4.
* **Components:**
  * `SURFACE POWER GAUGE`: Shows current Solar vs RTG generation and drain state (`SUNNY +0.04 kW` or `SHADOW -0.08 kW`).
  * `DUST STORM BAR`: Real-time atmospheric optical depth ($\tau$) and storm threat indicator.
  * `SHELTER BADGE`: Green pill displaying `SHELTERED` vs orange `EXPOSED`.
  * `INGENUITY FLIGHT DOCK`: Sortie button with countdown ring and battery gauge.

---

## 4. Verification & Testing Plan
* **Unit Tests (`src/game/tests/surface-survival.test.mjs`):**
  - Verify solar vs shadow power calculations with and without RTG.
  - Verify terrain shelter detection logic.
  - Verify Ingenuity drone flight sortie state and 30-second flight timer.
  - Verify LIDAR ping beacon distance calculation.
* **Regression & Build:**
  - All 93 existing unit tests must continue to pass ($100\%$ pass rate).
  - Production build via Vite must compile with 0 errors.
