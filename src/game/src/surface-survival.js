// Surface Survival & Planetary Exploration Engine (NASA Space Apps Challenge 2026)
// Provides LIDAR Sonar Pings, Solar vs Shadow Thermals, Martian Dust Ridge Sheltering,
// and Ingenuity Aerial Drone Reconnaissance Sorties.

export function createInitialSurfaceSurvivalState() {
  return {
    droneActive: false,
    droneBattery: 30, // 30-second flight sortie capacity
    droneMaxBattery: 30,
    droneSpeedMultiplier: 2.0,
    droneAltitude: 18.0,
    isSheltered: false,
    inShadow: false,
    stormOpticalDepth: 0.15,
    netPowerFlow: 0.0,
    lastLidarPing: null,
    lidarCooldown: 0
  };
}

/**
 * Checks if current rover position is sheltered by geological cliffs or crater scarps.
 */
export function checkTerrainShelter(sim) {
  if (!sim || !sim.position) return false;
  const dest = typeof sim.destination === 'string' ? sim.destination : (sim.destination?.id || 'mars');
  const pos = sim.position;

  if (dest === 'mars') {
    // Jezero Crater Western Scarp / Ridge Wall (X < -50 or near Neretva Vallis scarp)
    if (pos.x < -50) return true;
    if (pos.x < -30 && pos.z < -80) return true;
    return false;
  }

  if (dest === 'moon') {
    // Shackleton Crater Rim Depression & Permanently Shadowed Region (PSR) wall
    if (pos.z < -100 && (pos.x < -20 || pos.x > 20)) return true;
    return false;
  }

  return false;
}

/**
 * Emits active LIDAR sonar pulse cutting through dust storm / shadow to locate targets or lost Odyssey beacon.
 */
export function triggerLidarPing(sim) {
  if (!sim) return null;
  if (!sim.surfaceSurvival) {
    sim.surfaceSurvival = createInitialSurfaceSurvivalState();
  }

  const pos = sim.position || { x: 0, y: 0, z: 0 };
  
  // Find targets or lost beacon
  let candidates = [];
  if (Array.isArray(sim.targets) && sim.targets.length > 0) {
    candidates = sim.targets;
  } else if (sim.world && Array.isArray(sim.world.targets) && sim.world.targets.length > 0) {
    candidates = sim.world.targets;
  }

  let closestTarget = null;
  let minDistance = Infinity;

  for (const t of candidates) {
    const tx = t.x ?? t.position?.x ?? 0;
    const tz = t.z ?? t.position?.z ?? 0;
    const dx = tx - pos.x;
    const dz = tz - pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < minDistance) {
      minDistance = dist;
      closestTarget = {
        name: t.name || t.type || 'ODYSSEY-01 BEACON',
        x: tx,
        z: tz,
        distance: dist
      };
    }
  }

  if (!closestTarget) {
    // Fallback emergency transponder coordinates for Odyssey-01 lost mission beacon
    const beaconX = 125;
    const beaconZ = -140;
    const dx = beaconX - pos.x;
    const dz = beaconZ - pos.z;
    closestTarget = {
      name: 'ODYSSEY-01 LOST EMERGENCY BEACON',
      x: beaconX,
      z: beaconZ,
      distance: Math.hypot(dx, dz)
    };
  }

  const dx = closestTarget.x - pos.x;
  const dz = closestTarget.z - pos.z;
  // Bearing in degrees (0 = North/ -Z, 90 = East/+X, 180 = South/+Z, 270 = West/-X)
  const rad = Math.atan2(dx, -dz);
  const bearing = Math.round(((rad * 180) / Math.PI + 360) % 360);
  const range = Math.round(closestTarget.distance * 10) / 10;

  const pingResult = {
    range,
    bearing,
    targetName: closestTarget.name,
    timestamp: Date.now()
  };

  sim.surfaceSurvival.lastLidarPing = pingResult;
  sim.surfaceSurvival.lidarCooldown = 2.0;

  return pingResult;
}

/**
 * Toggles Ingenuity aerial reconnaissance drone sortie.
 */
export function toggleDroneSortie(sim) {
  if (!sim) return false;
  if (!sim.surfaceSurvival) {
    sim.surfaceSurvival = createInitialSurfaceSurvivalState();
  }

  const s = sim.surfaceSurvival;
  if (s.droneActive) {
    // Recall and land drone safely
    s.droneActive = false;
    return false;
  }

  // Check if battery capacity is sufficient for takeoff
  if (s.droneBattery <= 1.0) {
    s.droneActive = false;
    return false;
  }

  s.droneActive = true;
  return true;
}

/**
 * Updates real-time planetary survival metrics: solar/shadow thermal flow, ridge sheltering,
 * dust optical depth, and drone sortie battery lifecycle.
 */
export function updateSurfaceSurvival(sim, dt = 0.016) {
  if (!sim) return;
  if (!sim.surfaceSurvival) {
    sim.surfaceSurvival = createInitialSurfaceSurvivalState();
  }

  const s = sim.surfaceSurvival;
  const clampedDt = Math.min(Math.max(0, dt), 5.0);

  // 1. Ingenuity Recon Drone lifecycle
  if (s.droneActive) {
    s.droneBattery = Math.max(0, s.droneBattery - clampedDt);
    if (s.droneBattery <= 0) {
      s.droneActive = false; // Auto-land on battery exhaustion
    }
  } else {
    // Trickle recharge from rover solar/RTG bus when docked
    s.droneBattery = Math.min(s.droneMaxBattery, s.droneBattery + clampedDt * 0.35);
  }

  // 2. Geological Cliff / Ridge Sheltering
  s.isSheltered = checkTerrainShelter(sim);

  // 3. Solar Radiation vs Shadow & Dust Storm Attenuation
  const inShadow = !!(sim.inShadow || (sim.destination?.id === 'moon' && sim.position?.z < -130));
  s.inShadow = inShadow;

  const stormIntensity = sim.stormIntensity || 0.0;
  // Atmospheric optical depth (tau): 0.15 clean to 2.8 intense dust wall
  s.stormOpticalDepth = Math.round((0.15 + stormIntensity * 2.65) * 100) / 100;

  const sunFactor = inShadow ? 0.05 : 1.0;
  // Dust attenuates solar flux; terrain sheltering protects solar array from heavy deposition
  const stormShield = s.isSheltered ? 0.45 : 0.85;
  const solarGen = 0.10 * sunFactor * Math.max(0.05, 1.0 - stormShield * stormIntensity);
  const rtgGen = sim.hasRTG ? 0.035 : 0.0;
  const driveDrain = sim.isDriving ? 0.05 : 0.0;
  const droneDrain = s.droneActive ? 0.025 : 0.0;
  const baseDrain = 0.04;

  const netPowerFlow = (solarGen + rtgGen) - (baseDrain + driveDrain + droneDrain);
  s.netPowerFlow = Math.round(netPowerFlow * 1000) / 1000;

  // Update battery level in Stage 4
  if (sim.stage === 4 && typeof sim.battery === 'number') {
    sim.battery = Math.min(100, Math.max(0, sim.battery + netPowerFlow * clampedDt * 3.5));
  }

  // Cooldown decrement
  if (s.lidarCooldown > 0) {
    s.lidarCooldown = Math.max(0, s.lidarCooldown - clampedDt);
  }
}
