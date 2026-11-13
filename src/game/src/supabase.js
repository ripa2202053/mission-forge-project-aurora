/**
 * PROJECT AURORA
 * Official Supabase Cloud Persistence & Global Mission Leaderboard Client
 * Connected to Project: Mahbub0001's Project (ref: ngtyysbsfvowtbrqamti)
 */

export const SUPABASE_URL = 'https://ngtyysbsfvowtbrqamti.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHl5c2JzZnZvd3RicnFhbXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODAxMTEsImV4cCI6MjA5NTQ1NjExMX0.NNRgmbOH0YdzemvnfaLV14duA05pqaAu99Wz1JMVFdM';

// Local mock cache in case of network interruption or offline flight
const LOCAL_LEADERBOARD_KEY = 'aurora_local_leaderboard';

function getLocalLeaderboard(destination = null) {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!destination || destination === 'all') return list;
    return list.filter(item => item.destination === destination);
  } catch (_) {
    return [];
  }
}

function saveLocalScore(entry) {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (_) {}
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation'
};

/**
 * Fetch top mission scores from Supabase
 * @param {string} destination - 'mars', 'moon', 'earth', 'vesta', 'jupiter' or 'all'
 * @param {number} limit - maximum records (default: 10)
 */
export async function fetchLeaderboard(destination = 'all', limit = 10) {
  try {
    const destFilter = (destination && destination !== 'all') ? `&destination=eq.${encodeURIComponent(destination)}` : '';
    const url = `${SUPABASE_URL}/rest/v1/leaderboard?select=*${destFilter}&order=score.desc&limit=${limit}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!res.ok) {
      throw new Error(`Supabase query status ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[Supabase] Falling back to local offline leaderboard:', err.message);
    return getLocalLeaderboard(destination);
  }
}

/**
 * Submit a completed expedition score to Supabase
 */
export async function submitScore({
  playerName = 'Commander Alex',
  callsign = 'Odyssey-07',
  destination = 'mars',
  score = 0,
  rankTitle = 'Cadet Flight Controller',
  days = 0,
  deltaV = 0,
  scienceCollected = 0,
  flawlessLanding = false,
  metadata = {}
}) {
  const record = {
    player_name: playerName || 'Commander Alex',
    callsign: callsign || 'Odyssey-07',
    destination: destination || 'mars',
    score: Math.max(0, Math.round(score)),
    rank_title: rankTitle,
    days: Math.round(days || 0),
    delta_v: Number(Number(deltaV || 0).toFixed(2)),
    science_collected: Math.round(scienceCollected || 0),
    flawless_landing: Boolean(flawlessLanding),
    metadata: metadata || {}
  };

  // Always save locally first for guaranteed resilience
  saveLocalScore({ ...record, created_at: new Date().toISOString() });

  try {
    const url = `${SUPABASE_URL}/rest/v1/leaderboard`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(record),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Supabase insert status ${res.status}`);
    }
    const result = await res.json();
    return { success: true, cloud: true, data: result[0] || record };
  } catch (err) {
    console.warn('[Supabase] Offline mode saved score locally:', err.message);
    return { success: true, cloud: false, data: record, error: err.message };
  }
}

/**
 * Check connectivity to Supabase
 */
export async function checkSupabaseConnection() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?select=count`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

/**
 * Multi-Crew Cloud Room Real-Time Synchronization
 */

export async function syncCloudRoom({
  roomCode,
  hostName,
  hostRole,
  roster,
  activeSegmentRole = 'flight',
  activeSegmentTitle = '',
  pollVotes = {},
  status = 'lobby'
}) {
  if (!roomCode) return null;
  const cleanCode = roomCode.trim().toUpperCase();
  const payload = {
    room_code: cleanCode,
    host_name: hostName || 'Commander Alex',
    host_role: hostRole || 'flight',
    roster: roster || [],
    active_segment_role: activeSegmentRole,
    active_segment_title: activeSegmentTitle,
    poll_votes: pollVotes || {},
    status: status || 'lobby',
    updated_at: new Date().toISOString()
  };

  try {
    const url = `${SUPABASE_URL}/rest/v1/crew_rooms?on_conflict=room_code`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Cloud room sync status ${res.status}`);
    }
    const data = await res.json();
    return data && data.length > 0 ? data[0] : payload;
  } catch (err) {
    console.warn('[Supabase Cloud Room] Offline fallback:', err.message);
    return null;
  }
}

export async function fetchCloudRoom(roomCode) {
  if (!roomCode) return null;
  const cleanCode = roomCode.trim().toUpperCase();

  try {
    const url = `${SUPABASE_URL}/rest/v1/crew_rooms?room_code=eq.${encodeURIComponent(cleanCode)}&select=*`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.warn('[Supabase Cloud Room] Fetch error:', err.message);
    return null;
  }
}

export async function deleteCloudRoom(roomCode) {
  if (!roomCode) return false;
  const cleanCode = roomCode.trim().toUpperCase();

  try {
    const url = `${SUPABASE_URL}/rest/v1/crew_rooms?room_code=eq.${encodeURIComponent(cleanCode)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch(url, {
      method: 'DELETE',
      headers: DEFAULT_HEADERS,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return true;
  } catch (_) {
    return false;
  }
}
