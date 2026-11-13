import test from 'node:test';
import assert from 'node:assert/strict';
import { updateEdlFlight, triggerParachute, updateDockingApproach, applyPowerShunt } from '../src/flight-minigames.js';

test('applyPowerShunt alters simulation handling and shield values', () => {
  const mockSim = {
    stats: { handling: 1.0, armor: 1.0, yield: 1.0 },
    baseStats: { handling: 1.0, armor: 1.0, yield: 1.0 },
    powerShunt: 'balanced'
  };

  applyPowerShunt(mockSim, 'shields');
  assert.equal(mockSim.powerShunt, 'shields');
  assert.ok(mockSim.stats.armor < 1.0, 'Armor multiplier should improve (lower damage)');

  applyPowerShunt(mockSim, 'engines');
  assert.equal(mockSim.powerShunt, 'engines');
  assert.ok(mockSim.stats.handling > 1.0, 'Handling should increase under engine shunt');

  applyPowerShunt(mockSim, 'balanced');
  assert.equal(mockSim.powerShunt, 'balanced');
  assert.equal(mockSim.stats.handling, 1.0);
});

test('triggerParachute deploys only within valid altitude window', () => {
  const mockSim = {
    position: { z: -100 },
    velocity: { z: -40 },
    edl: { parachuteDeployed: false, parachuteWindowOpen: false }
  };

  // Outside window
  assert.equal(triggerParachute(mockSim), false);

  // Inside window (-350 to -260)
  mockSim.position.z = -300;
  mockSim.edl.parachuteWindowOpen = true;
  assert.equal(triggerParachute(mockSim), true);
  assert.equal(mockSim.edl.parachuteDeployed, true);
  assert.ok(mockSim.velocity.z > -20, 'Velocity should decelerate sharply');
});

test('updateDockingApproach detects capture when within alignment tolerances', () => {
  const mockSim = {
    position: { x: 0.5, y: 0.2, z: -5.0 },
    velocity: { x: 0, y: 0, z: 0.8 },
    docking: { range: 5.0, closureRate: 0.8, offsetX: 0.5, offsetY: 0.2, captured: false },
    target: { x: 0, y: 0, z: 0 }
  };

  const captured = updateDockingApproach(mockSim, {}, 0.016);
  assert.equal(captured, true);
  assert.equal(mockSim.docking.captured, true);
});
