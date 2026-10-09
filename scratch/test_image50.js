const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9275;
const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7c2115e4-f5e4-4377-8f97-4580f398b460';

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Debrief Cylinder Ring Carousel (Image 50 Style)</title>
  <style>
    body {
      margin: 0;
      background: radial-gradient(circle at center, #040d1e 0%, #020617 100%);
      color: #cbd5e1;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
    }

    .debrief-modal-wrapper {
      width: min(1380px, 96vw);
      height: min(800px, 94vh);
      background: linear-gradient(135deg, rgba(4, 13, 30, 0.95), rgba(2, 6, 23, 0.98));
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 20px;
      box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 229, 255, 0.18);
      display: flex;
      flex-direction: column;
      padding: 24px 36px;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }

    .debrief-modal-wrapper::before {
      content: '';
      position: absolute;
      top: 0;
      left: 10%;
      right: 10%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00e5ff 35%, #00e5ff 65%, transparent);
      box-shadow: 0 0 15px #00e5ff;
    }

    /* Top Score Banner */
    .debrief-top-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      padding-bottom: 16px;
      margin-bottom: 8px;
    }

    .banner-left .banner-kicker {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.2em;
      color: #7dd3fc;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }

    .banner-left h2 {
      font-family: 'Rajdhani', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.05em;
      margin: 0;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
    }

    .banner-score-box {
      display: flex;
      align-items: center;
      gap: 24px;
      background: rgba(4, 13, 30, 0.8);
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 12px;
      padding: 10px 24px;
      box-shadow: inset 0 0 20px rgba(0, 229, 255, 0.1), 0 0 25px rgba(0, 229, 255, 0.25);
    }

    .score-metric { text-align: right; }
    .score-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.16em;
      color: #7dd3fc;
      display: block;
      margin-bottom: 2px;
    }

    .score-num {
      font-family: 'Rajdhani', sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: #00e5ff;
      line-height: 1;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.85);
      display: block;
    }

    .score-num small {
      font-size: 14px;
      font-family: 'IBM Plex Mono', monospace;
      color: #7dd3fc;
      letter-spacing: 0.1em;
      margin-left: 4px;
    }

    .grade-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-left: 1px solid rgba(0, 229, 255, 0.25);
      padding-left: 20px;
    }

    .grade-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.16em;
      color: #7dd3fc;
      margin-bottom: 2px;
    }

    .grade-badge {
      font-family: 'Rajdhani', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 0 20px #00e5ff, 0 0 40px #00e5ff;
    }

    /* 3D Cylindrical Ring Carousel Stage */
    .debrief-carousel-viewport {
      perspective: 1200px;
      perspective-origin: 50% 50%;
      width: 100%;
      height: 530px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: visible;
      user-select: none;
      margin: auto 0;
    }

    .debrief-carousel-ring {
      position: relative;
      width: 320px;
      height: 480px;
      transform-style: preserve-3d;
    }

    /* Navigation Chevrons */
    .carousel-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 52px;
      height: 52px;
      background: rgba(4, 13, 30, 0.75);
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 50%;
      color: #00e5ff;
      font-size: 26px;
      display: grid;
      place-items: center;
      cursor: pointer;
      z-index: 50;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.7), inset 0 0 10px rgba(0, 229, 255, 0.15);
      transition: all 0.25s ease;
    }

    .carousel-nav-btn:hover {
      background: rgba(0, 229, 255, 0.15);
      border-color: #00e5ff;
      color: #ffffff;
      box-shadow: 0 0 30px rgba(0, 229, 255, 0.6);
      transform: translateY(-50%) scale(1.08);
    }

    .carousel-nav-btn.prev { left: 40px; }
    .carousel-nav-btn.next { right: 40px; }

    /* Debrief Card Styling */
    .carousel-card {
      position: absolute;
      top: 0;
      left: 0;
      width: 320px;
      height: 480px;
      border-radius: 18px;
      background: rgba(4, 13, 30, 0.88);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(0, 229, 255, 0.22);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 229, 255, 0.08);
      padding: 24px 22px;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      will-change: transform, opacity;
    }

    .carousel-card.active {
      opacity: 1 !important;
      border-color: #00e5ff !important;
      box-shadow: 0 0 35px rgba(0, 229, 255, 0.45), 0 20px 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(0, 229, 255, 0.15) !important;
    }

    /* Card Header */
    .card-topline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .card-pill-tag {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.35);
      color: #00e5ff;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.1em;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .card-corner-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00e5ff;
      box-shadow: 0 0 10px #00e5ff;
    }

    .card-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 4px 0 2px 0;
      letter-spacing: 0.04em;
    }

    .card-subtitle {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9.5px;
      letter-spacing: 0.14em;
      color: #7dd3fc;
      text-transform: uppercase;
      margin-bottom: 16px;
      display: block;
    }

    /* Card Metric Rows */
    .card-metric-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .card-metric-row {
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(0, 229, 255, 0.15);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-metric-row .metric-label {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9.5px;
      color: #94a3b8;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .card-metric-row .metric-val {
      font-family: 'Rajdhani', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
    }

    .card-metric-row .metric-val.highlight {
      color: #00e5ff;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.6);
    }

    .card-metric-row .metric-val.warning {
      color: #f87171;
    }

    .card-desc-box {
      background: rgba(2, 6, 23, 0.5);
      border: 1px solid rgba(0, 229, 255, 0.12);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 11px;
      line-height: 1.5;
      color: #cbd5e1;
      margin-top: 8px;
    }

    .cyber-link {
      color: #00e5ff;
      text-decoration: none;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 9.5px;
      letter-spacing: 0.1em;
      margin-top: 10px;
      display: inline-block;
      transition: all 0.2s ease;
    }

    .cyber-link:hover {
      text-shadow: 0 0 12px #00e5ff;
      color: #ffffff;
    }

    /* Card Action Buttons */
    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: auto;
    }

    .card-actions button {
      width: 100%;
      padding: 10px;
      font-size: 11px;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: all 0.2s ease;
    }

    .btn-action-primary {
      background: linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%);
      border: 1px solid #38f8ff;
      color: #020611;
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
    }

    .btn-action-primary:hover {
      background: linear-gradient(135deg, #38f8ff 0%, #00d4ff 100%);
      box-shadow: 0 0 30px rgba(0, 229, 255, 0.8);
      transform: translateY(-1px);
    }

    .btn-action-outline {
      background: rgba(4, 13, 30, 0.8);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: #7dd3fc;
    }

    .btn-action-outline:hover {
      border-color: #00e5ff;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
    }

    /* Bottom Status & Indicators */
    .debrief-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(0, 229, 255, 0.15);
      padding-top: 14px;
      margin-top: 6px;
    }

    .carousel-indicators {
      display: flex;
      gap: 10px;
    }

    .indicator-dot {
      width: 24px;
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 229, 255, 0.2);
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .indicator-dot.active {
      width: 48px;
      background: #00e5ff;
      box-shadow: 0 0 12px #00e5ff;
    }

    .debrief-quick-actions {
      display: flex;
      gap: 12px;
    }

    .primary-button {
      background: linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%);
      border: 1px solid #38f8ff;
      border-radius: 6px;
      color: #020611;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      font-size: 13.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 10px 22px;
      box-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
      cursor: pointer;
    }

    .outline-button {
      background: rgba(4, 13, 30, 0.8);
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 6px;
      color: #7dd3fc;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 10px 18px;
      cursor: pointer;
    }
  </style>
</head>
<body>

<div class="debrief-modal-wrapper">
  <!-- Top Score & Grade Banner -->
  <div class="debrief-top-banner">
    <div class="banner-left">
      <span class="banner-kicker">MISSION DEBRIEF • PROJECT AURORA</span>
      <h2>EXPEDITION COMPLETE • MARS</h2>
    </div>
    <div class="banner-score-box">
      <div class="score-metric">
        <span class="score-label">TOTAL SCORE</span>
        <strong class="score-num">8,450 <small>PTS</small></strong>
      </div>
      <div class="grade-pill">
        <span class="grade-label">GRADE</span>
        <b class="grade-badge">A+</b>
      </div>
    </div>
  </div>

  <!-- 3D Cylindrical Ring Carousel Stage -->
  <div class="debrief-carousel-viewport" id="carouselViewport">
    <button class="carousel-nav-btn prev" id="btnPrev" aria-label="Previous card">‹</button>
    <button class="carousel-nav-btn next" id="btnNext" aria-label="Next card">›</button>

    <div class="debrief-carousel-ring" id="carouselRing">
      <!-- Card 1: MISSION TELEMETRY -->
      <div class="carousel-card active" data-index="0">
        <div class="card-topline">
          <span class="card-pill-tag">01 • TELEMETRY</span>
          <span class="card-corner-status"></span>
        </div>
        <h3 class="card-title">MISSION TELEMETRY</h3>
        <span class="card-subtitle">FLIGHT TRAJECTORY & METRICS</span>
        <div class="card-metric-list">
          <div class="card-metric-row">
            <span class="metric-label">Destination</span>
            <span class="metric-val">MARS EXPEDITION</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Trajectory Accuracy</span>
            <span class="metric-val highlight">92.5% OPTIMAL</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Flight Time</span>
            <span class="metric-val">05:42</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Propellant Efficiency</span>
            <span class="metric-val highlight">88% REMAINING</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Science Return</span>
            <span class="metric-val highlight">240 POINTS</span>
          </div>
        </div>
        <div class="card-desc-box">
          Transfer burn nominal. Spacecraft achieved capture corridor with high delta-V margin.
        </div>
      </div>

      <!-- Card 2: PERFORMANCE GAPS & ISSUES -->
      <div class="carousel-card" data-index="1">
        <div class="card-topline">
          <span class="card-pill-tag">02 • DIAGNOSTICS</span>
          <span class="card-corner-status" style="background:#f87171; box-shadow:0 0 10px #f87171;"></span>
        </div>
        <h3 class="card-title">PERFORMANCE GAPS</h3>
        <span class="card-subtitle">ANOMALIES & DIVERGENCE</span>
        <div class="card-metric-list">
          <div class="card-metric-row">
            <span class="metric-label">Drag / Maneuver Penalty</span>
            <span class="metric-val warning">+4.2% CONSUMPTION</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Energy Bus Fluctuation</span>
            <span class="metric-val warning">−8% TRANSIENT DROP</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Thruster Alignment</span>
            <span class="metric-val">0.3° VECTOR DRIFT</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Impacts Sustained</span>
            <span class="metric-val warning">1 COLLISION</span>
          </div>
        </div>
        <div class="card-desc-box">
          Micrometeoroid encounter triggered momentary guidance recalibration during Chapter 02.
        </div>
      </div>

      <!-- Card 3: LEARNINGS & AEROSPACE INSIGHTS -->
      <div class="carousel-card" data-index="2">
        <div class="card-topline">
          <span class="card-pill-tag">03 • NASA SCIENCE</span>
          <span class="card-corner-status"></span>
        </div>
        <h3 class="card-title">AEROSPACE INSIGHTS</h3>
        <span class="card-subtitle">PROPULSION & ORBITAL LAWS</span>
        <div class="card-desc-box" style="margin-top: 0; margin-bottom: 10px;">
          <strong style="color:#00e5ff; display:block; margin-bottom:4px;">Specific Impulse (Isp) Tradeoff:</strong>
          Ion engines achieve ~3,000s Isp with low thrust, while Chemical LH2/LOX delivers 450s Isp with high instantaneous maneuverability.
        </div>
        <div class="card-desc-box" style="margin-top: 0;">
          <strong style="color:#00e5ff; display:block; margin-bottom:4px;">Tsiolkovsky Trajectory Principle:</strong>
          Payload fraction decreases exponentially with delta-V demands. Efficient stage staging preserves critical return fuel.
        </div>
        <a href="https://science.nasa.gov" target="_blank" class="cyber-link">EXPLORE NASA DEEP SPACE SCIENCE ↗</a>
      </div>

      <!-- Card 4: NEXT FLIGHT ADVICE & CTA -->
      <div class="carousel-card" data-index="3">
        <div class="card-topline">
          <span class="card-pill-tag">04 • DIRECTIVES</span>
          <span class="card-corner-status"></span>
        </div>
        <h3 class="card-title">FLIGHT DIRECTIVE</h3>
        <span class="card-subtitle">ACTIONABLE REFINEMENTS</span>
        <div class="card-metric-list" style="margin-bottom: 12px;">
          <div class="card-metric-row">
            <span class="metric-label">Recommended Thruster</span>
            <span class="metric-val highlight">ION / XENON CLUSTER</span>
          </div>
          <div class="card-metric-row">
            <span class="metric-label">Shielding Requirement</span>
            <span class="metric-val">CLASS III COMPOSITE</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn-action-primary" id="btnBay">RE-ENGINEER IN ASSEMBLY BAY ↗</button>
          <button class="btn-action-outline" id="btnRetry">RETRY FLIGHT CHECKPOINT ↺</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Bar: Indicators & Universal CTA -->
  <div class="debrief-bottom-bar">
    <div class="carousel-indicators" id="indicators">
      <button class="indicator-dot active" data-index="0"></button>
      <button class="indicator-dot" data-index="1"></button>
      <button class="indicator-dot" data-index="2"></button>
      <button class="indicator-dot" data-index="3"></button>
    </div>
    <div class="debrief-quick-actions">
      <button class="primary-button" id="btnNextMission"><span>CHOOSE THE NEXT FRONTIER</span><b>↗</b></button>
      <button class="outline-button" id="btnExport">EXPORT LOG ↓</button>
    </div>
  </div>
</div>

<script>
  const cards = Array.from(document.querySelectorAll('.carousel-card'));
  const dots = Array.from(document.querySelectorAll('.indicator-dot'));
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  const N = cards.length;
  let activeIndex = 0;

  // 3D Cylindrical Ring Configuration
  // Dynamic 3D Ring layout where every card curves along the cylindrical arc
  // Slots:
  // slot 0 (active / front): X = 0, Z = 0, rotateY = 0deg, scale = 1.0, opacity = 1.0
  // slot 1 (right): X = +400px, Z = -130px, rotateY = -35deg, scale = 0.92, opacity = 0.68
  // slot -1 (left): X = -400px, Z = -130px, rotateY = +35deg, scale = 0.92, opacity = 0.68
  // slot 2 / -2 (rear): X = 0, Z = -350px, rotateY = 0deg, scale = 0.82, opacity = 0.15

  function updateCylinder() {
    cards.forEach((card, i) => {
      let offset = (i - activeIndex) % N;
      if (offset > N / 2) offset -= N;
      if (offset < -N / 2) offset += N;

      card.classList.toggle('active', offset === 0);

      if (offset === 0) {
        card.style.transform = 'translateX(0px) translateZ(0px) rotateY(0deg) scale(1)';
        card.style.opacity = '1.0';
        card.style.zIndex = '30';
        card.style.pointerEvents = 'auto';
      } else if (offset === 1) {
        card.style.transform = 'translateX(400px) translateZ(-130px) rotateY(-36deg) scale(0.92)';
        card.style.opacity = '0.68';
        card.style.zIndex = '20';
        card.style.pointerEvents = 'auto';
      } else if (offset === -1) {
        card.style.transform = 'translateX(-400px) translateZ(-130px) rotateY(36deg) scale(0.92)';
        card.style.opacity = '0.68';
        card.style.zIndex = '20';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.transform = 'translateX(0px) translateZ(-350px) rotateY(0deg) scale(0.82)';
        card.style.opacity = '0.15';
        card.style.zIndex = '5';
        card.style.pointerEvents = 'none';
      }

      card.onclick = () => {
        if (offset !== 0) {
          goToCard(i);
        }
      };
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  }

  function goToCard(idx) {
    activeIndex = (idx % N + N) % N;
    updateCylinder();
  }

  btnPrev.onclick = () => {
    goToCard(activeIndex - 1);
  };

  btnNext.onclick = () => {
    goToCard(activeIndex + 1);
  };

  dots.forEach((dot, i) => {
    dot.onclick = () => goToCard(i);
  });

  // Drag interaction
  let isDragging = false;
  let startX = 0;
  const viewport = document.getElementById('carouselViewport');

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - startX;
    if (diff > 50) {
      btnPrev.click();
    } else if (diff < -50) {
      btnNext.click();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') btnPrev.click();
    if (e.key === 'ArrowRight') btnNext.click();
  });

  updateCylinder();
</script>
</body>
</html>
`;

fs.writeFileSync('c:\\Users\\User\\.gemini\\antigravity\\scratch\\mission-nasa-game\\scratch\\test_cylinder_ring.html', htmlContent);

const chrome = spawn(CHROME_PATH, [
  '--headless',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1920,1080'
]);

setTimeout(async () => {
  try {
    const tabs = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${PORT}/json/list`, r => {
        let body = '';
        r.on('data', c => body += c);
        r.on('end', () => res(JSON.parse(body)));
      }).on('error', rej);
    });

    const tab = tabs.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension')) || tabs[0];
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = async () => {
      let id = 1;
      const send = (method, params = {}) => new Promise((resolve, reject) => {
        const curId = id++;
        const handler = e => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

      await send('Page.enable');
      await send('Runtime.enable');

      await send('Page.navigate', { url: 'http://localhost:8080/scratch/test_cylinder_ring.html' });
      await new Promise(r => setTimeout(r, 2000));

      const shot0 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_cylinder_image50_card0.png'), Buffer.from(shot0.data, 'base64'));

      // Click Next
      await send('Runtime.evaluate', { expression: `document.getElementById('btnNext').click()` });
      await new Promise(r => setTimeout(r, 800));

      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_cylinder_image50_card1.png'), Buffer.from(shot1.data, 'base64'));

      console.log('Image 50 style test screenshots captured.');
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error(err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
