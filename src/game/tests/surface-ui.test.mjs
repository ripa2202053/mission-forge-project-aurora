import test from 'node:test';
import assert from 'node:assert/strict';
import { createSurfaceSurvivalHudMarkup } from '../src/mission-ui.js';

test('createSurfaceSurvivalHudMarkup generates accessible surface telemetry overlay', () => {
  const html = createSurfaceSurvivalHudMarkup();
  assert.ok(html.includes('id="surface-survival-hud"'));
  assert.ok(html.includes('survival-power-pill'));
  assert.ok(html.includes('survival-shelter-pill'));
  assert.ok(html.includes('survival-drone-btn'));
  assert.ok(html.includes('survival-lidar-btn'));
});
