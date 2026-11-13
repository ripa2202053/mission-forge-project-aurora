import test from 'node:test';
import assert from 'node:assert/strict';
import { CREW_ROLES } from '../src/crew.js';
import { FlightAudio } from '../src/audio.js';

test('FlightAudio exposes playResearchCommit method and executes safely', () => {
  const audio = new FlightAudio();
  assert.equal(typeof audio.playResearchCommit, 'function');
  assert.doesNotThrow(() => {
    audio.playResearchCommit();
  });
});

test('CREW_ROLES contains all 4 specialists with rich RPG dossiers and perks', () => {
  assert.equal(CREW_ROLES.length, 4);

  const roleIds = ['flight', 'systems', 'science', 'comms'];
  for (const id of roleIds) {
    const role = CREW_ROLES.find(r => r.id === id);
    assert.ok(role, `Role ${id} must exist`);
    assert.ok(role.bio, `Role ${id} must have a rich biography`);
    assert.ok(role.voiceQuote, `Role ${id} must have a voice quote`);
    assert.ok(role.perkName, `Role ${id} must have a perk name`);
    assert.ok(role.perkDesc, `Role ${id} must have a perk description`);
    assert.ok(role.perkModifiers, `Role ${id} must have perk modifiers`);
    assert.equal(typeof role.perkModifiers, 'object');
  }
});

test('Commander Alex has flight and trajectory efficiency perks', () => {
  const flight = CREW_ROLES.find(r => r.id === 'flight');
  assert.equal(flight.perkModifiers.efficiency, 1.15);
  assert.equal(flight.perkModifiers.conjunctionMargin, 1.20);
});

test('Engineer Maya has systems and cooling repair perks', () => {
  const systems = CREW_ROLES.find(r => r.id === 'systems');
  assert.equal(systems.perkModifiers.repairBonus, 1.25);
  assert.equal(systems.perkModifiers.cooling, 1.15);
});

test('Dr. Jordan has science recovery and LIDAR bonus perks', () => {
  const science = CREW_ROLES.find(r => r.id === 'science');
  assert.equal(science.perkModifiers.yield, 1.30);
  assert.equal(science.perkModifiers.lidarRangeBonus, 25);
});

test('Officer Sam has comms link and drone battery perks', () => {
  const comms = CREW_ROLES.find(r => r.id === 'comms');
  assert.equal(comms.perkModifiers.link, 1.40);
  assert.equal(comms.perkModifiers.droneBatteryBonus, 5);
});
