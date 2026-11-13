import test from 'node:test';
import assert from 'node:assert/strict';
import { SpaceWorld } from '../src/world.js';

test('SpaceWorld emergency lighting transitions across alert levels', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);

  world.updateCockpitEmergencyLighting('critical', 0.016);
  assert.equal(world.prevAlertLevel, 'critical');
  assert.ok(world.ambient.color.r > 0.6, 'Critical alert must pulse crimson red');

  world.updateCockpitEmergencyLighting('warning', 0.016);
  assert.equal(world.prevAlertLevel, 'warning');
  assert.ok(world.ambient.color.r > 0.5 && world.ambient.color.g > 0.3, 'Warning alert must pulse amber');

  world.updateCockpitEmergencyLighting('normal', 0.016);
  assert.equal(world.prevAlertLevel, 'normal');
});

test('SpaceWorld speed warp streaking and FOV warping', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);

  // Sub-warp cruise (20 m/s)
  world.updateSpeedWarp(20, 0.016);
  assert.equal(world.camera.fov, 46);
  assert.equal(world.stars.scale.z, 1.0);

  // Hyper-speed warp cruise (65 m/s)
  world.updateSpeedWarp(65, 0.1);
  assert.ok(world.camera.fov > 46, 'FOV should expand during high-G speed warp');
  assert.ok(world.stars.scale.z > 1.5, 'Stars should streak along camera depth axis');
  assert.ok(world.stars.material.size > 9, 'Star points should enlarge during warp streaks');
});

test('SpaceWorld discovery bloom surge and visual drama tick', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);

  world.triggerDiscoveryBloomSurge();
  assert.equal(world._bloomSurge, 1.0);
  assert.ok(Math.abs(world.bloom.strength - 0.95) < 0.01);

  // Visual drama frame update with surface rover simulation
  const mockSim = {
    isSurface: true,
    speed: 8.5,
    destId: 'mars',
    droneFlying: false,
    hull: 20, // critical hull triggers cockpit emergency strobe
    power: 10
  };

  world.updateVisualDrama(0.1, mockSim);
  assert.ok(world._bloomSurge < 1.0, 'Bloom surge should decay during visual drama tick');
  assert.equal(world.prevAlertLevel, 'critical');
});
