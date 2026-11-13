import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes biometric tension heartbeat and helmet filter methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.updateBiometricTension, 'function');
  assert.equal(typeof audio.stopBiometricTension, 'function');
});

test('FlightAudio biometric tension methods execute safely without throwing', () => {
  const audio = new FlightAudio();
  assert.doesNotThrow(() => {
    audio.updateBiometricTension(120, 0.8);
    audio.updateBiometricTension(75, 0.2);
    audio.stopBiometricTension();
  });
});
