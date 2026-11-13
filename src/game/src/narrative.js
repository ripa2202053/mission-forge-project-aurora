/**
 * PROJECT AURORA
 * NASA Space Apps Challenge 2026
 * Narrative & Apollo/Artemis Radio Comms Engine
 * Story Arc: "The Lost Telemetry of Odyssey"
 */

export const NARRATIVE_CAST = {
  imani: {
    id: 'imani',
    name: 'Dr. Imani Vance',
    callsign: 'HOUSTON · FLIGHT DIRECTOR',
    badge: 'FD',
    channel: 'CH 424.15 MHz',
    voicePitch: 0.95,
    voiceRate: 1.0,
    color: '#00f0ff'
  },
  reyes: {
    id: 'reyes',
    name: 'Chief Marcus Reyes',
    callsign: 'PROPULSION & SYSTEMS',
    badge: 'ENG',
    channel: 'CH 424.80 MHz',
    voicePitch: 0.85,
    voiceRate: 1.12,
    color: '#ffb700'
  },
  sen: {
    id: 'sen',
    name: 'Dr. Aris Sen',
    callsign: 'PDS ASTROBIOLOGY LEAD',
    badge: 'SCI',
    channel: 'CH 425.20 MHz',
    voicePitch: 1.1,
    voiceRate: 1.05,
    color: '#39ff14'
  },
  capcom: {
    id: 'capcom',
    name: 'CAPCOM Ground Station',
    callsign: 'CAPE CANAVERAL · CAPCOM',
    badge: 'CC',
    channel: 'CH 420.00 MHz',
    voicePitch: 1.0,
    voiceRate: 1.0,
    color: '#00d2ff'
  }
};

export const STORY_BEATS = {
  BOOT_HERO: {
    id: 'BOOT_HERO',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'Aurora-07, this is Houston Flight Director. Precursor station Odyssey-01 has gone dark in Jezero Crater after transmitting a deep subterranean telemetry spike. Assemble your spacecraft and bring their science package home.',
    objective: 'Assemble deep-space spacecraft and initiate launch.',
    delayMs: 200
  },
  DESTINATION_CHANGE: {
    id: 'DESTINATION_CHANGE',
    speaker: NARRATIVE_CAST.sen,
    priority: 'STANDARD',
    message: 'Orbital trajectory locked. Planetary Data System sensors show ancient clay delta mudstones and carbonate deposits waiting along this vector.',
    delayMs: 150
  },
  HANGAR_PART_ION: {
    id: 'HANGAR_PART_ION',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'STANDARD',
    message: 'Ion Drive integration verified. We have high specific impulse for deep cruise, Commander, but remember—our low thrust-to-weight ratio requires early burn lead time.',
    delayMs: 100
  },
  HANGAR_PART_SHIELD: {
    id: 'HANGAR_PART_SHIELD',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'STANDARD',
    message: 'Superconducting magnetic shield locked to hull bus. If solar weather flares up along the heliocentric corridor, keep your capacitor bank charged.',
    delayMs: 100
  },
  LAUNCH_COUNTDOWN: {
    id: 'LAUNCH_COUNTDOWN',
    speaker: NARRATIVE_CAST.capcom,
    priority: 'CRITICAL',
    message: 'T-minus 10 seconds. Guidance internal. 3... 2... 1... Main engine ignition! Liftoff of Aurora-07! Tower cleared, telemetry is nominal.',
    delayMs: 0
  },
  TRANSIT_CRUISE: {
    id: 'TRANSIT_CRUISE',
    speaker: NARRATIVE_CAST.sen,
    priority: 'STANDARD',
    message: 'JPL Horizons orbital solution verified. We are coasting along the heliocentric Hohmann ellipse. Deep space background radiation is steady, but keep eyes on the solar wind monitor.',
    delayMs: 500
  },
  CME_STORM_ALERT: {
    id: 'CME_STORM_ALERT',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'CRITICAL',
    message: 'WARNING! Severe Coronal Mass Ejection detected on solar monitor! Divert emergency power to the magnetic shield before ionizing proton flux fries our guidance core!',
    delayMs: 50
  },
  RETRO_CAPTURE_BURN: {
    id: 'RETRO_CAPTURE_BURN',
    speaker: NARRATIVE_CAST.reyes,
    priority: 'CRITICAL',
    message: 'Target orbital intercept reached! Prepare for 1.4 km/s retrograde capture burn. Burn throttle on my mark... NOW!',
    delayMs: 100
  },
  ATMOSPHERIC_ENTRY: {
    id: 'ATMOSPHERIC_ENTRY',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'Aurora-07, entry interface in 30 seconds. Atmospheric friction will cause complete ionization blackout for the next 3 minutes. Welcome to the Seven Minutes of Terror. Godspeed.',
    delayMs: 200
  },
  SURFACE_TOUCHDOWN: {
    id: 'SURFACE_TOUCHDOWN',
    speaker: NARRATIVE_CAST.imani,
    priority: 'CRITICAL',
    message: 'TOUCHDOWN CONFIRMED! Houston copies telemetry! Aurora-07 is intact on the surface of Jezero Crater! Deploying Perseverance rover and Ingenuity scout drone now.',
    delayMs: 150
  },
  BEACON_LOCATED: {
    id: 'BEACON_LOCATED',
    speaker: NARRATIVE_CAST.sen,
    priority: 'CRITICAL',
    message: 'EUREKA! Rover spectro-scanner locked onto Odyssey-01 emergency beacon! PDS Level-3 telemetry recovered: ancient hydrated clay carbonates and high-probability organic biogenic markers confirmed!',
    delayMs: 100
  }
};

export class NarrativeDirector {
  constructor(options = {}) {
    this.audio = options.audio || null;
    this.onTransmission = options.onTransmission || (() => {});
    this.onTransmissionEnd = options.onTransmissionEnd || (() => {});
    this.history = [];
    this.triggeredBeats = new Set();
    this.queue = [];
    this.isTransmitting = false;
    this.voiceEnabled = options.voiceEnabled ?? true;
  }

  triggerBeat(beatId, customData = {}) {
    const beat = STORY_BEATS[beatId];
    if (!beat) return false;
    if (this.triggeredBeats.has(beatId)) return false;

    this.triggeredBeats.add(beatId);
    const transmission = {
      ...beat,
      ...customData,
      timestamp: Date.now()
    };

    this.enqueue(transmission);
    return true;
  }

  enqueue(transmission) {
    if (transmission.priority === 'CRITICAL') {
      this.queue.unshift(transmission);
    } else {
      this.queue.push(transmission);
    }
    this.processQueue();
  }

  async processQueue() {
    if (this.isTransmitting || this.queue.length === 0) return;
    this.isTransmitting = true;
    const item = this.queue.shift();

    if (item.delayMs > 0) {
      await new Promise(r => setTimeout(r, item.delayMs));
    }

    // Play Quindar start beep & radio noise if available
    if (this.audio?.playQuindarTone) {
      try {
        await this.audio.playQuindarTone(true);
      } catch (_) {}
    }
    if (this.audio?.playRadioStatic) {
      try {
        await this.audio.playRadioStatic(160);
      } catch (_) {}
    }

    this.history.push(item);
    this.onTransmission(item);

    // Audio Voice Speech Synthesis if in browser and enabled
    if (this.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && !this.audio?.muted) {
      try {
        const utterance = new window.SpeechSynthesisUtterance(item.message);
        utterance.pitch = item.speaker?.voicePitch || 1.0;
        utterance.rate = item.speaker?.voiceRate || 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        await new Promise(resolve => {
          utterance.onend = resolve;
          utterance.onerror = resolve;
          setTimeout(resolve, 6000);
        });
      } catch (_) {}
    } else {
      // In tests or headless, wait for a short duration
      const simulatedDuration = typeof window === 'undefined' ? 30 : Math.min(4500, Math.max(1800, item.message.length * 35));
      await new Promise(r => setTimeout(r, simulatedDuration));
    }

    // Play Quindar end beep
    if (this.audio?.playQuindarTone) {
      try {
        await this.audio.playQuindarTone(false);
      } catch (_) {}
    }

    this.onTransmissionEnd(item);
    this.isTransmitting = false;

    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 400);
    }
  }

  reset() {
    this.triggeredBeats.clear();
    this.queue = [];
    this.isTransmitting = false;
  }
}
