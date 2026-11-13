import test from 'node:test';
import assert from 'node:assert/strict';
import { NarrativeDirector, NARRATIVE_CAST, STORY_BEATS } from '../src/narrative.js';

test('NARRATIVE_CAST defines flight director, engineer, and science officer', () => {
  assert.ok(NARRATIVE_CAST.imani);
  assert.ok(NARRATIVE_CAST.reyes);
  assert.ok(NARRATIVE_CAST.sen);
  assert.equal(NARRATIVE_CAST.imani.callsign, 'HOUSTON · FLIGHT DIRECTOR');
});

test('NarrativeDirector enqueues and triggers story milestones', async () => {
  let receivedTransmission = null;
  const director = new NarrativeDirector({
    voiceEnabled: false,
    onTransmission: (t) => { receivedTransmission = t; }
  });

  const ok = director.triggerBeat('BOOT_HERO', { delayMs: 0 });
  assert.equal(ok, true);
  
  // Give event loop short tick to process queue
  await new Promise(r => setTimeout(r, 60));
  
  assert.ok(receivedTransmission);
  assert.equal(receivedTransmission.speaker.id, 'imani');
  assert.match(receivedTransmission.message, /Odyssey-01/);
});

test('NarrativeDirector prevents duplicate triggers of one-time milestones', () => {
  const director = new NarrativeDirector({ voiceEnabled: false });
  assert.equal(director.triggerBeat('BOOT_HERO'), true);
  assert.equal(director.triggerBeat('BOOT_HERO'), false);
});
