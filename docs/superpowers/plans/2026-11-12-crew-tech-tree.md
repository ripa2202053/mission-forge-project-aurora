# Crew Personality & Aerospace Tech-Tree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an authentic Aerospace RPG Crew Personality & Branching NASA TRL Tech-Tree system in Project Aurora, allowing players to choose specialized mission officers with tangible gameplay perks and spend Science Points to research aerospace technologies across 4 specialized branches.

**Architecture:** Extend `crew.js` with rich officer personalities and mechanical gameplay perks. Extend `career.js` with `TECH_TREE` catalog, unlock validation, modifier aggregation, and persistent research tracking. Integrate modifiers into `data.js` and `simulation.js`. Build an interactive tabbed Career & Tech-Tree UI in `mission-ui.js` / `main.js`.

**Tech Stack:** JavaScript (ES Modules), Web Audio API, SVG/CSS3 tactical interfaces, Node.js test runner (`node --test`), Vite production builder.

---

### Task 1: Crew RPG Perks & Data Schema (`crew.js`)

**Files:**
- Modify: `src/game/src/crew.js`
- Test: `src/game/tests/crew-rpg.test.mjs`

- [ ] **Step 1: Write failing test `crew-rpg.test.mjs`**
  Verify all 4 crew roles have `bio`, `voiceQuote`, `perkName`, `perkDesc`, and `perkModifiers`.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Enrich `CREW_ROLES` in `src/game/src/crew.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 2: TRL Tech-Tree & Career Progression Engine (`career.js`)

**Files:**
- Modify: `src/game/src/career.js`
- Test: `src/game/tests/tech-tree.test.mjs`

- [ ] **Step 1: Write failing test `tech-tree.test.mjs`**
  Verify `TECH_TREE` nodes, prerequisite enforcement, unlock logic, evaluator override, and modifier aggregation.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `TECH_TREE`, `unlockTech()`, `getTechTreeModifiers()`, `getActiveOfficer()`, and `getCombinedModifiers()` in `career.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 3: Simulation & Design Stat Integration (`data.js` & `simulation.js`)

**Files:**
- Modify: `src/game/src/data.js`
- Modify: `src/game/src/simulation.js`
- Test: `src/game/tests/simulation-perks.test.mjs`

- [ ] **Step 1: Write failing test `simulation-perks.test.mjs`**
  Verify `designStats` applies combined modifiers and `Simulation` incorporates officer perks.
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `data.js` and `simulation.js`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 4: Interactive Tech-Tree & Crew Dossier UI Markup & Styling

**Files:**
- Modify: `src/game/src/mission-ui.js`
- Modify: `src/game/aurora-theme.css`
- Test: `src/game/tests/tech-tree-ui.test.mjs`

- [ ] **Step 1: Write UI tests for Tech-Tree and Crew Dossier markup**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement markup in `mission-ui.js` and tactical styling in `aurora-theme.css`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit changes**

---

### Task 5: Main Game Loop Integration, Research SFX & Production Build

**Files:**
- Modify: `src/game/src/audio.js`
- Modify: `src/game/src/main.js`
- Test: Full test suite (`npm test --prefix src/game`)
- Build: `npm run build --prefix src/game`

- [ ] **Step 1: Add research commit audio chime in `audio.js`**
- [ ] **Step 2: Wire tab switching, officer selection, and tech unlocks in `main.js`**
- [ ] **Step 3: Run full test suite ($100\%$ pass rate)**
- [ ] **Step 4: Compile production build via Vite**
- [ ] **Step 5: Commit and push to `origin/main`**
