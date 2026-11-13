/**
 * PROJECT AURORA
 * NASA Flight Officer Certification, TRL Tech Tree & Planetary Science Codex Engine
 * Path: src/game/src/career.js
 *
 * Implements:
 * 1. NASA Flight Officer Certification Ranks (Cadet to Flight Director)
 * 2. Aerospace Technology Readiness Levels (TRL 6 to TRL 9)
 * 3. Authentic Planetary Science Codex (Museum of Discoveries) with NASA PDS citations & spectra
 * 4. Progressive Destination Unlocking & Evaluator Override Mode
 * 5. Persistent localStorage career dossier
 */

import { CREW_ROLES } from './crew.js';

export const RANKS = [
  {
    id: 1,
    key: 'cadet',
    title: 'Cadet Flight Controller',
    shortTitle: 'RANK 01 · CADET',
    icon: '🎖️',
    xpRequired: 0,
    unlockedDestinations: ['earth', 'moon'],
    trlLevel: 'TRL 6 · System/Subsystem Model Validation',
    agencyDomain: 'Low Earth Orbit & Suborbital Sounding Trajectory Operations',
    responsibilities: 'Master orbital insertion corridors, debris conjunction tracking, and basic DSN telemetry handshakes.',
    unlockedPartsNote: 'Chemical LH2 Engine · Solar Photovoltaic Grid · Whipple Shielding'
  },
  {
    id: 2,
    key: 'lunar_specialist',
    title: 'Lunar Surface Specialist',
    shortTitle: 'RANK 02 · LUNAR SPECIALIST',
    icon: '🌕',
    xpRequired: 150,
    unlockedDestinations: ['earth', 'moon', 'mars'],
    trlLevel: 'TRL 7 · Prototype Demonstration in Space Environment',
    agencyDomain: 'Artemis Gateway & Shackleton Polar Cold-Trap Operations',
    responsibilities: 'Manage lunar descent velocity, PSR shadow power drains, and regolith rock core extraction.',
    unlockedPartsNote: 'Radioisotope Thermoelectric Generators (RTG) · Regolith Core Drill'
  },
  {
    id: 3,
    key: 'interplanetary_officer',
    title: 'Interplanetary Systems Officer',
    shortTitle: 'RANK 03 · INTERPLANETARY',
    icon: '🔴',
    xpRequired: 350,
    unlockedDestinations: ['earth', 'moon', 'mars', 'asteroid'],
    trlLevel: 'TRL 8 · Actual System Completed and Flight Qualified',
    agencyDomain: 'Perseverance Footsteps & Jezero Delta Field Geology',
    responsibilities: 'Execute interplanetary Hohmann transfers, atmospheric drag entry, and dust storm thermal triage.',
    unlockedPartsNote: 'Hall-Effect Ion Propulsion Cluster · Deep-UV Raman Spectrometer'
  },
  {
    id: 4,
    key: 'deep_space_specialist',
    title: 'Deep-Space Dynamics Specialist',
    shortTitle: 'RANK 04 · DYNAMICS SPECIALIST',
    icon: '☄️',
    xpRequired: 650,
    unlockedDestinations: ['earth', 'moon', 'mars', 'asteroid', 'jupiter'],
    trlLevel: 'TRL 8.5 · Prototypical Deep-Space Laser Communication',
    agencyDomain: 'Dawn Protocol & Triaxial Irregular Gravity Navigation',
    responsibilities: 'Conduct HAMO/LAMO orbital transfers, avoid boulder ejecta, and map multi-angle spectral absorption.',
    unlockedPartsNote: 'Reinforced Composite Radiation Shelter · Ka-Band Deep Space Transponder'
  },
  {
    id: 5,
    key: 'flight_director',
    title: 'Outer Planet Flight Director',
    shortTitle: 'RANK 05 · FLIGHT DIRECTOR',
    icon: '🪐',
    xpRequired: 1000,
    unlockedDestinations: ['earth', 'moon', 'mars', 'asteroid', 'jupiter'],
    trlLevel: 'TRL 9 · Mission-Proven in Operational Environment',
    agencyDomain: 'Outer Solar System Flagship Command & Cryovolcanic Discovery',
    responsibilities: 'Mitigate Jovian magnetospheric radiation arcs, manage 43-minute speed-of-light lag, and execute emergency tactical retreats.',
    unlockedPartsNote: 'Nuclear Fission Demonstrator · Heavy Magnetic Deflection Shield'
  }
];

export const CODEX_ENTRIES = [
  {
    id: 'mars_montdenier',
    destId: 'mars',
    planetName: 'MARS',
    sampleName: 'Montdenier Clay Mudstone',
    location: 'Séítah Delta · Jezero Crater',
    instrument: 'PIXL / SHERLOC Deep-UV',
    pdsCitation: 'NASA PDS: M2020-PIXL-0194 / CRISM-TRDR-V3',
    spectralFeature: '2.20 μm & 2.40 μm Clay-Smectite Absorption',
    spectrumPoints: 'M40,50 Q180,40 290,48 Q325,50 342,110 Q355,135 392,52 Q560,42 670,48',
    summary: 'Fine-grained lacustrine sedimentary mudstone rich in phyllosilicates, deposited in a standing body of water 3.5 billion years ago. Primary candidate for preserving biosignatures.',
    scienceSignificance: 'Formed in low-energy lacustrine (lake) conditions favorable for organic compound concentration and preservation on early Mars.',
    keywords: ['montdenier', 'delta', 'mudstone', 'clay', 'jezero delta', 'delta fan']
  },
  {
    id: 'mars_salette',
    destId: 'mars',
    planetName: 'MARS',
    sampleName: 'Salette Olivine Cumulate',
    location: 'South Séítah Unit · Jezero Crater',
    instrument: 'SuperCam LIBS / PIXL',
    pdsCitation: 'NASA PDS: M2020-SUPERCAM-0214',
    spectralFeature: '1.05 μm Fe2+ Crystal Field Absorption',
    spectrumPoints: 'M40,65 Q200,60 450,65 Q485,68 504,118 Q513,142 553,68 L670,66',
    summary: 'Coarse-grained igneous rock composed primarily of magnesium-rich olivine crystals settled from a slowly cooling subsurface magma chamber.',
    scienceSignificance: 'Provides precise radiometric crystallization age constraints for the geologic timescale of Jezero crater and the Isidis basin.',
    keywords: ['salette', 'séítah', 'seitah', 'olivine', 'dunes', 'cumulate']
  },
  {
    id: 'moon_shackleton_ice',
    destId: 'moon',
    planetName: 'MOON',
    sampleName: 'Shackleton Volatile Water Ice',
    location: 'Shackleton Crater Floor (Permanently Shadowed Region)',
    instrument: 'LEND Neutron Detector / Diviner',
    pdsCitation: 'NASA PDS: LRO-L-LEND-4-RDR-V1.0',
    spectralFeature: '1.50 μm & 2.00 μm H2O Absorption Bands',
    spectrumPoints: 'M40,40 Q150,42 220,110 Q260,135 310,45 Q420,40 480,120 Q520,138 580,45 L670,42',
    summary: 'Crystalline and amorphous water ice trapped in lunar polar cold traps at sustained temperatures below 40 Kelvin (-233°C).',
    scienceSignificance: 'Critical resource for Artemis In-Situ Resource Utilization (ISRU) — can be split into hydrogen fuel and oxygen life support for human bases.',
    keywords: ['shackleton', 'water ice', 'volatile', 'ice', 'hydrogen core', 'cryogenic', 'cold-trap']
  },
  {
    id: 'moon_shoemaker_anorthosite',
    destId: 'moon',
    planetName: 'MOON',
    sampleName: 'Shoemaker Anorthosite Regolith',
    location: 'Shoemaker Crater Rim · Lunar South Pole',
    instrument: 'Moon Mineralogy Mapper (M3)',
    pdsCitation: 'NASA PDS: CH1-ORB-L-M3-4-L2',
    spectralFeature: '1.25 μm Plagioclase Feldspar Signature',
    spectrumPoints: 'M40,55 Q200,52 380,50 Q430,85 470,115 Q510,75 580,50 L670,52',
    summary: 'Ancient calcium-rich plagioclase feldspar rock from the primordial lunar magma ocean crust that formed 4.4 billion years ago.',
    scienceSignificance: 'Direct physical evidence for the magma ocean hypothesis, documenting the thermal differentiation of the infant Moon.',
    keywords: ['shoemaker', 'anorthosite', 'crust', 'polar station', 'regolith']
  },
  {
    id: 'vesta_rheasilvia_basalt',
    destId: 'asteroid',
    planetName: 'VESTA',
    sampleName: 'Rheasilvia Basaltic Eucrite',
    location: 'Central Peak · Rheasilvia Impact Basin',
    instrument: 'VIR Spectrometer / Dawn Mission',
    pdsCitation: 'NASA PDS: DAWN-A-VIR-3-RDR-V1.0',
    spectralFeature: '0.90 μm & 1.90 μm Pyroxene Doublet',
    spectrumPoints: 'M40,48 Q160,45 250,112 Q290,130 350,50 Q430,48 510,115 Q550,128 610,48 L670,48',
    summary: 'Pyroxene-rich basaltic crust excavated from the central mound of Vesta’s massive 500-km impact basin.',
    scienceSignificance: 'Proves that asteroid 4 Vesta is an intact differentiated protoplanet with metallic core, silicate mantle, and volcanic crust.',
    keywords: ['rheasilvia', 'basalt', 'eucrite', 'pyroxene', 'impact clast']
  },
  {
    id: 'europa_conamara_brine',
    destId: 'jupiter',
    planetName: 'EUROPA',
    sampleName: 'Conamara Chaos Hydrated Salts',
    location: 'Conamara Chaos Fractured Crust · Europa',
    instrument: 'MISE Spectrometer / Europa Clipper',
    pdsCitation: 'NASA Planetary Science Archive: EC-MISE-SURFACE-V1',
    spectralFeature: '1.40 μm & 1.95 μm Sulfate/Chloride Brine Hydrate',
    spectrumPoints: 'M40,52 Q180,48 280,105 Q320,132 370,52 Q470,50 530,118 Q570,135 630,52 L670,50',
    summary: 'Endogenic hydrated sulfate and magnesium chloride salts deposited along fractures where subsurface liquid water breached the icy crust.',
    scienceSignificance: 'Direct window into the chemistry of Europa’s subsurface liquid ocean, revealing salinity, pH, and astrobiological habitability.',
    keywords: ['conamara', 'chaos', 'brine', 'salts', 'dipole', 'cryoplume', 'vapor']
  },
  {
    id: 'earth_sentinel_telemetry',
    destId: 'earth',
    planetName: 'EARTH',
    sampleName: 'Sentinel Multi-Channel Radiometry',
    location: 'Low Earth Orbit (LEO) Sun-Synchronous Track',
    instrument: 'Sentinel-3 SLSTR / MODIS',
    pdsCitation: 'NASA Earthdata GIBS: MODIS_Aqua_L3m_SST',
    spectralFeature: '11.0 μm & 12.0 μm Thermal Infrared Split-Window',
    spectrumPoints: 'M40,45 Q150,48 300,55 Q350,90 400,120 Q450,85 550,55 L670,46',
    summary: 'Precision sea surface radiometric temperatures and atmospheric aerosol optical depth telemetry tracking global ocean currents.',
    scienceSignificance: 'Quantifies Earth’s energy imbalance, thermohaline circulation velocity, and global ocean heat storage rates.',
    keywords: ['sentinel', 'radiometry', 'telemetry', 'altimetry', 'ocean color', 'lidar']
  }
];

export const TECH_TREE = [
  // 1. Propulsion & Astrodynamics
  {
    id: 'prop_ion_grid',
    branch: 'propulsion',
    name: 'Xenon Hall-Effect Thruster Array',
    trl: 'TRL 6',
    cost: 50,
    prerequisite: null,
    icon: '⚡',
    description: 'High-efficiency electrostatic ion propulsion optimizing interplanetary transfers.',
    effectLabel: '+10% propellant specific impulse & transfer efficiency',
    modifiers: { efficiency: 1.10 }
  },
  {
    id: 'prop_aerocapture',
    branch: 'propulsion',
    name: 'Carbon-Phenolic Aerocapture Heatshield',
    trl: 'TRL 7',
    cost: 120,
    prerequisite: 'prop_ion_grid',
    icon: '🛡️',
    description: 'Woven carbon-phenolic tiles mitigating atmospheric drag during hyperbolic planetary capture.',
    effectLabel: '+25% atmospheric drag heat mitigation & wider safe AoA margin',
    modifiers: { heatDissipation: 1.25, maxSafeAoABonus: 2.5 }
  },
  {
    id: 'prop_vasimr',
    branch: 'propulsion',
    name: 'VASIMR Magnetoplasma Engine',
    trl: 'TRL 8',
    cost: 250,
    prerequisite: 'prop_aerocapture',
    icon: '🚀',
    description: 'Radio-frequency plasma heating delivering variable thrust for rapid interplanetary cruise.',
    effectLabel: '+20% cruising thrust & maneuvering response',
    modifiers: { thrust: 1.20, handling: 1.15 }
  },

  // 2. Power & Cryogenic Thermals
  {
    id: 'power_rtg_thermocouple',
    branch: 'power',
    name: 'Next-Gen MMRTG Thermocouples',
    trl: 'TRL 6',
    cost: 50,
    prerequisite: null,
    icon: '☢️',
    description: 'Silicon-germanium thermopiles converting plutonium-238 decay heat to continuous electricity.',
    effectLabel: '+0.025 kW baseline power in total crater shadow',
    modifiers: { shadowPowerBonus: 0.025 }
  },
  {
    id: 'power_cryo_pipes',
    branch: 'power',
    name: 'Loop Heat Pipe Cryogenic Bus',
    trl: 'TRL 7',
    cost: 120,
    prerequisite: 'power_rtg_thermocouple',
    icon: '❄️',
    description: 'Two-phase capillary evaporator loop transporting heat across shadowed lunar/Martian terrain.',
    effectLabel: '+20% radiator thermal cooling & freeze mitigation',
    modifiers: { cooling: 1.20 }
  },
  {
    id: 'power_kilopower',
    branch: 'power',
    name: 'Kilopower Stirling Fission Reactor',
    trl: 'TRL 8',
    cost: 250,
    prerequisite: 'power_cryo_pipes',
    icon: '⚛️',
    description: 'Compact uranium-235 fission core delivering uninterrupted megawatt-class surface energy.',
    effectLabel: '+30% battery buffer & immunity to storm dust power loss',
    modifiers: { batteryCapacity: 1.30, dustImmunity: 0.50 }
  },

  // 3. Planetary Science Instrumentation
  {
    id: 'sci_raman_laser',
    branch: 'science',
    name: 'Time-Resolved Raman Laser Altimeter',
    trl: 'TRL 6',
    cost: 50,
    prerequisite: null,
    icon: '🔬',
    description: 'Pulsed ultraviolet laser exciting Raman vibrational modes in organic minerals.',
    effectLabel: '+15% scientific sample discovery & evaluation yield',
    modifiers: { yield: 1.15 }
  },
  {
    id: 'sci_rimfax_radar',
    branch: 'science',
    name: 'RIMFAX Subsurface Permittivity Radar',
    trl: 'TRL 7',
    cost: 120,
    prerequisite: 'sci_raman_laser',
    icon: '📡',
    description: 'Frequency-modulated ground penetrating radar probing sub-surface stratigraphy to 10m depth.',
    effectLabel: '+35m active LIDAR sonar ping detection range',
    modifiers: { lidarRangeBonus: 35 }
  },
  {
    id: 'sci_deep_uv',
    branch: 'science',
    name: 'Deep-UV Native Fluorescence Biosensor',
    trl: 'TRL 8',
    cost: 250,
    prerequisite: 'sci_rimfax_radar',
    icon: '🧬',
    description: 'Sub-nanometer fluorescence spectrometry mapping aromatic organic rings and biosignatures.',
    effectLabel: '+25% rock core sample science yield',
    modifiers: { yield: 1.25, recovery: 1.20 }
  },

  // 4. Avionics, Optical Comms & Autonomous FDIR
  {
    id: 'av_optical_nav',
    branch: 'avionics',
    name: 'Autonomous Optical Terrain Nav (OpNav)',
    trl: 'TRL 6',
    cost: 50,
    prerequisite: null,
    icon: '🎯',
    description: 'Real-time crater pattern matching for sub-meter descent guidance and docking alignment.',
    effectLabel: '+20% docking capture alignment window & softer capture gate',
    modifiers: { dockingTolerance: 1.20 }
  },
  {
    id: 'av_laser_comms',
    branch: 'avionics',
    name: 'Deep Space Optical Communications (DSOC)',
    trl: 'TRL 7',
    cost: 120,
    prerequisite: 'av_optical_nav',
    icon: '📶',
    description: 'Near-infrared 1550nm laser transceiver achieving 100x high-rate downlink bandwidth.',
    effectLabel: '+30% DSN link margin & reduced downlink delays',
    modifiers: { link: 1.30 }
  },
  {
    id: 'av_neural_fdir',
    branch: 'avionics',
    name: 'Neural Fault Detection & Isolation (FDIR)',
    trl: 'TRL 8',
    cost: 250,
    prerequisite: 'av_laser_comms',
    icon: '🧠',
    description: 'Radiation-hardened neuromorphic controller isolating damaged subsystems in milliseconds.',
    effectLabel: '+25% collision and solar storm damage mitigation',
    modifiers: { armor: 0.75 }
  }
];

const STORAGE_KEY = 'odyssey-career-v2';

export class CareerEngine {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved.xp === 'number') {
        return {
          xp: saved.xp || 0,
          spentXp: saved.spentXp || 0,
          rankId: saved.rankId || 1,
          unlockedDestinations: Array.isArray(saved.unlockedDestinations) && saved.unlockedDestinations.length > 0 ? saved.unlockedDestinations : ['earth', 'moon'],
          unlockedTechs: Array.isArray(saved.unlockedTechs) ? saved.unlockedTechs : [],
          activeOfficerId: saved.activeOfficerId || 'flight',
          collectedCodex: Array.isArray(saved.collectedCodex) ? saved.collectedCodex : [],
          accomplishments: Array.isArray(saved.accomplishments) ? saved.accomplishments : [],
          evaluatorMode: !!saved.evaluatorMode,
          totalFlights: saved.totalFlights || 0,
          successfulExpeditions: saved.successfulExpeditions || 0
        };
      }
    } catch {}

    return {
      xp: 0,
      spentXp: 0,
      rankId: 1,
      unlockedDestinations: ['earth', 'moon'],
      unlockedTechs: [],
      activeOfficerId: 'flight',
      collectedCodex: [],
      accomplishments: [],
      evaluatorMode: false,
      totalFlights: 0,
      successfulExpeditions: 0
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
  }

  getCurrentRank() {
    return RANKS.find(r => r.id === this.data.rankId) || RANKS[0];
  }

  getNextRank() {
    const current = this.getCurrentRank();
    return RANKS.find(r => r.id === current.id + 1) || null;
  }

  calculateRank() {
    let earnedRank = RANKS[0];
    for (const r of RANKS) {
      if (this.data.xp >= r.xpRequired) {
        earnedRank = r;
      }
    }
    return earnedRank;
  }

  isDestinationUnlocked(destId) {
    if (this.data.evaluatorMode) return true;
    const rank = this.getCurrentRank();
    return rank.unlockedDestinations.includes(destId) || this.data.unlockedDestinations.includes(destId);
  }

  getRequiredRankForDestination(destId) {
    for (const r of RANKS) {
      if (r.unlockedDestinations.includes(destId)) return r;
    }
    return RANKS[0];
  }

  setEvaluatorMode(enable) {
    this.data.evaluatorMode = !!enable;
    if (enable) {
      this.data.unlockedDestinations = ['earth', 'moon', 'mars', 'asteroid', 'jupiter'];
    } else {
      const unlocked = new Set(['earth', 'moon']);
      for (const r of RANKS) {
        if (this.data.rankId >= r.id) {
          r.unlockedDestinations.forEach(d => unlocked.add(d));
        }
      }
      this.data.unlockedDestinations = Array.from(unlocked);
    }
    this.save();
  }

  resetCareer() {
    this.data = {
      xp: 0,
      spentXp: 0,
      rankId: 1,
      unlockedDestinations: ['earth', 'moon'],
      unlockedTechs: [],
      activeOfficerId: 'flight',
      collectedCodex: [],
      accomplishments: [],
      evaluatorMode: false,
      totalFlights: 0,
      successfulExpeditions: 0
    };
    this.save();
    return this.data;
  }

  getResearchPoints() {
    return Math.max(0, (this.data.xp || 0) - (this.data.spentXp || 0));
  }

  getActiveOfficer() {
    const id = this.data.activeOfficerId || 'flight';
    return CREW_ROLES.find(r => r.id === id) || CREW_ROLES[0];
  }

  setActiveOfficer(officerId) {
    const found = CREW_ROLES.find(r => r.id === officerId);
    if (found) {
      this.data.activeOfficerId = found.id;
      this.save();
      return found;
    }
    return this.getActiveOfficer();
  }

  isTechUnlocked(techId) {
    if (this.data.evaluatorMode) return true;
    return Array.isArray(this.data.unlockedTechs) && this.data.unlockedTechs.includes(techId);
  }

  canUnlockTech(techId) {
    if (this.isTechUnlocked(techId)) return false;
    const node = TECH_TREE.find(t => t.id === techId);
    if (!node) return false;
    if (node.prerequisite && !this.isTechUnlocked(node.prerequisite)) return false;
    return this.getResearchPoints() >= node.cost;
  }

  unlockTech(techId) {
    if (this.isTechUnlocked(techId) && !this.data.evaluatorMode) return false;
    const node = TECH_TREE.find(t => t.id === techId);
    if (!node) return false;

    if (!this.data.evaluatorMode) {
      if (node.prerequisite && !this.isTechUnlocked(node.prerequisite)) return false;
      if (this.getResearchPoints() < node.cost) return false;
      this.data.spentXp = (this.data.spentXp || 0) + node.cost;
    }

    if (!this.data.unlockedTechs.includes(techId)) {
      this.data.unlockedTechs.push(techId);
    }
    this.save();
    return true;
  }

  getTechTreeModifiers() {
    const mods = {};
    for (const node of TECH_TREE) {
      if (this.isTechUnlocked(node.id) && node.modifiers) {
        for (const [k, v] of Object.entries(node.modifiers)) {
          if (k.endsWith('Bonus')) {
            mods[k] = (mods[k] || 0) + v;
          } else if (typeof v === 'number') {
            mods[k] = (mods[k] ?? 1.0) * v;
          } else {
            mods[k] = v;
          }
        }
      }
    }
    return mods;
  }

  getCombinedModifiers() {
    const officer = this.getActiveOfficer();
    const officerMods = officer.perkModifiers || {};
    const techMods = this.getTechTreeModifiers();

    const combined = { ...officerMods };
    for (const [k, v] of Object.entries(techMods)) {
      if (k.endsWith('Bonus')) {
        combined[k] = (combined[k] || 0) + v;
      } else if (typeof v === 'number' && typeof combined[k] === 'number') {
        combined[k] = Number((combined[k] * v).toFixed(3));
      } else {
        combined[k] = v;
      }
    }
    return combined;
  }

  addSciencePoints(pts, destId, isSuccess, sampleName = null) {
    const prevRank = this.getCurrentRank();
    this.data.totalFlights += 1;
    if (isSuccess) this.data.successfulExpeditions += 1;
    this.data.xp += Math.max(0, Math.round(pts || 0));

    // Update rank
    const newRank = this.calculateRank();
    const rankedUp = newRank.id > prevRank.id;
    this.data.rankId = newRank.id;

    // Merge unlocked destinations from rank
    newRank.unlockedDestinations.forEach(d => {
      if (!this.data.unlockedDestinations.includes(d)) {
        this.data.unlockedDestinations.push(d);
      }
    });

    // Record sample in codex if matches
    let newlyUnlockedCodex = null;
    if (sampleName) {
      const lower = sampleName.toLowerCase();
      const match = CODEX_ENTRIES.find(c => {
        if (c.sampleName.toLowerCase().includes(lower) || lower.includes(c.sampleName.toLowerCase())) return true;
        if (Array.isArray(c.keywords) && c.keywords.some(k => lower.includes(k.toLowerCase()))) return true;
        return false;
      });
      if (match && !this.data.collectedCodex.includes(match.id)) {
        this.data.collectedCodex.push(match.id);
        newlyUnlockedCodex = match;
      }
    }
    // Auto-discover default codex entries for visited planet upon successful expedition completion
    if (isSuccess && destId) {
      CODEX_ENTRIES.filter(c => c.destId === destId).forEach(c => {
        if (!this.data.collectedCodex.includes(c.id)) {
          this.data.collectedCodex.push(c.id);
        }
      });
    }

    this.save();
    return { rankedUp, prevRank, newRank, totalXp: this.data.xp, newlyUnlockedCodex };
  }

  getCodexEntries() {
    return CODEX_ENTRIES.map(entry => ({
      ...entry,
      unlocked: this.data.collectedCodex.includes(entry.id) || this.data.evaluatorMode
    }));
  }
}

export const career = new CareerEngine();
