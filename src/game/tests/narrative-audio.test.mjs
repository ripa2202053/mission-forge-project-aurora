import test from 'node:test';
import assert from 'node:assert/strict';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes Quindar tone and radio static methods', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playQuindarTone, 'function');
  assert.equal(typeof audio.playRadioStatic, 'function');
  assert.equal(typeof audio.playMissionAlertBeep, 'function');
});

test('FlightAudio Quindar tones run safely without throwing even without AudioContext', async () => {
  const audio = new FlightAudio();
  await assert.doesNotReject(async () => {
    await audio.playQuindarTone(true);
    await audio.playQuindarTone(false);
    await audio.playRadioStatic(150);
    audio.playMissionAlertBeep('warning');
    audio.playMissionAlertBeep('critical');
  });
});
