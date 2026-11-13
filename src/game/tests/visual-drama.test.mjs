import test from 'node:test';
import assert from 'node:assert/strict';
import { SpaceWorld } from '../src/world.js';

test('SpaceWorld exposes wheel dust and drone downwash particle systems', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  assert.equal(typeof world.spawnWheelDust, 'function');
  assert.equal(typeof world.updateWheelDust, 'function');
  assert.equal(typeof world.triggerDiscoveryBloomSurge, 'function');
});

test('SpaceWorld wheel dust spawns without throwing in headless environment', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  assert.doesNotThrow(() => {
    world.spawnWheelDust({ x: 0, y: 0, z: -50 }, 12.5, 'mars', 0.016);
    world.spawnWheelDust({ x: 0, y: 0, z: -50 }, 8.0, 'moon', 0.016);
    world.updateWheelDust(0.016);
  });
  const activeParticles = world.wheelDustPool.filter(p => p.active);
  assert.ok(activeParticles.length > 0, 'Active wheel dust particles should be spawned');
});

test('SpaceWorld drone downwash spawns ground vortex ring below 25m', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  world.spawnDroneDownwash({ x: 10, y: 5, z: -20 }, 5, 'mars', 0.016);
  const activeParticles = world.wheelDustPool.filter(p => p.active);
  assert.ok(activeParticles.length > 0, 'Drone downwash should spawn particles');
  world.updateWheelDust(0.016);
});

test('SpaceWorld discovery bloom surge elevates bloom strength and decays smoothly', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  assert.equal(world._bloomSurge, 0);
  assert.equal(world.bloom.strength, 0.4);

  world.triggerDiscoveryBloomSurge();
  assert.equal(world._bloomSurge, 1.0);
  assert.ok(Math.abs(world.bloom.strength - 0.95) < 0.01, 'Bloom strength should flare near 0.95');

  world.updateVisualDrama(0.2, null);
  assert.ok(world._bloomSurge < 1.0, 'Bloom surge should decay over time');
  assert.ok(world.bloom.strength < 0.95, 'Bloom strength should reduce as surge decays');
});

test('SpaceWorld emergency lighting strobes crimson on critical alert', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  world.time = 0.5;
  world.updateCockpitEmergencyLighting('critical', 0.016);
  assert.equal(world.prevAlertLevel, 'critical');
  assert.ok(world.ambient.color.r > 0.6, 'Ambient red component should be elevated during critical alert');
});

test('SpaceWorld speed warp streaking engages at velocities above 35 m/s', () => {
  const mockContainer = { appendChild: () => {} };
  const world = new SpaceWorld(mockContainer);
  world.updateSpeedWarp(55, 0.016);
  assert.ok(world.stars.scale.z > 1.0, 'Starfield should be stretched along Z axis during hyper-cruise');
  assert.ok(world.stars.material.size > 9, 'Star point size should enlarge during warp streaks');
});
