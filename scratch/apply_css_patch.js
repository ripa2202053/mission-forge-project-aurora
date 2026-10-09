const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'game', 'aurora-theme.css');
let css = fs.readFileSync(cssPath, 'utf8');

const targetHeader = '/* 2. Cybernetic Glass Dialog Container */';
const targetFooter = '/* 7. Briefing Screen Best Record Display */';

const startIdx = css.indexOf(targetHeader);
const endIdx = css.indexOf(targetFooter);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find CSS markers!');
  process.exit(1);
}

const replacement = `/* 2. Cybernetic Glass Dialog Container (Unbounded for 3D Carousel) */
.dialog.complete-dialog,
.dialog.failed-dialog {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  max-width: 1420px !important;
  width: 96vw !important;
  max-height: 96vh !important;
  overflow: visible !important;
  animation: dialog-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Modal Inner Container */
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
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.debrief-modal-wrapper.failed-debrief {
  border-color: rgba(248, 113, 113, 0.45);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9), 0 0 50px rgba(239, 68, 68, 0.22);
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
  pointer-events: none;
}

.debrief-modal-wrapper.failed-debrief::before {
  background: linear-gradient(90deg, transparent, #f87171 35%, #f87171 65%, transparent);
  box-shadow: 0 0 15px #f87171;
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

.failed-debrief .debrief-top-banner {
  border-bottom-color: rgba(248, 113, 113, 0.25);
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

.failed-debrief .banner-left .banner-kicker {
  color: #fca5a5;
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

.failed-debrief .banner-left h2 {
  color: #fee2e2;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
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

.failed-debrief .banner-score-box {
  border-color: rgba(248, 113, 113, 0.35);
  box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1), 0 0 25px rgba(239, 68, 68, 0.25);
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
.failed-debrief .score-label { color: #fca5a5; }

.score-num {
  font-family: 'Rajdhani', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #00e5ff;
  line-height: 1;
  text-shadow: 0 0 20px rgba(0, 229, 255, 0.85);
  display: block;
}

.failed-debrief .score-num {
  color: #fca5a5;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.85);
}

.score-num small {
  font-size: 14px;
  font-family: 'IBM Plex Mono', monospace;
  color: #7dd3fc;
  letter-spacing: 0.1em;
  margin-left: 4px;
}
.failed-debrief .score-num small { color: #fca5a5; }

.grade-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-left: 1px solid rgba(0, 229, 255, 0.25);
  padding-left: 20px;
}
.failed-debrief .grade-pill {
  border-left-color: rgba(248, 113, 113, 0.25);
}

.grade-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.16em;
  color: #7dd3fc;
  margin-bottom: 2px;
}
.failed-debrief .grade-label { color: #fca5a5; }

.grade-badge {
  font-family: 'Rajdhani', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 0 20px #00e5ff, 0 0 40px #00e5ff;
}

.grade-badge.failure {
  color: #f87171;
  text-shadow: 0 0 20px #f87171, 0 0 40px #ef4444;
}

/* 3. 3D Cylindrical Ring Carousel Stage */
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
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.7), inset 0 0 10px rgba(0, 229, 255, 0.15);
  transition: all 0.25s ease;
}

.failed-debrief .carousel-nav-btn {
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

.carousel-nav-btn:hover {
  background: rgba(0, 229, 255, 0.15);
  border-color: #00e5ff;
  color: #ffffff;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.6);
  transform: translateY(-50%) scale(1.08);
}

.failed-debrief .carousel-nav-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #f87171;
  color: #ffffff;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
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

.failed-debrief .carousel-card.active {
  border-color: #f87171 !important;
  box-shadow: 0 0 35px rgba(239, 68, 68, 0.45), 0 20px 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(239, 68, 68, 0.15) !important;
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

.card-corner-status.warning-dot {
  background: #f87171 !important;
  box-shadow: 0 0 10px #f87171 !important;
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

.failed-debrief .debrief-bottom-bar {
  border-top-color: rgba(248, 113, 113, 0.2);
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

.failed-debrief .indicator-dot.active {
  background: #f87171;
  box-shadow: 0 0 12px #f87171;
}

.debrief-quick-actions {
  display: flex;
  gap: 12px;
}

.debrief-quick-actions .primary-button {
  background: linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%) !important;
  border: 1px solid #38f8ff !important;
  border-radius: 6px !important;
  color: #020611 !important;
  -webkit-text-fill-color: #020611 !important;
  font-family: 'Rajdhani', sans-serif !important;
  font-weight: 700 !important;
  font-size: 13.5px !important;
  letter-spacing: 0.14em !important;
  text-transform: uppercase !important;
  padding: 10px 22px !important;
  box-shadow: 0 0 25px rgba(0, 229, 255, 0.6) !important;
  cursor: pointer !important;
}

.debrief-quick-actions .primary-button span,
.debrief-quick-actions .primary-button b {
  color: #020611 !important;
  -webkit-text-fill-color: #020611 !important;
  font-weight: 800 !important;
}

.debrief-quick-actions .outline-button {
  background: rgba(4, 13, 30, 0.8) !important;
  border: 1px solid rgba(0, 229, 255, 0.3) !important;
  border-radius: 6px !important;
  color: #7dd3fc !important;
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 11px !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  padding: 10px 18px !important;
  cursor: pointer !important;
}

.debrief-quick-actions .outline-button:hover {
  border-color: #00e5ff !important;
  color: #ffffff !important;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3) !important;
  background: rgba(0, 229, 255, 0.1) !important;
}

@media (max-width: 900px) {
  .carousel-nav-btn.prev { left: 10px; }
  .carousel-nav-btn.next { right: 10px; }
  .debrief-carousel-viewport { perspective: 800px; }
  .debrief-modal-wrapper { padding: 16px 20px; }
}

`;

const updatedCss = css.substring(0, startIdx) + replacement + css.substring(endIdx);
fs.writeFileSync(cssPath, updatedCss, 'utf8');
console.log('Successfully updated aurora-theme.css with 3D cylindrical carousel styles!');
