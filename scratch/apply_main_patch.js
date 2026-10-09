const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'game', 'src', 'main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

const startIdx = code.indexOf('function completeMission(){');
const endIdx = code.indexOf('function pauseMenu(){');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find indices!');
  process.exit(1);
}

const replacement = `function buildDebriefCarousel(sim, isFailed, failEvent) {
  const finalScore = Math.round(sim ? sim.score : 0);
  const finalHull = Math.round(sim ? Math.max(0, sim.hull) : 0);
  const finalTime = sim ? formatTime(sim.time) : '00:00';
  const finalCollisions = sim ? sim.collisions : 0;
  const stageNum = sim ? (sim.stage + 1) : 1;
  const destName = (sim?.destination?.name || 'Mars').toUpperCase();
  const destSource = sim?.destination?.source || 'https://science.nasa.gov';
  const destScience = sim?.destination?.science || 'Transfer trajectories require continuous momentum management and precision capture.';

  const totalScoreVal = isFailed
    ? Math.round(finalScore * 20 + finalHull * 5)
    : Math.round(finalScore * 35 + finalHull * 15);
  const totalScoreStr = totalScoreVal.toLocaleString();

  let grade = 'C';
  if (isFailed) {
    grade = '!';
  } else if (finalScore >= 185 && finalHull >= 65) {
    grade = 'S';
  } else if (finalScore >= 155) {
    grade = 'A+';
  } else if (finalScore >= 130) {
    grade = 'A';
  } else if (finalScore >= 100) {
    grade = 'B';
  } else {
    grade = 'C';
  }

  const trajectoryAcc = Math.min(99.4, (86.0 + (finalScore / 25) + (finalHull / 30))).toFixed(1);
  const propEfficiency = Math.max(8, Math.round(sim?.fuel ?? 65));
  const dragPenalty = '+' + ((finalCollisions * 2.2) + 3.1).toFixed(1) + '%';
  const busDrop = (sim?.power ?? 100) < 45 ? '−12%' : '−5%';
  const vectorDrift = '0.' + (finalCollisions + 2) + '°';

  return \`
  <div class="debrief-modal-wrapper \${isFailed ? 'failed-debrief' : ''}">
    <div class="debrief-top-banner">
      <div class="banner-left">
        <span class="banner-kicker">MISSION DEBRIEF • PROJECT AURORA</span>
        <h2>\${isFailed ? 'MISSION INTERRUPTED • CHAPTER 0' + stageNum : 'EXPEDITION COMPLETE • ' + destName}</h2>
      </div>
      <div class="banner-score-box">
        <div class="score-metric">
          <span class="score-label">TOTAL SCORE</span>
          <strong class="score-num">\${totalScoreStr} <small>PTS</small></strong>
        </div>
        <div class="grade-pill">
          <span class="grade-label">GRADE</span>
          <b class="grade-badge \${isFailed ? 'failure' : ''}">\${grade}</b>
        </div>
      </div>
    </div>

    <div class="debrief-carousel-viewport" id="carouselViewport">
      <button class="carousel-nav-btn prev" id="carouselPrev" aria-label="Previous card">‹</button>
      <button class="carousel-nav-btn next" id="carouselNext" aria-label="Next card">›</button>

      <div class="debrief-carousel-ring" id="carouselRing">
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
              <span class="metric-val">\${destName} EXPEDITION</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Trajectory Accuracy</span>
              <span class="metric-val highlight">\${trajectoryAcc}% OPTIMAL</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Flight Duration</span>
              <span class="metric-val">\${finalTime}</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Propellant Remaining</span>
              <span class="metric-val highlight">\${propEfficiency}% MARGIN</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Science Return</span>
              <span class="metric-val highlight">\${finalScore} POINTS</span>
            </div>
          </div>
          <div class="card-desc-box">
            \${isFailed ? escape(failEvent?.message || 'Flight trajectory interrupted during approach corridor.') : (sim?.fullArchive ? 'The complete archive survived the journey. Every measurement and recorded voice is safely secured.' : 'The validated samples reached Earth. Your team preserved the essential mission record.')}
          </div>
        </div>

        <div class="carousel-card" data-index="1">
          <div class="card-topline">
            <span class="card-pill-tag">02 • DIAGNOSTICS</span>
            <span class="card-corner-status \${isFailed || finalCollisions > 0 ? 'warning-dot' : ''}"></span>
          </div>
          <h3 class="card-title">PERFORMANCE GAPS</h3>
          <span class="card-subtitle">ANOMALIES & DIVERGENCE</span>
          <div class="card-metric-list">
            <div class="card-metric-row">
              <span class="metric-label">Drag / Maneuver Penalty</span>
              <span class="metric-val warning">\${dragPenalty} CONSUMPTION</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Energy Bus Fluctuation</span>
              <span class="metric-val warning">\${busDrop} TRANSIENT</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Thruster Alignment</span>
              <span class="metric-val">\${vectorDrift} VECTOR DRIFT</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Collisions / Hazards</span>
              <span class="metric-val \${finalCollisions > 0 ? 'warning' : ''}">\${finalCollisions} SUSTAINED</span>
            </div>
            <div class="card-metric-row">
              <span class="metric-label">Vehicle Integrity</span>
              <span class="metric-val \${finalHull < 40 ? 'warning' : 'highlight'}">\${finalHull}%</span>
            </div>
          </div>
          <div class="card-desc-box">
            \${isFailed ? 'Guidance lost or vehicle integrity depleted. Structural thresholds exceeded tolerance limit.' : 'Orbital insertion nominal with minor micrometeoroid drag encountered during the interplanetary coast.'}
          </div>
        </div>

        <div class="carousel-card" data-index="2">
          <div class="card-topline">
            <span class="card-pill-tag">03 • NASA SCIENCE</span>
            <span class="card-corner-status"></span>
          </div>
          <h3 class="card-title">AEROSPACE INSIGHTS</h3>
          <span class="card-subtitle">PROPULSION & ORBITAL LAWS</span>
          <div class="card-desc-box" style="margin-top: 0; margin-bottom: 8px;">
            <strong style="color:#00e5ff; display:block; margin-bottom:3px;">Specific Impulse (Isp) Tradeoff:</strong>
            Ion engines achieve ~3,000s Isp with low thrust, while Chemical LH2/LOX delivers 450s Isp with high instantaneous maneuverability.
          </div>
          <div class="card-desc-box" style="margin-top: 0; margin-bottom: 8px;">
            <strong style="color:#00e5ff; display:block; margin-bottom:3px;">Tsiolkovsky Trajectory Principle:</strong>
            Payload fraction decreases exponentially with delta-V demands. Efficient stage staging preserves critical return fuel.
          </div>
          <div class="card-desc-box" style="margin-top: 0;">
            <strong style="color:#00e5ff; display:block; margin-bottom:3px;">Planetary Mission Science:</strong>
            \${escape(destScience)}
          </div>
          <a href="\${destSource}" target="_blank" rel="noopener" class="cyber-link">EXPLORE NASA DEEP SPACE SCIENCE ↗</a>
        </div>

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
            <div class="card-metric-row">
              <span class="metric-label">Solar Recharge Margin</span>
              <span class="metric-val highlight">+15% PHOTOVOLTAIC</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn-action-primary" id="carouselBtnBay">RE-ENGINEER IN ASSEMBLY BAY ↗</button>
            <button class="btn-action-outline" id="carouselBtnRetry">RETRY FLIGHT CHECKPOINT ↺</button>
          </div>
        </div>
      </div>
    </div>

    <div class="debrief-bottom-bar">
      <div class="carousel-indicators" id="carouselIndicators">
        <button class="indicator-dot active" data-index="0" aria-label="Slide 1"></button>
        <button class="indicator-dot" data-index="1" aria-label="Slide 2"></button>
        <button class="indicator-dot" data-index="2" aria-label="Slide 3"></button>
        <button class="indicator-dot" data-index="3" aria-label="Slide 4"></button>
      </div>
      <div class="debrief-quick-actions">
        <button class="primary-button" id="carouselBtnNext" data-menu><span>CHOOSE THE NEXT FRONTIER</span><b>↗</b></button>
        <button class="outline-button" id="carouselBtnExport">EXPORT LOG ↓</button>
      </div>
    </div>
  </div>
  \`;
}

function initDebriefCarousel(sim, isFailed, failEvent, resultData) {
  const dialogEl = $('#dialog');
  if (!dialogEl) return;
  const cards = Array.from(dialogEl.querySelectorAll('.carousel-card'));
  const dots = Array.from(dialogEl.querySelectorAll('.indicator-dot'));
  const btnPrev = dialogEl.querySelector('#carouselPrev');
  const btnNext = dialogEl.querySelector('#carouselNext');
  const N = cards.length;
  let activeIndex = 0;

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

      card.onclick = (e) => {
        if (e.target.closest('button, a')) return;
        if (offset !== 0) goToCard(i);
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

  if (btnPrev) btnPrev.onclick = () => goToCard(activeIndex - 1);
  if (btnNext) btnNext.onclick = () => goToCard(activeIndex + 1);

  dots.forEach((dot, i) => {
    dot.onclick = () => goToCard(i);
  });

  let isDragging = false;
  let startX = 0;
  const viewport = dialogEl.querySelector('#carouselViewport');
  if (viewport) {
    viewport.onmousedown = (e) => {
      if (e.target.closest('button, a')) return;
      isDragging = true;
      startX = e.clientX;
    };
    viewport.ontouchstart = (e) => {
      if (e.target.closest('button, a')) return;
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
      }
    };
  }

  const handleDragEnd = (clientX) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = clientX - startX;
    if (diff > 45) {
      goToCard(activeIndex - 1);
    } else if (diff < -45) {
      goToCard(activeIndex + 1);
    }
  };

  const onMouseUp = (e) => handleDragEnd(e.clientX);
  const onTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      handleDragEnd(e.changedTouches[0].clientX);
    } else {
      isDragging = false;
    }
  };

  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchend', onTouchEnd);

  const onKey = (e) => {
    if (dialogKind === 'complete' || dialogKind === 'failed') {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToCard(activeIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToCard(activeIndex + 1); }
    }
  };
  window.addEventListener('keydown', onKey);

  const btnBay = dialogEl.querySelector('#carouselBtnBay');
  if (btnBay) {
    btnBay.onclick = () => {
      closeDialog();
      designDialog();
    };
  }

  const btnRetry = dialogEl.querySelector('#carouselBtnRetry');
  if (btnRetry) {
    btnRetry.onclick = () => {
      closeDialog();
      if (savedCheckpoint) initializeFlight(savedCheckpoint);
      else initializeFlight();
    };
  }

  const btnNextAction = dialogEl.querySelector('#carouselBtnNext');
  if (btnNextAction) {
    btnNextAction.onclick = () => {
      returnMenu();
    };
  }

  const btnExport = dialogEl.querySelector('#carouselBtnExport');
  if (btnExport) {
    btnExport.onclick = () => {
      const exportData = resultData || {
        score: Math.round(sim ? sim.score : 0),
        time: sim ? sim.time : 0,
        hull: Math.round(sim ? sim.hull : 0),
        destination: sim?.destination?.name || 'Mission',
        date: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`odyssey-\${sim?.destination?.id || 'mission'}-mission.json\`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
  }

  updateCylinder();
}

function completeMission(){
  keys={};audio.cue('success');audio.stopVoice();audio.stopKlaxon();audio.updateWind(0);document.body.classList.remove('hud-alert-critical','hud-alert-warning');hazardTipActive=false;reentryCommsSent=false;
  const rank=sim.score>=185&&sim.hull>=65?'S':sim.score>=155?'A+':sim.score>=130?'A':sim.score>=100?'B':'C';
  const result={score:Math.round(sim.score),rank,time:sim.time,hull:Math.round(sim.hull),fullArchive:sim.fullArchive,destination:sim.destination.name,journal:sim.journal,campaign:sim.campaign,loadout:sim.loadout,date:new Date().toISOString()};
  if(!records[sim.destination.id]||records[sim.destination.id].score<result.score){records[sim.destination.id]=result;save('odyssey-records',records);}
  savedCheckpoint=null;try{localStorage.removeItem('odyssey-checkpoint');}catch{}if($('#resume-button'))$('#resume-button').hidden=true;lastJournal=sim.journal;save('odyssey-journal',lastJournal);
  const html = buildDebriefCarousel(sim, false, null);
  showDialog('complete', html, true);
  initDebriefCarousel(sim, false, null, result);
}
`;

const updatedCode = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync(mainJsPath, updatedCode, 'utf8');
console.log('Successfully updated main.js with debrief carousel!');
