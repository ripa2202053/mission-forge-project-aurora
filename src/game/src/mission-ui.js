import {FLIGHT_PLANS,projectedReserves,SITES,SCIENCE_SOURCE,flightPlan,getCampaignData} from './campaign.js';
import {NASA_MISSION_CLASSES,LAUNCH_VEHICLES} from './data.js';
import {renderRoleAuthorityTag, CREW_ROLES} from './crew.js';
import {TECH_TREE} from './career.js';

const button=(text,attrs='')=>`<button class="outline-button" ${attrs}>${text}</button>`;
export function plannerMarkup(stats, destination='mars', missionClassId='discovery', launchVehicleId='falcon9_medium'){
  const destData = getCampaignData(destination);
  const missionClass = stats.missionClass || NASA_MISSION_CLASSES.find(c=>c.id===missionClassId) || NASA_MISSION_CLASSES[0];
  const launchVehicle = stats.launchVehicle || LAUNCH_VEHICLES.find(lv=>lv.id===launchVehicleId) || LAUNCH_VEHICLES[0];
  const totalCost = stats.totalMissionCost || (stats.cost + launchVehicle.cost);

  const planBadges = {
    reserve: { icon: '[SAFE]', title: 'RESERVE PROFILE', tag: 'FUEL CONSERVATIVE', color: 'green' },
    balanced: { icon: '[NOMINAL]', title: 'BALANCED TRANSFER', tag: 'RECOMMENDED', color: 'cyan' },
    rapid: { icon: '[EXPRESS]', title: 'RAPID RESPONSE', tag: 'HIGH VELOCITY', color: 'amber' }
  };

  const costRatio = Math.min(100, Math.round((totalCost / missionClass.costLimit) * 100));
  const isBudgetOk = totalCost <= missionClass.costLimit;

  return `<div class="mission-planner">
    <div class="planner-authority-strip">${renderRoleAuthorityTag('flight', 'AUTHORITY: TRAJECTORY &amp; FLIGHT COMMIT')}</div>
    <div class="planner-arch-banner tactical-arch-banner">
      <div class="arch-badge-item">
        <span class="arch-badge-label">[01] NASA PROGRAM</span>
        <b class="arch-val-tag"><span class="status-pip live"></span>${missionClass.name.toUpperCase()} ($${missionClass.costLimit}M CAP)</b>
      </div>
      <div class="arch-badge-item">
        <span class="arch-badge-label">[02] LAUNCH VEHICLE</span>
        <b>${launchVehicle.shortName} (${launchVehicle.fairingDiameter} FAIRING)</b>
      </div>
      <div class="arch-badge-item">
        <span class="arch-badge-label">[03] MISSION BUDGET</span>
        <div class="arch-cost-stack">
          <b class="${isBudgetOk ? 'cost-ok' : 'cost-warn'}">$${totalCost}M / $${missionClass.costLimit}M <small>(${costRatio}%)</small></b>
          <div class="arch-budget-bar"><div class="arch-budget-fill ${isBudgetOk ? 'ok' : 'warn'}" style="width:${costRatio}%"></div></div>
        </div>
      </div>
      <div class="arch-badge-item">
        <span class="arch-badge-label">[04] C3 INJECTION BOOST</span>
        <b>${launchVehicle.deltaVBonus > 0 ? `+${launchVehicle.deltaVBonus.toFixed(1)} km/s Δv` : 'STANDARD DIRECT'}</b>
      </div>
    </div>

    <div class="transfer-map tactical-transfer-map">
      <svg viewBox="0 0 760 270" role="img" aria-label="Earth to destination transfer trajectory">
        <defs>
          <radialGradient id="sun-glow">
            <stop stop-color="#ffe299"/>
            <stop offset="0.6" stop-color="#ff9922" stop-opacity="0.35"/>
            <stop offset="1" stop-color="#473c2c" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="50%" stop-color="#818cf8"/>
            <stop offset="100%" stop-color="#f43f5e"/>
          </linearGradient>
        </defs>
        <!-- Orbital Mechanics Reference Coordinate Grid -->
        <line x1="40" y1="135" x2="720" y2="135" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="320" y1="20" x2="320" y2="250" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1" stroke-dasharray="3 3"/>
        <circle cx="320" cy="135" r="105" fill="url(#sun-glow)"/>
        <!-- Earth Orbit 1.0 AU -->
        <ellipse cx="320" cy="135" rx="180" ry="72" stroke="rgba(56, 189, 248, 0.28)" stroke-width="1" fill="none" stroke-dasharray="4 4"/>
        <!-- Destination Orbit -->
        <ellipse cx="320" cy="135" rx="310" ry="119" stroke="rgba(244, 63, 94, 0.28)" stroke-width="1" fill="none" stroke-dasharray="4 4"/>
        <circle cx="320" cy="135" r="14" class="map-sun"/>
        <!-- Hohmann Transfer Ellipse Arc -->
        <path class="transfer-arc" d="M140 135 C180 10 530 0 630 135" stroke="url(#orbit-grad)" stroke-width="2.5" fill="none"/>
        <circle cx="140" cy="135" r="10" class="map-earth"/>
        <circle cx="630" cy="135" r="13" class="map-mars"/>
        <!-- Telemetry Coordinates -->
        <text x="80" y="165" font-family="'IBM Plex Mono', monospace" font-size="9" fill="#94a3b8" letter-spacing="1">EARTH [1.0 AU]</text>
        <text x="540" y="170" font-family="'IBM Plex Mono', monospace" font-size="9" fill="#fda4af" letter-spacing="1">${destination.toUpperCase()} [ARRIVAL]</text>
        <text x="328" y="36" font-family="'IBM Plex Mono', monospace" font-size="8" fill="#38bdf8" letter-spacing="1">HOHMANN TRANSFER Δθ = 180°</text>
      </svg>
      <div class="planner-story">
        <span class="eyebrow">FLIGHT TRAJECTORY // ${destination.toUpperCase()}</span>
        <h3>Mission choices carry real consequences.</h3>
        <p>Configure flight reserves and approach parameters. Balance propellant margin against transit duration before leaving Earth.</p>
      </div>
    </div>

    <div class="jpl-porkchop-strip">
      <div class="porkchop-topline">
        <div class="porkchop-title">
          <span class="status-pip live"></span>
          <b>NASA JPL LAMBERT SOLVER // PORKCHOP BALLISTIC TRANSFER</b>
        </div>
        <span class="porkchop-source">NASA JPL SSD API (Mode M) · Live Telemetry</span>
      </div>
      <div class="porkchop-grid">
        <div class="porkchop-stat">
          <span class="stat-lbl">OPTIMAL DEPARTURE</span>
          <b class="stat-val">MJD 59234</b>
        </div>
        <div class="porkchop-stat">
          <span class="stat-lbl">BALLISTIC TOTAL Δv</span>
          <b class="stat-val highlight">6.96 km/s</b>
        </div>
        <div class="porkchop-stat">
          <span class="stat-lbl">TIME OF FLIGHT</span>
          <b class="stat-val">900 DAYS</b>
        </div>
        <div class="porkchop-stat">
          <span class="stat-lbl">HYPERBOLIC EXCESS (v∞)</span>
          <b class="stat-val highlight">4.53 km/s</b>
        </div>
      </div>
    </div>

    <div class="route-cards tactical-route-cards">
      ${FLIGHT_PLANS.map((p,i)=>{
        const r = projectedReserves(stats,p);
        const meta = planBadges[p.id] || { icon: '[ROUTE]', title: p.name, tag: 'FLIGHT ROUTE', color: 'cyan' };
        return `
        <button class="route-choice-card tactical-route-card" data-plan="${p.id}" aria-pressed="${i===1}">
          <div class="route-card-top">
            <span class="route-plan-tag tag-${meta.color}">${meta.icon} ${meta.tag}</span>
            <span class="route-num">PROFILE 0${i+1}</span>
          </div>
          <h3 class="route-title">${meta.title}</h3>
          <div class="route-days-badge">
            <b>${p.days}</b>
            <span>DAYS / TRAJECTORY PROFILE</span>
          </div>
          <p class="route-desc">${p.description}</p>
          <div class="route-meters-box">
            <div class="meter-line">
              <span>FUEL MARGIN:</span>
              <strong class="${r.fuel >= 80 ? 'good' : r.fuel >= 60 ? 'mid' : 'warn'}">${Math.round(r.fuel)}%</strong>
            </div>
            <div class="meter-line">
              <span>POWER MARGIN:</span>
              <strong class="${r.power >= 90 ? 'good' : 'mid'}">${Math.round(r.power)}%</strong>
            </div>
          </div>
        </button>`;
      }).join('')}
    </div>

    <div class="dialog-footer planner-footer">
      <span id="plan-status" class="plan-status-badge" aria-live="polite">BALANCED TRANSFER SELECTED · SIX CHAPTERS · FIELD OPERATIONS</span>
      <button id="commit-plan" class="primary-button hero-start-btn tactical-btn">
        <span>COMMIT PLAN &amp; LAUNCH ROCKET</span>
        <span class="btn-arrow">↗</span>
      </button>
    </div>
  </div>`;
}
export function bindPlanner(root,onCommit){let plan='balanced';root.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{plan=b.dataset.plan;root.querySelectorAll('[data-plan]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));root.querySelector('#plan-status').textContent=FLIGHT_PLANS.find(p=>p.id===plan).name+' SELECTED';});root.querySelector('#commit-plan').onclick=()=>onCommit(plan);}

export function operationMarkup(sim,kind){
  const destData = getCampaignData(sim?.destination?.id || 'mars');
  const activeSites = destData.sites || SITES;

  if(kind==='repair')return `<div class="operation-grid"><div><span class="eyebrow">REYES / ENGINEERING CHANNEL</span><div class="op-authority-tag">${renderRoleAuthorityTag('comms', 'AUTHORITY: CIRCUIT BUS DIAGNOSTICS &amp; RECOVERY')}</div><p class="dialog-lead">A power switch tripped during the storm. Follow 3 easy steps below to turn science power back on.</p><div class="power-diagram"><div>GENERATOR <b>${sim.stats.generatedKW.toFixed(2)} kW</b></div><span>↓</span><div>POWER LINE <b class="fault-text">SWITCH TRIPPED</b></div><span>↓</span><div>SCIENCE SENSORS <b>OFFLINE</b></div></div><p class="model-caption">Follow the 3 numbered steps in order to reset the circuit safely.</p></div><div class="procedure-panel"><h3>TURN POWER BACK ON</h3><p>Safe order: 1. Turn off damaged line → 2. Turn on backup power → 3. Reconnect sensors.</p>${['TURN OFF DAMAGED LINE','TURN ON BACKUP POWER','RECONNECT SENSORS'].map((t,i)=>`<button class="circuit-switch" data-circuit="${i}" aria-pressed="false"><span>0${i+1}</span>${t}<b>CLICK TO TOGGLE</b></button>`).join('')}<p id="operation-feedback" role="status" aria-live="polite">Click step 1 to turn off the damaged line.</p><button class="primary-button" id="repair-confirm" disabled>RESTORE SCIENCE POWER · −4 POWER</button>${button('SKIP REPAIR · SCANS 20% SLOWER','id="repair-isolate"')}<p>Skipping repair saves power, but scanning will take a little longer.</p></div></div>`;
  if(kind==='survey')return `<div class="survey-intro"><div class="op-authority-tag">${renderRoleAuthorityTag('science', 'AUTHORITY: SPECTRAL ANALYSIS &amp; SITE SELECTION')}</div><p class="dialog-lead">Step 1: Click the two guide buttons to tune your scanner. Step 2: Compare the 3 landing sites below. Step 3: Choose your landing site and click Confirm.</p><span class="data-badge">${destData.agency}</span></div><div class="spectrum-console"><div class="spectrum-plot"><svg viewBox="0 0 700 160" role="img" aria-label="Mineral sensor wavelength guides"><path class="plot-grid" d="M40 20V130H670 M40 50H670 M40 90H670 M245 20V130 M450 20V130 M655 20V130"/><path class="clay-trace" d="M40 45 Q180 35 290 48 Q325 50 342 100 Q355 130 392 52 Q560 40 670 46"/><path class="sulfate-trace" d="M40 68 Q200 60 450 67 Q485 68 504 116 Q513 140 553 68 L670 66"/><line id="band-cursor" x1="40" x2="40" y1="15" y2="132"/><text x="40" y="152">1.8 μm</text><text x="360" y="152">2.2 / GUIDE 1</text><text x="515" y="152">2.4 / GUIDE 2</text></svg></div><div class="spectrum-presets" aria-label="Quick tune scanner"><button type="button" data-tune="2.20">① SCAN GUIDE 1 · 2.20 μm</button><button type="button" data-tune="2.40">② SCAN GUIDE 2 · 2.40 μm</button></div><label for="band-tuner">FREQUENCY TUNER <b id="band-value">1.80 μm</b></label><input id="band-tuner" type="range" min="1.8" max="2.6" value="1.8" step=".01" aria-label="Scanner wavelength in micrometers"><div class="spectrum-actions">${button('ACQUIRE SCAN','id="acquire-band"')}<span id="operation-feedback" role="status" aria-live="polite">Click SCAN GUIDE 1, then click ACQUIRE SCAN. Repeat with SCAN GUIDE 2.</span></div></div><div class="site-cards">${activeSites.map(s=>`<button data-site="${s.id}" aria-pressed="false"><small>TRAVERSE / ${s.slope}° SLOPE</small><h3>${s.name}</h3><div class="mineral-bar">GUIDE 1 <i style="--mineral:${s.clay}%"></i><b class="site-clay">LOCKED</b></div><div class="mineral-bar sulfate">GUIDE 2 <i style="--mineral:${s.sulfate}%"></i><b class="site-sulfate">LOCKED</b></div><p>${s.description}</p><strong>−${s.power} POWER · +${s.yield} SCIENCE</strong></button>`).join('')}</div><p class="model-caption">NASA Scientific Reference: ${destData.pdsCitation}. Sensor accuracy: ±${sim.loadout[3]===0?6:10} units.</p><a class="science-link" href="${destData.source || SCIENCE_SOURCE}" target="_blank" rel="noopener">NASA science reference archive ↗</a><div class="dialog-footer"><span id="site-status">1 / TUNE BOTH GUIDES → 2 / PICK A LANDING SITE</span><button class="primary-button" id="survey-confirm" disabled>COMMIT LANDING SITE ↗</button></div>`;
  const recovered=new Set(sim.campaign.evidence.map(e=>e.kind));
  const currentSiteName = activeSites.find(s=>s.id===sim.campaign.site)?.name || 'the landing site';
  return `<div class="op-authority-tag">${renderRoleAuthorityTag('science', 'AUTHORITY: SCIENTIFIC HYPOTHESIS FORMULATION')}</div><p class="dialog-lead">The mission recorder is saved! Review the evidence you collected. Which scientific conclusion can you support?</p><div class="evidence-grid"><article class="${recovered.has('mineral')?'':'missing-evidence'}"><span>01 / ROCK SAMPLE · ${recovered.has('mineral')?'COLLECTED':'NOT COLLECTED'}</span><h3>Rock Sample</h3><p>${recovered.has('mineral')?`The ${currentSiteName.toLowerCase()} rock sample contains minerals formed in water.`:'No ground rock sample was collected. Orbital readings alone leave it unconfirmed.'}</p></article><article class="${recovered.has('context')?'':'missing-evidence'}"><span>02 / PHOTO MOSAIC · ${recovered.has('context')?'COLLECTED':'NOT COLLECTED'}</span><h3>Surrounding Layers</h3><p>${recovered.has('context')?'Photos link the sample to surrounding rock layers, showing how the environment changed over time.':'No surrounding photo mosaic was saved. Layer history remains uncertain.'}</p></article><article><span>03 / DATA RECORDER · SAVED</span><h3>Mission Recorder</h3><p>The recorder contains data and sensor readings saved from the surface station.</p></article></div><h3>WHICH CONCLUSION CAN YOU SUPPORT?</h3><div class="claim-options">${[['water','Water was present here in ancient times.','Supported by your collected rock and mineral samples.'],['life','Confirmed alien biological life.','Not supported: rock samples do not prove extraterrestrial life.'],['ocean','A global planetary ocean covered the whole world.','Not supported: observations from one local spot do not prove a global ocean.']].map(([id,title,detail])=>`<button data-claim="${id}" aria-pressed="false"><strong>${title}</strong><span>${detail}</span></button>`).join('')}</div><p id="operation-feedback" aria-live="polite" role="status">Click a conclusion above, then click Submit Finding.</p><a class="science-link" href="${destData.source || SCIENCE_SOURCE}" target="_blank" rel="noopener">Read the real NASA science ↗</a><div class="dialog-footer"><span>TRUE SCIENCE DEPENDS ON REAL EVIDENCE</span><button class="primary-button" id="analysis-confirm" disabled>SUBMIT FINDING ↗</button></div>`;
}
export function bindOperation(root,sim,kind,resolve,sound){
  const destData = getCampaignData(sim?.destination?.id || 'mars');
  const activeSites = destData.sites || SITES;

  if(kind==='repair'){let step=0;root.querySelectorAll('[data-circuit]').forEach(b=>b.onclick=()=>{const n=+b.dataset.circuit;const feedback=root.querySelector('#operation-feedback');if(n!==step){feedback.textContent='Step order: '+['Turn off the damaged line first (Step 1).','Turn on backup power before reconnecting (Step 2).','Reconnect sensors after backup power is on (Step 3).'][step];sound('alert');return;}b.setAttribute('aria-pressed','true');b.querySelector('b').textContent='DONE';b.disabled=true;step++;sound('click');feedback.textContent=step===3?'All 3 steps complete! Click the button below to finish.':['','Damaged line off! Now click step 2 to turn on backup power.','Backup power is on! Now click step 3 to reconnect sensors.'][step];root.querySelector('#repair-confirm').disabled=step!==3;});root.querySelector('#repair-confirm').onclick=()=>resolve('bypass');root.querySelector('#repair-isolate').onclick=()=>resolve('isolate');return;}
  if(kind==='survey'){let site=null;const acquired=new Set(),slider=root.querySelector('#band-tuner'),feedback=root.querySelector('#operation-feedback');const refresh=()=>{root.querySelector('#survey-confirm').disabled=acquired.size!==2||!site;root.querySelector('#site-status').textContent=acquired.size===2?(site?(activeSites.find(s=>s.id===site)?.name || site)+' SELECTED':'PICK A LANDING SITE'):acquired.size+'/2 GUIDES ACQUIRED';};slider.oninput=()=>{root.querySelector('#band-value').textContent=(+slider.value).toFixed(2)+' μm';const x=40+(+slider.value-1.8)/.8*630;root.querySelector('#band-cursor').setAttribute('x1',x);root.querySelector('#band-cursor').setAttribute('x2',x);};root.querySelectorAll('[data-tune]').forEach(b=>b.onclick=()=>{slider.value=b.dataset.tune;slider.dispatchEvent(new Event('input'));feedback.textContent='Tuned to '+(b.dataset.tune==='2.20'?'GUIDE 1':'GUIDE 2')+'. Now click ACQUIRE SCAN.';sound('click');});root.querySelector('#acquire-band').onclick=()=>{const wave=+slider.value,band=Math.abs(wave-2.2)<.055?'clay':Math.abs(wave-2.4)<.055?'sulfate':null;if(!band){feedback.textContent='Move the slider closer to a guide line (near 2.20 or 2.40).';sound('click');return;}acquired.add(band);root.querySelector(`[data-tune="${band==='clay'?'2.20':'2.40'}"]`).classList.add('acquired');root.querySelectorAll('[data-site]').forEach(b=>{const s=activeSites.find(s=>s.id===b.dataset.site) || SITES.find(s=>s.id===b.dataset.site);if(s){b.querySelector('.site-'+band).textContent=s[band]+' ± '+(sim.loadout[3]===0?6:10);b.classList.add('has-'+band);}});feedback.textContent=acquired.size===2?'Both guides acquired! Compare the 3 landing sites below, click one, and confirm.':band.toUpperCase()+' acquired! Now tune and acquire the second guide.';sound('scan');refresh();};root.querySelectorAll('[data-site]').forEach(b=>b.onclick=()=>{site=b.dataset.site;root.querySelectorAll('[data-site]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));feedback.textContent=acquired.size===2?'Site selected! Click COMMIT LANDING SITE below.':'Site selected! Tune both scanner guides above to unlock.';refresh();});root.querySelector('#survey-confirm').onclick=()=>resolve(site);return;}
  let claim=null;root.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{claim=b.dataset.claim;root.querySelectorAll('[data-claim]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));root.querySelector('#analysis-confirm').disabled=false;root.querySelector('#operation-feedback').textContent=claim===destData.hypothesis.key?(sim.campaign.evidence.length===3?'Great job! Your rock samples and photos support this conclusion.':'Good choice, but missing some samples makes the conclusion provisional.'):'Warning: your collected evidence does not support this claim. Submit if you wish, but the reward will be lower.';});root.querySelector('#analysis-confirm').onclick=()=>resolve(claim);
}
export function campaignDebrief(sim){
  if(!sim.campaign)return '';
  const c=sim.campaign;
  const destData=getCampaignData(sim.destination?.id||'mars');
  const siteName=(destData.sites.find(s=>s.id===c.site)||SITES.find(s=>s.id===c.site))?.name||'No site selected';
  const missionClass = NASA_MISSION_CLASSES.find(mc=>mc.id===c.missionClass) || NASA_MISSION_CLASSES[0];
  const launchVehicle = LAUNCH_VEHICLES.find(lv=>lv.id===c.launchVehicle) || LAUNCH_VEHICLES[0];
  const totalCost = (sim.stats?.totalMissionCost || (sim.stats?.cost + launchVehicle.cost)) || 360;

  const costCommendation = c.missionClass === 'discovery' 
    ? 'COMMENDATION: NASA DISCOVERY EFFICIENCY MEDAL — Mission executed under strict $500M competitive cost cap!' 
    : c.missionClass === 'new_frontiers' 
      ? 'COMMENDATION: NASA NEW FRONTIERS AWARD — Decadal planetary survey objectives successfully achieved!' 
      : 'COMMENDATION: NASA FLAGSHIP STRATEGIC CITATION — Multi-billion dollar strategic exploration mandate accomplished!';

  return `<section class="engineering-debrief">
    <span class="eyebrow">NASA SCIENCE EVALUATION // ${destData.agency}</span>
    <h3>${c.confidence==='supported'?'A DEFENSIBLE DISCOVERY':c.confidence==='provisional'?'A PROVISIONAL FINDING':'OBSERVATIONS SAVED · CLAIM CORRECTED'}</h3>
    <div class="debrief-arch-pills">
      <span class="debrief-pill">${missionClass.badge}</span>
      <span class="debrief-pill">${launchVehicle.shortName} (${launchVehicle.fairingDiameter} Fairing)</span>
      <span class="debrief-pill">Total Mission Cost: $${totalCost}M / $${missionClass.costLimit}M</span>
    </div>
    <p class="debrief-commendation">${costCommendation}</p>
    <p>${flightPlan(c).name} · ${flightPlan(c).days} planned days · ${siteName} · ${c.evidence.length}/3 field records</p>
    <div>${c.decisions.map(d=>`<article><b>${d.title}</b><p>${d.detail}</p></article>`).join('')}</div>
    <p class="model-caption">Signal fragments recovered: ${c.clues?.length||0}/3. ${c.confidence==='provisional'?'A second science stop would have strengthened the conclusion.':'Compare another route and evidence set to see how the outcome changes.'}</p>
    <p class="model-caption">PDS Dataset Reference: ${destData.pdsCitation}.</p>
  </section>`;
}

export function createCommsHudMarkup() {
  return `<aside id="radio-comms-hud" class="radio-comms-hud hidden" aria-live="assertive" role="region" aria-label="Apollo Mission Control Radio Intercom">
    <div class="comms-header">
      <div class="comms-channel-tag"><span class="comms-live-pip"></span><span id="comms-channel-freq">CH 424.15 MHz</span></div>
      <div class="comms-badge" id="comms-badge-tag">FD</div>
      <div class="radio-waveform-container" aria-hidden="true">
        <span class="radio-waveform-bar"></span>
        <span class="radio-waveform-bar"></span>
        <span class="radio-waveform-bar"></span>
        <span class="radio-waveform-bar"></span>
        <span class="radio-waveform-bar"></span>
      </div>
    </div>
    <div class="comms-body">
      <div class="comms-speaker-callsign" id="comms-speaker-callsign">HOUSTON · FLIGHT DIRECTOR</div>
      <p class="comms-message-text" id="comms-message-text">Standing by for transmission...</p>
    </div>
    <div class="comms-footer">
      <span class="comms-quindar-indicator">[QUINDAR V2.4 LINK ACTIVE]</span>
      <button class="comms-ack-btn" id="comms-ack-btn" title="Acknowledge / Skip transmission">ACKNOWLEDGE ↵</button>
    </div>
  </aside>`;
}

export function createBriefingDossierMarkup(context = {}) {
  const destination = (context.destination || 'mars').toUpperCase();
  const callsign = context.callsign || 'ODYSSEY-07';

  return `<div id="classified-briefing-modal" class="classified-briefing-modal" role="dialog" aria-modal="true" aria-labelledby="briefing-title">
    <div class="briefing-dossier-card">
      <div class="briefing-stamp-watermark">TOP SECRET // NASA SPACE APPS 2026</div>
      <div class="briefing-header">
        <div>
          <span class="briefing-memo-tag">NASA FLIGHT OPERATIONS DIRECTORATE // MEMORANDUM 26-B</span>
          <h2 id="briefing-title">OPERATION AURORA: EXPEDITION BRIEFING</h2>
        </div>
        <div class="briefing-clearance-badge">LEVEL-5 CLEARANCE</div>
      </div>
      <div class="briefing-grid">
        <div class="briefing-recon-panel">
          <div class="briefing-recon-img-wrap">
            <div class="briefing-recon-grid"></div>
            <span class="briefing-recon-label">TARGET: JEZERO CRATER // ODYSSEY-01 LANDING ZONE</span>
            <div class="recon-anomaly-ping"></div>
          </div>
          <div class="recon-stats">
            <div>ORBITAL DISTANCE: <b>225M KM (1.52 AU)</b></div>
            <div>SIGNAL DELAY: <b>12.5 MIN RTLT</b></div>
            <div>ATMOSPHERE: <b>0.006 BAR CO2</b></div>
            <div>STATUS: <b>ANOMALOUS DATA CACHED</b></div>
          </div>
        </div>
        <div class="briefing-intel-panel">
          <h3>MISSION MANDATE // THE LOST TELEMETRY</h3>
          <p>Commander, three weeks ago, automated precursor outpost <b>ODYSSEY-01</b> went dark in Jezero Crater after transmitting a critical subterranean telemetry spike indicating high-probability ancient hydrated mudstones and organic biosignatures.</p>
          <p>Before power failure, the station secured its <b>NASA PDS science data recorder</b> onto the surface rover. Your directive:</p>
          <ol class="briefing-directives">
            <li><b>ENGINEER</b>: Assemble *Aurora-07* with sufficient &Delta;V and thermal shielding.</li>
            <li><b>TRANSIT</b>: Navigate the 214-day Hohmann flight corridor and survive Solar CME storms.</li>
            <li><b>SURVIVE</b>: Execute the 1.4 km/s retrograde burn and descend through the <i>7 Minutes of Terror</i>.</li>
            <li><b>RECOVER</b>: Deploy the Perseverance rover, scan the target strata, and recover the blackbox.</li>
          </ol>
          <div class="briefing-footer-action">
            <span class="briefing-callsign-display">ASSIGNED VESSEL: <b>AURORA-07</b></span>
            <button class="primary-button briefing-confirm-btn" id="briefing-confirm-btn">
              AUTHORIZE EXPEDITION &amp; ENTER HANGAR ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function createEdlHudMarkup() {
  return `<div id="edl-hud" class="edl-hud hidden" hidden style="display: none;" aria-label="Seven Minutes of Terror Atmospheric Entry HUD">
    <div class="edl-card">
      <div class="edl-header">
        <span class="edl-badge">EDL ENTRY INTERFACE</span>
        <b class="edl-status" id="edl-status-text">BLUNT BODY PLASMA COMPRESSION</b>
      </div>
      <div class="edl-aoa-scope">
        <div class="edl-plasma-cone"></div>
        <div class="edl-aoa-indicator" id="edl-aoa-indicator">
          <span class="aoa-reticle">◈</span>
        </div>
        <div class="edl-safe-zone-ring"></div>
      </div>
      <div class="edl-metrics">
        <div>ANGLE OF ATTACK: <b id="edl-aoa-val">0.0°</b> <small>(MAX 15.0°)</small></div>
        <div>HEAT SHIELD TEMP: <b id="edl-heat-val">0%</b></div>
      </div>
      <div id="edl-chute-prompt" class="edl-chute-prompt hidden">
        <span class="chute-alert-blink">MACH 2.2 DEPLOY WINDOW OPEN</span>
        <button class="primary-button edl-chute-btn" id="edl-chute-btn">DEPLOY SUPERSONIC CHUTE [P / SPACE] 🪂</button>
      </div>
    </div>
  </div>`;
}

export function createDockingHudMarkup() {
  return `<div id="docking-hud" class="docking-hud hidden" hidden style="display: none;" aria-label="Orbital Recovery Docking Boresight HUD">
    <div class="docking-card">
      <div class="docking-header">
        <span class="docking-badge">APOLLO/ARTEMIS DOCKING BORESIGHT</span>
        <span class="docking-station-call" id="docking-station-name">KEPLER RECOVERY STATION</span>
      </div>
      <div class="docking-scope">
        <div class="docking-target-ring"></div>
        <div class="docking-crosshair" id="docking-crosshair">
          <div class="crosshair-h"></div>
          <div class="crosshair-v"></div>
          <div class="crosshair-pip"></div>
        </div>
        <div class="docking-capture-gate"></div>
      </div>
      <div class="docking-metrics">
        <div class="docking-range-rate">
          RANGE: <b id="docking-range-val">0.0 m</b> | RATE: <b id="docking-rate-val">0.0 m/s</b>
        </div>
        <div class="docking-offsets">
          OFFSET: X: <b id="docking-offset-x">0.0 m</b> Y: <b id="docking-offset-y">0.0 m</b>
        </div>
        <div class="docking-guidance-msg" id="docking-guidance-msg">
          Use WASD to center crosshair. Target closure rate: 0.5 - 1.2 m/s.
        </div>
      </div>
    </div>
  </div>`;
}

export function createPowerShuntMarkup() {
  return `<div id="power-shunt-matrix" class="power-shunt-matrix hidden" hidden style="display: none;" role="toolbar" aria-label="3-Bus Tactical Power Distribution">
    <span class="shunt-matrix-label">POWER BUS:</span>
    <button class="shunt-btn" data-shunt="engines" id="shunt-btn-engines" title="Hotkey [1]: Route power to thrusters (+35% speed &amp; handling)">
      <span class="shunt-key">1</span> ENGINES
    </button>
    <button class="shunt-btn" data-shunt="shields" id="shunt-btn-shields" title="Hotkey [2]: Route power to shields (+60% damage deflection)">
      <span class="shunt-key">2</span> SHIELDS
    </button>
    <button class="shunt-btn active" data-shunt="balanced" id="shunt-btn-balanced" title="Hotkey [3]: Balanced standard power allocation">
      <span class="shunt-key">3</span> BALANCED
    </button>
  </div>`;
}

export function createSurfaceSurvivalHudMarkup() {
  return `<div id="surface-survival-hud" class="surface-survival-hud hidden" hidden style="display: none;" aria-label="Surface Survival &amp; Reconnaissance Systems">
    <div class="survival-status-cluster">
      <div class="survival-pill survival-power-pill" id="survival-power-pill">
        <span class="pill-dot sun-dot"></span>
        <span class="pill-lbl">POWER:</span>
        <b id="survival-power-val">+0.04 kW</b>
      </div>
      <div class="survival-pill survival-shelter-pill" id="survival-shelter-pill">
        <span class="pill-dot shelter-dot"></span>
        <span class="pill-lbl">TERRAIN:</span>
        <b id="survival-shelter-val">EXPOSED</b>
      </div>
      <div class="survival-pill survival-storm-pill" id="survival-storm-pill">
        <span class="pill-dot storm-dot"></span>
        <span class="pill-lbl">OPTICAL DEPTH &tau;:</span>
        <b id="survival-storm-val">0.15 (CLEAR)</b>
      </div>
    </div>
    <div class="survival-controls-cluster">
      <button class="survival-action-btn survival-lidar-btn" id="survival-lidar-btn" title="Key [Q]: Pulse active LIDAR Sonar radar wave to locate lost beacons and hazards">
        <span class="ctrl-key">[Q]</span>
        <span class="ctrl-label">LIDAR SCAN PULSE</span>
      </button>
      <button class="survival-action-btn survival-drone-btn" id="survival-drone-btn" title="Key [H]: Launch or recall Ingenuity Aerial Recon Drone">
        <span class="ctrl-key">[H]</span>
        <span class="ctrl-label">INGENUITY RECON</span>
        <span class="drone-battery-badge" id="survival-drone-battery">30s</span>
      </button>
    </div>
    <div class="survival-radar-ticker hidden" id="survival-radar-ticker">
      <span class="radar-ping-icon">📡</span>
      <span id="survival-radar-msg">LIDAR BEACON DETECTED</span>
    </div>
  </div>`;
}

export function createCrewDossierMarkup(careerInstance) {
  const activeId = careerInstance?.data?.activeOfficerId || 'flight';

  return `<div class="crew-dossier-wrapper">
    <div class="crew-dossier-intro">
      <span class="eyebrow">NASA ASTRONAUT CORPS // FLIGHT SPECIALIZATION &amp; RPG PERKS</span>
      <p>Assign your primary mission commander. Each officer brings dedicated NASA operational experience, distinct psychological resilience, and measurable mission stat buffs.</p>
    </div>
    <div class="crew-dossier-grid">
      ${CREW_ROLES.map(role => {
        const isActive = role.id === activeId;
        return `
          <div class="officer-card ${isActive ? 'active-officer' : ''}" data-role-id="${role.id}">
            <div class="officer-header">
              <div class="officer-badge ${role.badgeClass}">
                <span class="officer-glyph">${role.icon}</span>
                <span class="officer-callsign">${role.callsign}</span>
              </div>
              <div class="officer-titles">
                <span class="officer-role-domain">${role.domain.toUpperCase()}</span>
                <h4>${role.defaultName}</h4>
                <small class="officer-role-title">${role.title}</small>
              </div>
            </div>
            <div class="officer-quote">${role.voiceQuote}</div>
            <p class="officer-bio">${role.bio}</p>
            <div class="officer-perk-box">
              <div class="perk-top">
                <span class="perk-tag">ACTIVE RPG PERK</span>
                <b class="perk-name">${role.perkName}</b>
              </div>
              <p class="perk-desc">${role.perkDesc}</p>
            </div>
            <div class="officer-card-footer">
              ${isActive
                ? `<button class="primary-button active-command-btn" disabled>
                    <span class="status-pip live"></span> ASSIGNED MISSION COMMANDER
                   </button>`
                : `<button class="outline-button btn-select-officer" data-officer-id="${role.id}">
                    ASSIGN AS COMMANDER
                   </button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>`;
}

export function createTechTreeMarkup(careerInstance) {
  const points = careerInstance ? careerInstance.getResearchPoints() : 0;
  const branches = [
    { key: 'propulsion', title: '01 • PROPULSION &amp; ASTRODYNAMICS', icon: '↗' },
    { key: 'power', title: '02 • EXTREME ENVIRONMENT POWER &amp; THERMALS', icon: 'ϟ' },
    { key: 'science', title: '03 • PLANETARY SCIENCE &amp; BIO-ANALYSIS', icon: '⌬' },
    { key: 'avionics', title: '04 • AVIONICS, OPTICAL COMMS &amp; FDIR', icon: '⊕' }
  ];

  return `<div class="tech-tree-container">
    <div class="tech-tree-banner">
      <div class="tech-tree-title-group">
        <span class="eyebrow">NASA TECHNOLOGY READINESS LEVEL (TRL) AEROSPACE R&amp;D</span>
        <h3>Branching Aerospace Technology Tree</h3>
        <p>Advance technologies from prototype (TRL 6) to flight-proven (TRL 9). Researched technologies grant permanent mission enhancements.</p>
      </div>
      <div class="tech-points-box">
        <span class="pts-lbl">AVAILABLE SCIENCE RESEARCH POINTS</span>
        <b class="pts-val" id="tech-points-val">${points} PTS</b>
      </div>
    </div>

    <div class="tech-branches-grid">
      ${branches.map(b => {
        const nodes = TECH_TREE.filter(n => n.branch === b.key);
        return `
          <div class="tech-branch-column branch-${b.key}">
            <div class="branch-header">
              <span class="branch-icon">${b.icon}</span>
              <h4>${b.title}</h4>
            </div>
            <div class="branch-nodes-stack">
              ${nodes.map(node => {
                const isUnlocked = careerInstance ? careerInstance.isTechUnlocked(node.id) : false;
                const canUnlock = careerInstance ? careerInstance.canUnlockTech(node.id) : false;
                const prereq = node.prerequisite ? TECH_TREE.find(t => t.id === node.prerequisite) : null;
                const statusClass = isUnlocked ? 'unlocked' : (canUnlock ? 'available' : 'locked');

                return `
                  <div class="tech-node-card ${statusClass}" data-tech-id="${node.id}">
                    <div class="node-top">
                      <span class="node-icon">${node.icon}</span>
                      <div class="node-meta">
                        <span class="node-trl-badge">${node.trl}</span>
                        <h5>${node.name}</h5>
                      </div>
                    </div>
                    <p class="node-desc">${node.description}</p>
                    <div class="node-effect-pill">
                      <span class="effect-lbl">SYSTEM BUFF:</span>
                      <b>${node.effectLabel}</b>
                    </div>
                    ${prereq && !isUnlocked ? `
                      <div class="node-prereq-note">
                        REQUIRES: ${prereq.name}
                      </div>
                    ` : ''}
                    <div class="node-action">
                      ${isUnlocked ? `
                        <span class="tech-status-badge researched">✓ TRL QUALIFIED</span>
                      ` : canUnlock ? `
                        <button class="primary-button tactical-btn btn-research-node" data-tech-id="${node.id}">
                          RESEARCH (${node.cost} PTS)
                        </button>
                      ` : `
                        <button class="outline-button tactical-btn locked-node-btn" disabled>
                          ${prereq && !careerInstance?.isTechUnlocked(prereq.id) ? 'LOCKED (PREREQUISITE)' : `NEED ${node.cost} PTS`}
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>`;
}
