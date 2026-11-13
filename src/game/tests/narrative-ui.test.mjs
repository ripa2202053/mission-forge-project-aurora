import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommsHudMarkup, createBriefingDossierMarkup } from '../src/mission-ui.js';

test('createCommsHudMarkup generates valid accessible DOM string', () => {
  const html = createCommsHudMarkup();
  assert.ok(html.includes('id="radio-comms-hud"'));
  assert.ok(html.includes('radio-waveform-bar'));
  assert.ok(html.includes('comms-speaker-callsign'));
});

test('createBriefingDossierMarkup includes classified header, lore, and CTA', () => {
  const html = createBriefingDossierMarkup({ destination: 'mars', callsign: 'Odyssey-07' });
  assert.ok(html.includes('EXPEDITION BRIEFING'));
  assert.ok(html.includes('ODYSSEY-01'));
  assert.ok(html.includes('AUTHORIZE EXPEDITION'));
});
