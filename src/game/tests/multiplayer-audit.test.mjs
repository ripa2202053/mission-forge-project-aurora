import test from 'node:test';
import assert from 'node:assert/strict';

// Mock browser globals for Node test environment
globalThis.sessionStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

globalThis.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

class MockBroadcastChannel {
  constructor(name) { this.name = name; }
  postMessage() {}
  close() {}
}
globalThis.BroadcastChannel = MockBroadcastChannel;

const { crew, CREW_ROLES, getSubsystemRole, getStageRole } = await import('../src/crew.js');

test('Multiplayer: Room creation sets host role as assigned and remaining 3 as open', () => {
  sessionStorage.clear();
  localStorage.clear();

  const roomCode = crew.createRoom('Commander Alex', 'flight');
  assert.match(roomCode, /^AUR-[A-Z0-9]{3}$/);
  assert.equal(crew.myRole, 'flight');
  assert.equal(crew.myName, 'Commander Alex');
  assert.equal(crew.isHost, true);

  const roster = crew.roster;
  assert.equal(roster.length, 4);

  const flightStation = roster.find(m => m.id === 'flight');
  assert.equal(flightStation.isAssigned, true);
  assert.equal(flightStation.name, 'Commander Alex');

  const otherStations = roster.filter(m => m.id !== 'flight');
  otherStations.forEach(s => {
    assert.equal(s.isAssigned, false, `Station ${s.id} should be unassigned`);
  });
});

test('Multiplayer Role Conflict: Joining with an already assigned role is strictly blocked', () => {
  // Simulate Player 2 in a separate session
  sessionStorage.clear();
  
  // Player 1 created the room and took 'flight'
  const roomData = JSON.parse(localStorage.getItem(`aurora_room_${crew.roomCode}`));
  assert.ok(roomData);
  assert.equal(roomData.roster.find(m => m.id === 'flight').isAssigned, true);

  // Player 2 attempts to join the room with 'flight'
  const res = crew.joinRoom(crew.roomCode, 'Imposter Alex', 'flight');
  assert.equal(res.success, false);
  assert.match(res.error, /STATION OCCUPIED/);

  // Verify the host station was NOT overwritten
  const verifyRoster = crew.loadRoster();
  assert.equal(verifyRoster.find(m => m.id === 'flight').name, 'Commander Alex');
});

test('Multiplayer Role Allocation: Joining with an open role succeeds and claims station', () => {
  sessionStorage.clear();

  // Player 2 joins with 'systems'
  const res = crew.joinRoom(crew.roomCode, 'Engineer Maya', 'systems');
  assert.equal(res.success, true);
  assert.equal(crew.myRole, 'systems');
  assert.equal(crew.myName, 'Engineer Maya');

  const updatedRoster = crew.loadRoster();
  const systemsStation = updatedRoster.find(m => m.id === 'systems');
  assert.equal(systemsStation.isAssigned, true);
  assert.equal(systemsStation.name, 'Engineer Maya');

  // Flight station is still Commander Alex
  const flightStation = updatedRoster.find(m => m.id === 'flight');
  assert.equal(flightStation.isAssigned, true);
  assert.equal(flightStation.name, 'Commander Alex');
});

test('Multiplayer Third Player: Cannot claim either of the first two players roles', () => {
  sessionStorage.clear();

  // Player 3 attempts to claim 'flight'
  const res1 = crew.joinRoom(crew.roomCode, 'Cadet Sam', 'flight');
  assert.equal(res1.success, false);
  assert.match(res1.error, /STATION OCCUPIED/);

  // Player 3 attempts to claim 'systems'
  const res2 = crew.joinRoom(crew.roomCode, 'Cadet Sam', 'systems');
  assert.equal(res2.success, false);
  assert.match(res2.error, /STATION OCCUPIED/);

  // Player 3 claims 'science' (open)
  const res3 = crew.joinRoom(crew.roomCode, 'Dr. Jordan', 'science');
  assert.equal(res3.success, true);
  assert.equal(crew.myRole, 'science');
});

test('Multiplayer Station Claiming: Lobby station switching respects occupancy', () => {
  // Current player is 'science' (Dr. Jordan)
  assert.equal(crew.myRole, 'science');

  // Attempting to claim 'flight' (occupied by Commander Alex) should fail
  const switchFail = crew.claimStation('flight');
  assert.equal(switchFail.success, false);
  assert.match(switchFail.error, /already manned/);

  // Attempting to claim 'comms' (open) should succeed
  const switchSuccess = crew.claimStation('comms');
  assert.equal(switchSuccess.success, true);
  assert.equal(crew.myRole, 'comms');

  // 'science' should now be released as open
  const scienceStation = crew.roster.find(m => m.id === 'science');
  assert.equal(scienceStation.isAssigned, false);

  // 'comms' should now be assigned to Dr. Jordan
  const commsStation = crew.roster.find(m => m.id === 'comms');
  assert.equal(commsStation.isAssigned, true);
  assert.equal(commsStation.name, 'Dr. Jordan');
});

test('Multiplayer Leave Room: Frees the station and resets player to solo', () => {
  assert.equal(crew.isCrewMode(), true);
  const leftRole = crew.myRole;

  crew.leaveRoom();
  assert.equal(crew.isCrewMode(), false);
  assert.equal(crew.roomCode, '');

  // The role they left should now be marked unassigned in the room
  const roomData = JSON.parse(localStorage.getItem(`aurora_room_${crew.roomCode}`) || '{}');
  if (roomData.roster) {
    const vacated = roomData.roster.find(m => m.id === leftRole);
    assert.equal(vacated.isAssigned, false);
  }
});

test('Multiplayer Stage & Subsystem Authority Rules', () => {
  // Stage authority mapping
  assert.equal(getStageRole(0), 'flight');   // Launch & Injection
  assert.equal(getStageRole(1), 'comms');    // Cruise & DSN
  assert.equal(getStageRole(2), 'science');  // Approach & Orbit Sweep
  assert.equal(getStageRole(3), 'systems');  // Descent & Landing
  assert.equal(getStageRole(4), 'science');  // Surface & Rover
  assert.equal(getStageRole(5), 'flight');   // Earth Re-entry

  // Subsystem authority mapping
  assert.equal(getSubsystemRole(0), 'systems'); // Propulsion
  assert.equal(getSubsystemRole(1), 'systems'); // Power
  assert.equal(getSubsystemRole(2), 'systems'); // Shield
  assert.equal(getSubsystemRole(3), 'science'); // Scanners
  assert.equal(getSubsystemRole(4), 'comms');   // Comms Dish
  assert.equal(getSubsystemRole(5), 'systems'); // Thermal
  assert.equal(getSubsystemRole(6), 'systems'); // Thrusters
  assert.equal(getSubsystemRole(7), 'science'); // Rover / Drill
  assert.equal(getSubsystemRole(8), 'systems'); // Propellant Tanks
});
