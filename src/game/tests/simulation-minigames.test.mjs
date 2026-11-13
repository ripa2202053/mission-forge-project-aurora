import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/simulation.js';

test('Simulation initializes with active flight minigames state', () => {
  const sim = new Simulation({ destination: 'mars' });
  assert.equal(sim.powerShunt, 'balanced');
  assert.ok(sim.edl);
  assert.ok(sim.docking);
});

test('Simulation executes power shunting via hotkey methods', () => {
  const sim = new Simulation({ destination: 'mars' });
  sim.setPowerShunt('shields');
  assert.equal(sim.powerShunt, 'shields');
  sim.setPowerShunt('engines');
  assert.equal(sim.powerShunt, 'engines');
  sim.setPowerShunt('balanced');
  assert.equal(sim.powerShunt, 'balanced');
});

test('Simulation exposes deployParachute method', () => {
  const sim = new Simulation({ destination: 'mars' });
  assert.equal(typeof sim.deployParachute, 'function');
});
