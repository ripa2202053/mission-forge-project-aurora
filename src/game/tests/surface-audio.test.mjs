import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes LIDAR ping and drone rotor audio methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playLidarPing, 'function');
  assert.equal(typeof audio.playDroneRotor, 'function');
});

test('FlightAudio surface audio methods execute safely without errors', async () => {
  const audio = new FlightAudio();
  await assert.doesNotReject(async () => {
    await audio.playLidarPing();
    audio.playDroneRotor(true);
    audio.playDroneRotor(false);
  });
});
