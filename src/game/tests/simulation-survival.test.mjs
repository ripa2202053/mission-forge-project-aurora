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

test('Simulation toggleDrone toggles flight sortie and emits event', () => {
  const sim = new Simulation({ destination: 'mars' });
  sim.stage = 4;
  let emitted = null;
  sim.onEvent = (e) => { emitted = e; };
  const active = sim.toggleDrone();
  assert.equal(active, true);
  assert.ok(emitted);
  assert.equal(emitted.type, 'droneToggle');
  assert.equal(emitted.active, true);
});
