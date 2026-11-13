import test from 'node:test';
import assert from 'node:assert/strict';
import { createEdlHudMarkup, createDockingHudMarkup, createPowerShuntMarkup } from '../src/mission-ui.js';

test('createEdlHudMarkup renders AoA reticle and parachute indicator', () => {
  const html = createEdlHudMarkup();
  assert.ok(html.includes('id="edl-hud"'));
  assert.ok(html.includes('edl-aoa-indicator'));
  assert.ok(html.includes('edl-chute-prompt'));
});

test('createDockingHudMarkup renders boresight crosshairs and range rate tags', () => {
  const html = createDockingHudMarkup();
  assert.ok(html.includes('id="docking-hud"'));
  assert.ok(html.includes('docking-crosshair'));
  assert.ok(html.includes('docking-range-rate'));
});

test('createPowerShuntMarkup renders 3 tactile power bus buttons', () => {
  const html = createPowerShuntMarkup();
  assert.ok(html.includes('id="power-shunt-matrix"'));
  assert.ok(html.includes('data-shunt="engines"'));
  assert.ok(html.includes('data-shunt="shields"'));
  assert.ok(html.includes('data-shunt="balanced"'));
});
