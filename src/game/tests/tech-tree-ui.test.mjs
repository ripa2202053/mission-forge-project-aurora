import test from 'node:test';
import assert from 'node:assert/strict';
import { createCrewDossierMarkup, createTechTreeMarkup } from '../src/mission-ui.js';
import { career } from '../src/career.js';

test('createCrewDossierMarkup renders all 4 crew specialists with RPG dossiers', () => {
  const html = createCrewDossierMarkup(career);
  assert.ok(html.includes('crew-dossier-grid'));
  assert.ok(html.includes('Commander Alex'));
  assert.ok(html.includes('Engineer Maya'));
  assert.ok(html.includes('Dr. Jordan'));
  assert.ok(html.includes('Officer Sam'));
  assert.ok(html.includes('Orbital Slingshot'));
  assert.ok(html.includes('Overclocked Bus'));
  assert.ok(html.includes('btn-select-officer'));
});

test('createTechTreeMarkup renders 4 branches, research nodes and science points', () => {
  career.addSciencePoints(200, 'mars', true);
  const html = createTechTreeMarkup(career);
  assert.ok(html.includes('tech-tree-container'));
  assert.ok(html.includes('RESEARCH POINTS'));
  assert.ok(html.includes('branch-propulsion'));
  assert.ok(html.includes('branch-power'));
  assert.ok(html.includes('branch-science'));
  assert.ok(html.includes('branch-avionics'));
  assert.ok(html.includes('prop_ion_grid'));
  assert.ok(html.includes('TRL 6'));
  assert.ok(html.includes('btn-research-node'));
});
