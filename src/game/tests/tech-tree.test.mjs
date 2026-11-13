import test from 'node:test';
import assert from 'node:assert/strict';
import { CareerEngine, TECH_TREE } from '../src/career.js';

test('TECH_TREE contains 12 aerospace research nodes across 4 branches', () => {
  assert.equal(TECH_TREE.length, 12);
  const branches = new Set(TECH_TREE.map(t => t.branch));
  assert.deepEqual(Array.from(branches).sort(), ['avionics', 'power', 'propulsion', 'science'].sort());

  for (const node of TECH_TREE) {
    assert.ok(node.id);
    assert.ok(node.name);
    assert.ok(node.trl);
    assert.ok(typeof node.cost === 'number');
    assert.ok(node.effectLabel);
    assert.ok(node.modifiers);
  }
});

test('CareerEngine manages active officer selection and retrieves perk modifiers', () => {
  const engine = new CareerEngine();
  engine.resetCareer();

  assert.equal(engine.getActiveOfficer().id, 'flight');
  engine.setActiveOfficer('systems');
  assert.equal(engine.getActiveOfficer().id, 'systems');
  assert.equal(engine.getActiveOfficer().perkModifiers.repairBonus, 1.25);
});

test('CareerEngine unlocks tech nodes when prerequisites and XP are met', () => {
  const engine = new CareerEngine();
  engine.resetCareer();

  // Cadet starts with 0 XP
  assert.equal(engine.unlockTech('prop_aerocapture'), false, 'Cannot unlock TRL 7 without prerequisite');

  // Add 200 XP
  engine.addSciencePoints(200, 'mars', true);
  assert.equal(engine.unlockTech('prop_ion_grid'), true, 'Should unlock root node with sufficient XP');
  assert.ok(engine.isTechUnlocked('prop_ion_grid'));

  // Now prerequisite is met for prop_aerocapture
  assert.equal(engine.unlockTech('prop_aerocapture'), true);
  assert.ok(engine.isTechUnlocked('prop_aerocapture'));
});

test('CareerEngine aggregates combined officer and tech-tree modifiers', () => {
  const engine = new CareerEngine();
  engine.resetCareer();
  engine.addSciencePoints(1000, 'mars', true);

  engine.setActiveOfficer('flight'); // efficiency: 1.15
  engine.unlockTech('prop_ion_grid'); // efficiency: 1.10

  const mods = engine.getCombinedModifiers();
  assert.ok(mods.efficiency > 1.20, 'Efficiency should multiply or sum');
});

test('Evaluator mode unlocks all tech nodes', () => {
  const engine = new CareerEngine();
  engine.resetCareer();
  engine.setEvaluatorMode(true);

  for (const node of TECH_TREE) {
    assert.equal(engine.isTechUnlocked(node.id), true);
  }
});
