# Technical Specification: Crew Personality & Aerospace Tech-Tree (RPG & Progression)
**Project:** Project Aurora (NASA Space Apps Challenge 2026)  
**Date:** 2026-11-12  
**Author:** Lead Game Systems Architect & Astronomer  
**Status:** Approved  

---

## 1. Executive Summary & Objective

### 1.1 Goal
Elevate Project Aurora's progression from a static XP bar into an engaging, replayable **Aerospace RPG & Tech-Tree Progression System**. Players customize their crew specialization, choose active mission commanders with distinct personalities and authentic NASA skill perks, and invest earned Science Points into an authentic **NASA Technology Readiness Level (TRL 6 → TRL 9) Branching Tech-Tree**.

### 1.2 Core Pillars
1. **Crew Personality & Specialization Perks (RPG System):**
   - 4 fully-realized NASA flight officers (Commander Alex, Engineer Maya, Dr. Jordan, Officer Sam).
   - Rich biographies, psychological profiles, flight callsigns, and voice quotes.
   - Distinct, measurable passive and active operational perks affecting spacecraft flight dynamics, thermal margins, science yield, and collision avoidance.
2. **Aerospace Branching Tech-Tree (TRL R&D Progression):**
   - 12 authentic NASA aerospace research nodes divided into 4 specialized disciplines:
     1. *Propulsion & Trajectory (TRL 6 → TRL 8)*: Ion thrusters, aerocapture heat shields, VASIMR plasma.
     2. *Power & Cryogenic Thermals*: MMRTG thermocouples, loop heat pipes, Kilopower surface fission.
     3. *Planetary Science Instrumentation*: Raman laser altimeter, RIMFAX subsurface radar, Deep-UV biosensors.
     4. *Avionics, Optical Comms & FDIR*: Crater navigation, Deep Space Optical Communications (DSOC), Neural FDIR.
   - Node prerequisites, Science Point (XP) costs, research commit SFX, and real-time ship stat buffs.
3. **Interactive Career, Crew Dossier & Tech-Tree UI:**
   - Seamlessly integrated tabbed modal in `#career-modal`:
     - Tab 1: Flight Officer Certification (Existing Ranks & TRL Level).
     - Tab 2: Crew Dossier & Officer Selection (Avatar glyphs, backstory, active perk stats).
     - Tab 3: Interactive TRL Tech-Tree (Branching visual nodes, unlock states, point balance).
4. **Simulation & Gameplay Integration:**
   - Active crew perks and researched tech nodes directly feed into `designStats()` and `Simulation` dynamics:
     - Fuel efficiency, thruster response, damage resistance, science yield, LIDAR scan radius, and storm shelter resilience.

---

## 2. Detailed Technical Architecture

### 2.1 Crew Profiles & RPG Perks

| Officer | Role / Callsign | Personality & Specialty | Active Perk & In-Game Buffs |
| :--- | :--- | :--- | :--- |
| **Commander Alex** | Flight Director / `FLIGHT` | Astrodynamics veteran; calculated under high-G maneuvers; Artemis trajectory specialist. | **Orbital Slingshot:** +15% delta-v efficiency on interplanetary transfers; +20% CAM burn clearance margin; -15% docking drift. |
| **Engineer Maya** | Spacecraft Systems / `EECOM` | MIT propulsion innovator; JPL hardware tester; relentless troubleshooter. | **Overclocked Bus:** +25% hull repair rate; +15% thermal cooling rate; -20% battery drain while rover driving. |
| **Dr. Jordan** | Science Payload / `SCIENCE` | Planetary petrologist & astrobiologist; passionate about biosignature discovery. | **Spectral Resonance:** +30% sample discovery yield; +25m LIDAR radar beacon detection radius; +20% multi-angle bonus. |
| **Officer Sam** | Comms & Dynamics / `FIDO` | Deep Space Network cryptographer; calm voice in crisis comms blackouts. | **DSN Phased Lock:** +40% comms link margin; -35% solar storm blackout duration; +5s Ingenuity drone flight battery. |

### 2.2 Tech-Tree Schema (`TECH_TREE`)

Each tech node contains:
```javascript
{
  id: 'prop_aerocapture',
  branch: 'propulsion',
  name: 'Advanced Carbon-Phenolic Aerocapture',
  trl: 'TRL 7',
  cost: 120, // Science points required
  prerequisite: 'prop_ion_grid',
  description: 'Woven carbon-phenolic heat shield tiles designed for blunt-body entry.',
  effectLabel: '+25% atmospheric drag heat mitigation',
  modifiers: { heatDissipation: 1.25, maxSafeAoA: 2.5 }
}
```

### 2.3 Math & Stat Integration

In `designStats(loadout, destId, combinedModifiers)`:
$$\text{Effective Handling} = \text{Base Handling} \times M_{\text{handling}}$$
$$\text{Effective Efficiency} = \text{Base Efficiency} \times M_{\text{efficiency}}$$
$$\text{Effective Science Yield} = \text{Base Yield} \times M_{\text{yield}}$$
$$\text{Effective Armor / Defense} = \text{Base Armor} \times M_{\text{armor}}$$

---

## 3. UI/UX Specifications

- **Tabbed Interface:** Added to `#career-modal`:
  - `[01] RANKS & CERTIFICATION`
  - `[02] CREW DOSSIER & PERKS`
  - `[03] NASA TRL TECH-TREE`
- **Tech Tree Nodes:**
  - Status indicators: `RESEARCHED` (cyan/green glowing border), `AVAILABLE` (amber pulse, unlockable), `LOCKED` (grayed out, requires prerequisite).
  - Click node: confirms research and subtracts Science Points (or free in Evaluator Mode).
  - Plays research commit audio chime (`audio.playResearchCommit()`).

---

## 4. Verification & Testing Strategy

- Unit tests in `src/game/tests/crew-tech-tree.test.mjs`:
  - Verify all 4 crew officer perks and modifiers.
  - Verify tech tree prerequisites and unlocking mechanisms.
  - Verify stat modifier aggregation.
  - Verify persistence across save/load.
- Regression testing:
  - All 105 existing tests must pass with 0 regressions.
- Build verification:
  - Vite production build must compile with 0 errors.
