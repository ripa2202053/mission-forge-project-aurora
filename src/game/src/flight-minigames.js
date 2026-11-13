/**
 * PROJECT AURORA
 * NASA Space Apps Challenge 2026
 * Active Flight Minigames: EDL (Seven Minutes of Terror), Orbital Docking, & Tactical Power Shunting
 */

export function applyPowerShunt(sim, mode = 'balanced') {
  if (!sim) return 'balanced';
  if (!sim.baseStats && sim.stats) {
    sim.baseStats = {
      handling: sim.stats.handling,
      armor: sim.stats.armor,
      yield: sim.stats.yield,
      efficiency: sim.stats.efficiency
    };
  }

  const base = sim.baseStats || sim.stats || { handling: 1.0, armor: 1.0, yield: 1.0, efficiency: 1.0 };
  sim.powerShunt = mode;

  if (mode === 'engines') {
    sim.stats.handling = Number((base.handling * 1.35).toFixed(2));
    sim.stats.armor = Number((base.armor * 1.25).toFixed(2)); // Higher vulnerability
    sim.stats.yield = Number((base.yield * 0.85).toFixed(2));
  } else if (mode === 'shields') {
    sim.stats.armor = Number((base.armor * 0.40).toFixed(2)); // 60% damage mitigation
    sim.stats.handling = Number((base.handling * 0.75).toFixed(2));
    sim.stats.yield = Number((base.yield * 0.80).toFixed(2));
  } else {
    // Balanced
    sim.stats.handling = base.handling;
    sim.stats.armor = base.armor;
    sim.stats.yield = base.yield;
  }

  sim.emit?.('powerShuntChange', { mode, stats: sim.stats });
  return mode;
}

export function updateEdlFlight(sim, inputState = {}, dt = 0.016) {
  if (!sim) return;
  if (!sim.edl) {
    sim.edl = {
      aoaX: 0,
      aoaY: 0,
      maxSafeAoA: 15.0,
      parachuteWindowOpen: false,
      parachuteDeployed: false,
      terminalLandingPhase: false,
      retroBrakingScore: 0
    };
  }

  // Aerodynamic perturbation drift in thin atmosphere
  const buffetStrength = (sim.reentryIntensity || 0.4) * 8.0 * dt;
  sim.edl.aoaX += (Math.random() * 2 - 1) * buffetStrength;
  sim.edl.aoaY += (Math.random() * 2 - 1) * buffetStrength;

  // Active steering torque from player controls
  const steerRate = 24.0 * (sim.stats?.handling || 1.0) * dt;
  if (inputState.left || inputState.ArrowLeft || inputState.KeyA) sim.edl.aoaX -= steerRate;
  if (inputState.right || inputState.ArrowRight || inputState.KeyD) sim.edl.aoaX += steerRate;
  if (inputState.up || inputState.ArrowUp || inputState.KeyW) sim.edl.aoaY -= steerRate;
  if (inputState.down || inputState.ArrowDown || inputState.KeyS) sim.edl.aoaY += steerRate;

  // Auto-stabilization damping towards center of compression cone
  sim.edl.aoaX *= Math.pow(0.85, dt * 60);
  sim.edl.aoaY *= Math.pow(0.85, dt * 60);

  const currentAngle = Math.hypot(sim.edl.aoaX, sim.edl.aoaY);

  // If angle of attack drifts outside blunt body thermal protection cone
  if (currentAngle > sim.edl.maxSafeAoA) {
    const thermalPen = (currentAngle - sim.edl.maxSafeAoA) * 1.5 * dt;
    sim.heat = Math.min(100, (sim.heat || 0) + thermalPen);
    sim.emit?.('edlAoAWarn', { aoa: currentAngle, heat: sim.heat });
  }

  // Supersonic Parachute Deploy Window: between -350 and -260 meters
  const zPos = sim.position?.z || 0;
  if (zPos >= -350 && zPos <= -260 && !sim.edl.parachuteDeployed) {
    sim.edl.parachuteWindowOpen = true;
  } else {
    sim.edl.parachuteWindowOpen = false;
  }

  // Terminal Sky-Crane / Retro-thruster touchdown phase (final 80m)
  if (zPos > -120) {
    sim.edl.terminalLandingPhase = true;
  }
}

export function triggerParachute(sim) {
  if (!sim?.edl) return false;
  if (!sim.edl.parachuteWindowOpen || sim.edl.parachuteDeployed) return false;

  sim.edl.parachuteDeployed = true;
  sim.edl.parachuteWindowOpen = false;

  if (sim.velocity) {
    sim.velocity.z *= 0.38;
    sim.velocity.x *= 0.4;
    sim.velocity.y *= 0.4;
  }
  if (sim.speedCommand) {
    sim.speedCommand *= 0.38;
  }
  sim.heat = Math.max(0, (sim.heat || 0) - 25);
  sim.score = (sim.score || 0) + 25;
  sim.emit?.('parachuteDeploySuccess', { z: sim.position?.z, score: sim.score });
  return true;
}

export function updateDockingApproach(sim, inputState = {}, dt = 0.016) {
  if (!sim) return false;
  const target = sim.target || { x: 0, y: 8, z: -610 };
  const pos = sim.position || { x: 0, y: 0, z: 0 };
  const vel = sim.velocity || { x: 0, y: 0, z: 0 };

  const dx = pos.x - target.x;
  const dy = pos.y - target.y;
  const dz = pos.z - target.z;
  const range = Math.hypot(dx, dy, dz);
  const closureRate = Math.hypot(vel.x, vel.y, vel.z);

  if (!sim.docking) {
    sim.docking = {
      range: 100,
      closureRate: 0,
      offsetX: dx,
      offsetY: dy,
      captured: false
    };
  }

  sim.docking.range = Number(range.toFixed(2));
  sim.docking.closureRate = Number(closureRate.toFixed(2));
  sim.docking.offsetX = Number(dx.toFixed(2));
  sim.docking.offsetY = Number(dy.toFixed(2));

  // Alignment tolerances for hard-dock latch
  const isAligned = Math.abs(dx) <= 2.2 && Math.abs(dy) <= 2.2;
  const isSoftSpeed = closureRate >= 0.15 && closureRate <= 2.2;

  if (range <= 6.5 && isAligned && isSoftSpeed && !sim.docking.captured) {
    sim.docking.captured = true;
    sim.score = (sim.score || 0) + 40;
    sim.emit?.('dockingCaptureConfirmed', {
      range: sim.docking.range,
      speed: sim.docking.closureRate,
      bonus: 40
    });
    return true;
  }

  return sim.docking.captured;
}

export {
  createInitialSurfaceSurvivalState,
  checkTerrainShelter,
  triggerLidarPing,
  toggleDroneSortie,
  updateSurfaceSurvival
} from './surface-survival.js';

