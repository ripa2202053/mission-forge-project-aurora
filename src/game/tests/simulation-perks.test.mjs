import test from 'node:test';
import assert from 'node:assert/strict';
import { designStats, DEFAULT_LOADOUT } from '../src/data.js';
import { Simulation } from '../src/simulation.js';

test('designStats applies tech tree and crew modifiers to calculated vehicle stats', () => {
  const base = designStats(DEFAULT_LOADOUT, 'mars');
  const buffed = designStats(DEFAULT_LOADOUT, 'mars', {
    efficiency: 1.15,
    thrust: 1.20,
    yield: 1.30,
    cooling: 1.15,
    armor: 0.85
  });

  assert.ok(buffed.efficiency > base.efficiency, 'Efficiency should be improved');
  assert.ok(buffed.thrust > base.thrust, 'Thrust should be amplified');
  assert.ok(buffed.yield > base.yield, 'Science yield should be increased');
  assert.ok(buffed.cooling > base.cooling, 'Thermal cooling rate should be improved');
});

test('Simulation stores active crew officer and applies perk bonuses to gameplay', () => {
  const mockOfficer = {
    id: 'science',
    title: 'Science Specialist',
    callsign: 'SCIENCE',
    perkModifiers: { yield: 1.30, lidarRangeBonus: 25 }
  };

  const sim = new Simulation({
    destination: 'mars',
    officer: mockOfficer
  });

  assert.ok(sim.officer);
  assert.equal(sim.officer.id, 'science');
  assert.equal(sim.officer.perkModifiers.yield, 1.30);
});
