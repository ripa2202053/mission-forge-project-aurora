import test from 'node:test';
import assert from 'node:assert/strict';
import { NarrativeDirector, STORY_BEATS } from '../src/narrative.js';

test('Story milestones map to all core gameplay states', () => {
  const requiredMilestones = [
    'BOOT_HERO',
    'HANGAR_PART_ION',
    'LAUNCH_COUNTDOWN',
    'CME_STORM_ALERT',
    'RETRO_CAPTURE_BURN',
    'ATMOSPHERIC_ENTRY',
    'SURFACE_TOUCHDOWN',
    'BEACON_LOCATED'
  ];

  for (const m of requiredMilestones) {
    assert.ok(STORY_BEATS[m], `Missing required story milestone: ${m}`);
    assert.ok(STORY_BEATS[m].message.length > 20);
    assert.ok(STORY_BEATS[m].speaker);
  }
});
