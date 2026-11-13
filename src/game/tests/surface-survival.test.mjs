import test from 'node:test';
import assert from 'node:assert/strict';
import {
  updateSurfaceSurvival,
  triggerLidarPing,
  toggleDroneSortie,
  checkTerrainShelter,
  createInitialSurfaceSurvivalState
} from '../src/flight-minigames.js';

test('createInitialSurfaceSurvivalState creates default telemetry', () => {
  const state = createInitialSurfaceSurvivalState();
  assert.equal(state.droneActive, false);
  assert.equal(state.droneBattery, 30);
  assert.equal(state.isSheltered, false);
  assert.equal(typeof state.stormOpticalDepth, 'number');
});

test('triggerLidarPing returns range and bearing to closest target or beacon', () => {
  const mockSim = {
    position: { x: 0, y: 0, z: -50 },
    targets: [{ x: 50, y: 0, z: -50, name: 'ODYSSEY-01 BEACON' }]
  };

  const ping = triggerLidarPing(mockSim);
  assert.ok(ping);
  assert.equal(Math.round(ping.range), 50);
  assert.ok(ping.bearing !== undefined);
  assert.match(ping.targetName, /ODYSSEY-01/);
});

test('checkTerrainShelter identifies ridge protection on Mars and Moon', () => {
  const mockSimMars = {
    destination: { id: 'mars' },
    position: { x: -65, z: -100 }
  };
  assert.equal(checkTerrainShelter(mockSimMars), true, 'Position behind west ridge should be sheltered');

  mockSimMars.position.x = 10;
  assert.equal(checkTerrainShelter(mockSimMars), false, 'Open plain should be exposed');

  const mockSimMoon = {
    destination: { id: 'moon' },
    position: { x: -35, z: -140 }
  };
  assert.equal(checkTerrainShelter(mockSimMoon), true, 'Position in Shackleton crater wall should be sheltered');
});

test('toggleDroneSortie toggles drone mode and respects battery exhaustion', () => {
  const mockSim = {
    surfaceSurvival: createInitialSurfaceSurvivalState()
  };

  assert.equal(toggleDroneSortie(mockSim), true);
  assert.equal(mockSim.surfaceSurvival.droneActive, true);

  // Toggle off manually
  assert.equal(toggleDroneSortie(mockSim), false);
  assert.equal(mockSim.surfaceSurvival.droneActive, false);

  // When battery depleted, cannot fly
  mockSim.surfaceSurvival.droneBattery = 0;
  assert.equal(toggleDroneSortie(mockSim), false);
  assert.equal(mockSim.surfaceSurvival.droneActive, false);
});

test('updateSurfaceSurvival drains drone battery during flight and auto-lands', () => {
  const mockSim = {
    stage: 4,
    battery: 100,
    position: { x: 0, y: 0, z: 0 },
    destination: { id: 'mars' },
    stormIntensity: 0.2,
    hasRTG: false,
    surfaceSurvival: createInitialSurfaceSurvivalState()
  };

  mockSim.surfaceSurvival.droneActive = true;
  mockSim.surfaceSurvival.droneBattery = 1.0;

  // Run update for 1.5 seconds dt
  updateSurfaceSurvival(mockSim, 1.5);
  assert.equal(mockSim.surfaceSurvival.droneActive, false, 'Drone should auto-land on battery depletion');
  assert.equal(mockSim.surfaceSurvival.droneBattery, 0);
});

test('updateSurfaceSurvival calculates solar generation vs shadow drain and RTG baseline', () => {
  const mockSimSolar = {
    stage: 4,
    battery: 80,
    position: { x: 0, y: 0, z: 0 },
    destination: { id: 'mars' },
    stormIntensity: 0,
    isDriving: false,
    inShadow: false,
    hasRTG: false,
    surfaceSurvival: createInitialSurfaceSurvivalState()
  };

  updateSurfaceSurvival(mockSimSolar, 1.0);
  assert.ok(mockSimSolar.surfaceSurvival.netPowerFlow !== undefined);
  assert.equal(mockSimSolar.surfaceSurvival.inShadow, false);

  // In shadow without RTG
  mockSimSolar.inShadow = true;
  updateSurfaceSurvival(mockSimSolar, 1.0);
  assert.ok(mockSimSolar.surfaceSurvival.netPowerFlow < 0, 'Shadow should result in negative net power without RTG');

  // With RTG in shadow
  mockSimSolar.hasRTG = true;
  const powerWithRTG = mockSimSolar.surfaceSurvival.netPowerFlow;
  updateSurfaceSurvival(mockSimSolar, 1.0);
  assert.ok(mockSimSolar.surfaceSurvival.netPowerFlow > powerWithRTG - 0.05, 'RTG should provide positive baseline offset');
});
