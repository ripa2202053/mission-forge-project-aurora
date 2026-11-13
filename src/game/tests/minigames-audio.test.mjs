import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes docking latch, parachute deploy, and power shunt audio methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playDockingLatch, 'function');
  assert.equal(typeof audio.playParachuteDeploy, 'function');
  assert.equal(typeof audio.playPowerShunt, 'function');
});

test('FlightAudio active gameplay sounds execute safely in headless environment', async () => {
  const audio = new FlightAudio();
  await assert.doesNotReject(async () => {
    await audio.playDockingLatch();
    await audio.playParachuteDeploy();
    audio.playPowerShunt();
  });
});
