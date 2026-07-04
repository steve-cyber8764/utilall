// ===================================================
// Universe Distance Explorer - App Logic
// ===================================================

// ---- STATE ----
let currentSection = 'solar';
let selectedPlanetA = null;
let selectedPlanetB = null;
let selectedCountryA = null;
let selectedCountryB = null;
let selectedGalaxy = null;
let selectedGalaxy2 = null;
let selectedStarA = null;
let selectedStarB = null;
let starmapViewMode = 'top'; // 'top' or 'side'
let solarAnimFrame = null;
let galaxyAnimFrame = null;
let starmapAnimFrame = null;
let orbits = []; // orbit animation state
let worldMapInited = false;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  createStarfield();
  initNav();
  initSolarSection();
  initCountriesSection();
  initGalaxySection();
  initStarsSection();
});

// ---- STARFIELD ----
function createStarfield() {
  const sf = document.getElementById('starfield');
  const count = 200;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    const dur = (Math.random() * 4 + 2).toFixed(1);
    const delay = (Math.random() * 5).toFixed(1);
    const minOp = (Math.random() * 0.3 + 0.1).toFixed(2);
    star.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --dur:${dur}s; --delay:${delay}s; --min-op:${minOp};
      opacity:${minOp};
    `;
    sf.appendChild(star);
  }
}

// ---- NAVIGATION ----
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.dataset.section;
      switchSection(sec);
    });
  });
}

function switchSection(sec) {
  currentSection = sec;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-section="${sec}"]`).classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${sec}`).classList.add('active');
}

// ===================================================
// ---- SOLAR SYSTEM SECTION ----
// ===================================================
function initSolarSection() {
  buildSolarCanvas();
  buildPlanetGrids();
}

// ---- Solar System Canvas ----
function buildSolarCanvas() {
  const wrapper = document.getElementById('solar-visual');
  const canvas = document.createElement('canvas');
  canvas.id = 'solar-canvas';
  canvas.width = 900;
  canvas.height = 280;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  wrapper.appendChild(canvas);

  const legend = document.getElementById('solar-legend');
  PLANETS.forEach(p => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    // visualSize 비율에 따른 크기 계산 (최소 5px, 최대 20px)
    const dotSize = 5 + (p.visualSize / 45) * 15;
    item.innerHTML = `<div class="legend-dot" style="background:${p.color}; width:${dotSize.toFixed(1)}px; height:${dotSize.toFixed(1)}px; flex-shrink: 0;"></div><span>${p.emoji} ${p.name}</span>`;
    legend.appendChild(item);
  });

  orbits = PLANETS.map((p, i) => ({
    planet: p,
    angle: Math.random() * Math.PI * 2,
    speed: i === 0 ? 0 : 0.3 / Math.max(p.distFromSun, 0.1),
  }));

  animateSolar(canvas);
}

function animateSolar(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W * 0.08; // sun x
  const cy = H / 2;
  const scale = 0.85;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = 'rgba(3,4,13,0)';
    ctx.fillRect(0, 0, W, H);

    // Draw orbit rings
    PLANETS.forEach(p => {
      if (p.orbitRadius === 0) return;
      ctx.beginPath();
      ctx.ellipse(cx, cy, p.orbitRadius * scale, p.orbitRadius * scale * 0.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,160,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw planets along orbit
    orbits.forEach(o => {
      const p = o.planet;
      if (p.orbitRadius === 0) {
        // Sun
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.visualSize);
        grd.addColorStop(0, '#FFFDE7');
        grd.addColorStop(0.5, '#FFD700');
        grd.addColorStop(1, 'rgba(255,200,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, p.visualSize, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        // Glow
        const glowGrd = ctx.createRadialGradient(cx, cy, p.visualSize, cx, cy, p.visualSize * 3);
        glowGrd.addColorStop(0, 'rgba(255,200,0,0.15)');
        glowGrd.addColorStop(1, 'rgba(255,200,0,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, p.visualSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGrd;
        ctx.fill();
      } else {
        o.angle += o.speed * 0.005;
        const x = cx + Math.cos(o.angle) * p.orbitRadius * scale;
        const y = cy + Math.sin(o.angle) * p.orbitRadius * scale * 0.15;

        // Saturn rings
        if (p.id === 'saturn') {
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(1, 0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.visualSize + 10, p.visualSize + 10, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(240,192,128,0.5)';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        }

        // Planet
        const grad = ctx.createRadialGradient(x-2, y-2, 1, x, y, p.visualSize);
        grad.addColorStop(0, lightenColor(p.color, 60));
        grad.addColorStop(1, p.color);
        ctx.beginPath();
        ctx.arc(x, y, p.visualSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Glow for selected
        if ((selectedPlanetA && selectedPlanetA.id === p.id) ||
            (selectedPlanetB && selectedPlanetB.id === p.id)) {
          ctx.beginPath();
          ctx.arc(x, y, p.visualSize + 5, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    });

    // Draw distance line between selected planets
    if (selectedPlanetA && selectedPlanetB &&
        selectedPlanetA.id !== selectedPlanetB.id) {
      const orbitA = orbits.find(o => o.planet.id === selectedPlanetA.id);
      const orbitB = orbits.find(o => o.planet.id === selectedPlanetB.id);
      let ax, ay, bx, by;
      if (selectedPlanetA.id === 'sun') { ax = cx; ay = cy; }
      else {
        ax = cx + Math.cos(orbitA.angle) * selectedPlanetA.orbitRadius * scale;
        ay = cy + Math.sin(orbitA.angle) * selectedPlanetA.orbitRadius * scale * 0.15;
      }
      if (selectedPlanetB.id === 'sun') { bx = cx; by = cy; }
      else {
        bx = cx + Math.cos(orbitB.angle) * selectedPlanetB.orbitRadius * scale;
        by = cy + Math.sin(orbitB.angle) * selectedPlanetB.orbitRadius * scale * 0.15;
      }

      const dashOffset = Date.now() / 50 % 20;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(0,212,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    solarAnimFrame = requestAnimationFrame(draw);
  }
  draw();
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

// ---- Planet Grids ----
function buildPlanetGrids() {
  buildPlanetGrid('planet-grid-a', 'a');
  buildPlanetGrid('planet-grid-b', 'b');
}

function buildPlanetGrid(containerId, side) {
  const container = document.getElementById(containerId);
  PLANETS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'planet-btn';
    btn.id = `planet-${side}-${p.id}`;
    btn.innerHTML = `<span class="planet-emoji">${p.emoji}</span><span class="planet-name">${p.name}</span>`;
    btn.addEventListener('click', () => selectPlanet(p, side));
    container.appendChild(btn);
  });
}

function selectPlanet(planet, side) {
  // Deselect previous
  if (side === 'a') {
    if (selectedPlanetA) {
      const prev = document.getElementById(`planet-a-${selectedPlanetA.id}`);
      if (prev) prev.classList.remove('selected');
    }
    selectedPlanetA = planet;
  } else {
    if (selectedPlanetB) {
      const prev = document.getElementById(`planet-b-${selectedPlanetB.id}`);
      if (prev) prev.classList.remove('selected');
    }
    selectedPlanetB = planet;
  }

  document.getElementById(`planet-${side}-${planet.id}`).classList.add('selected');
  updateSolarDistance();
  renderPlanetDetail(planet, side);
}

function updateSolarDistance() {
  if (!selectedPlanetA || !selectedPlanetB) return;

  const distKm = getPlanetDistance(selectedPlanetA, selectedPlanetB);
  const distAU = Math.abs(selectedPlanetA.distFromSun - selectedPlanetB.distFromSun);
  const lmins = kmToLightMinutes(distKm);
  const lhours = kmToLightHours(distKm);

  const valEl = document.getElementById('solar-dist-val');
  const unitEl = document.getElementById('solar-dist-unit');
  const lightEl = document.getElementById('solar-dist-light');

  if (selectedPlanetA.id === selectedPlanetB.id) {
    valEl.textContent = '0';
    unitEl.textContent = 'km (같은 천체)';
    lightEl.textContent = '';
    return;
  }

  animateNumber(valEl, distKm, v => formatKm(v));
  unitEl.textContent = `(${distAU.toFixed(3)} AU)`;

  const lightText = distKm > 1e9
    ? `🚀 빛의 속도로 ${lhours}시간`
    : `🚀 빛의 속도로 ${lmins}분`;
  lightEl.textContent = lightText;
}

function animateNumber(el, target, formatter) {
  const start = 0;
  const duration = 800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatter(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = formatter(target);
  }
  requestAnimationFrame(update);
}

function renderPlanetDetail(planet, side) {
  const card = document.getElementById(`detail-card-${side}`);
  card.innerHTML = `
    <div class="detail-header">
      <div class="detail-planet-icon">${planet.emoji}</div>
      <div>
        <div class="detail-planet-name">${planet.name}</div>
        <div class="detail-planet-type">${planet.type}</div>
      </div>
    </div>
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;line-height:1.6;">
      ${planet.description}
    </p>
    <div class="detail-stats">
      <div class="stat-item">
        <div class="stat-label">지름</div>
        <div class="stat-value">${planet.diameter.toLocaleString()}<span class="stat-unit"> km</span></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">태양까지 거리</div>
        <div class="stat-value">${planet.distFromSun}<span class="stat-unit"> AU</span></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">공전 주기</div>
        <div class="stat-value" style="font-size:0.8rem">${planet.orbitalPeriod}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">자전 주기</div>
        <div class="stat-value" style="font-size:0.8rem">${planet.rotationPeriod}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">평균 온도</div>
        <div class="stat-value" style="font-size:0.8rem">${planet.avgTemp}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">위성 수</div>
        <div class="stat-value">${planet.moons}<span class="stat-unit">개</span></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">질량</div>
        <div class="stat-value" style="font-size:0.75rem">${planet.mass}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">중력</div>
        <div class="stat-value" style="font-size:0.8rem">${planet.gravity}</div>
      </div>
    </div>
    <div class="stat-item" style="margin-top:0.75rem">
      <div class="stat-label">대기 성분</div>
      <div class="stat-value" style="font-size:0.78rem;color:var(--text-secondary)">${planet.atmosphere}</div>
    </div>
  `;
  card.style.borderColor = planet.color;
  card.style.boxShadow = `0 0 20px ${planet.color}33`;
}

// ===================================================
// ---- COUNTRIES SECTION ----
// ===================================================
function initCountriesSection() {
  setupCountrySearch('a');
  setupCountrySearch('b');
  // 지도는 countries 섹션이 처음 보일 때 초기화
  const navBtn = document.getElementById('nav-countries');
  navBtn.addEventListener('click', () => {
    if (!worldMapInited) {
      worldMapInited = true;
      setTimeout(renderWorldMap, 50);
    }
  });
}

function setupCountrySearch(side) {
  const input = document.getElementById(`country-search-${side}`);
  const dropdown = document.getElementById(`country-dropdown-${side}`);

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { dropdown.classList.remove('open'); return; }

    const matches = COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q) ||
      c.continent.toLowerCase().includes(q)
    ).slice(0, 10);

    dropdown.innerHTML = matches.map(c =>
      `<div class="country-dropdown-item" data-id="${c.name}">
        <span>${c.flag}</span><span>${c.name}</span>
        <span style="color:var(--text-muted);font-size:0.8rem;margin-left:auto">${c.capital}</span>
      </div>`
    ).join('');

    dropdown.classList.toggle('open', matches.length > 0);

    dropdown.querySelectorAll('.country-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const country = COUNTRIES.find(c => c.name === item.dataset.id);
        selectCountry(country, side);
        input.value = country.name;
        dropdown.classList.remove('open');
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

function selectCountry(country, side) {
  if (side === 'a') selectedCountryA = country;
  else selectedCountryB = country;

  const flagEl = document.getElementById(`flag-${side}`);
  const infoEl = document.getElementById(`info-${side}`);

  flagEl.textContent = country.flag;
  infoEl.innerHTML = `
    <strong>${country.name}</strong>
    🏛 수도: ${country.capital}<br/>
    🌍 대륙: ${country.continent}<br/>
    📐 면적: ${country.area}<br/>
    👥 인구: ${Number(country.population).toLocaleString()}명<br/>
    💰 통화: ${country.currency}
  `;

  updateCountryDistance();
  updateWorldMap();
}

function updateCountryDistance() {
  if (!selectedCountryA || !selectedCountryB) return;

  const distKm = haversineDistance(
    selectedCountryA.lat, selectedCountryA.lng,
    selectedCountryB.lat, selectedCountryB.lng
  );

  const valEl = document.getElementById('country-dist-val');
  const subEl = document.getElementById('country-dist-sub');
  const travEl = document.getElementById('travel-times');

  animateNumber(valEl, distKm, v => Math.round(v).toLocaleString());
  subEl.textContent = `${selectedCountryA.capital} ↔ ${selectedCountryB.capital}`;

  // Travel times
  const planeHours = distKm / 900;
  const carHours = distKm / 100;
  const trainHours = distKm / 300;
  const walkHours = distKm / 5;

  travEl.innerHTML = `
    <div class="travel-item">
      <span class="ti-icon">✈️</span>
      <span>비행기</span>
      <span class="ti-val">${formatHours(planeHours)}</span>
    </div>
    <div class="travel-item">
      <span class="ti-icon">🚗</span>
      <span>자동차</span>
      <span class="ti-val">${formatHours(carHours)}</span>
    </div>
    <div class="travel-item">
      <span class="ti-icon">🚂</span>
      <span>기차</span>
      <span class="ti-val">${formatHours(trainHours)}</span>
    </div>
    <div class="travel-item">
      <span class="ti-icon">🚶</span>
      <span>도보</span>
      <span class="ti-val">${formatHours(walkHours)}</span>
    </div>
  `;
}

function formatHours(h) {
  if (h >= 24) {
    const days = Math.floor(h / 24);
    const rem = Math.round(h % 24);
    return `${days}일 ${rem}시간`;
  }
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}시간 ${mins}분`;
}

// ---- World Map ----
function renderWorldMap() {
  updateWorldMap();
}




// ===================================================
// ---- GALAXY SECTION ----
// ===================================================
function initGalaxySection() {
  buildGalaxyMap();
  buildGalaxyGrid();
}

function buildGalaxyMap() {
  const mapEl = document.getElementById('galaxy-map');
  const canvas = document.createElement('canvas');
  canvas.id = 'galaxy-canvas';
  canvas.width = 1000;
  canvas.height = 350;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  mapEl.appendChild(canvas);

  animateGalaxyMap(canvas);
}

function animateGalaxyMap(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Create background stars
  const bgStars = Array.from({length: 150}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5,
    op: Math.random() * 0.5 + 0.1,
  }));

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#020308';
    ctx.fillRect(0, 0, W, H);

    // Background stars
    bgStars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.op})`;
      ctx.fill();
    });

    // Draw galaxies
    GALAXIES.forEach(g => {
      const x = (g.x / 100) * W;
      const y = (g.y / 100) * H;
      const isSelected = selectedGalaxy && selectedGalaxy.id === g.id;
      const isSelected2 = selectedGalaxy2 && selectedGalaxy2.id === g.id;

      // Galaxy glow
      const r = g.id === 'milkyway' ? 40 : Math.max(15, g.diameterLy / 15000);
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, g.color + 'cc');
      grd.addColorStop(0.3, g.color + '66');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Selection ring
      if (isSelected || isSelected2) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#4a9eff' : '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label
      ctx.font = `${g.id === 'milkyway' ? 'bold 13' : '11'}px Outfit`;
      ctx.fillStyle = g.color;
      ctx.textAlign = 'center';
      ctx.fillText(g.emoji + ' ' + g.name, x, y + r + 18);
      ctx.textAlign = 'left';
    });

    // Draw distance line
    if (selectedGalaxy && selectedGalaxy2 && selectedGalaxy.id !== selectedGalaxy2.id) {
      const ax = (selectedGalaxy.x / 100) * W;
      const ay = (selectedGalaxy.y / 100) * H;
      const bx = (selectedGalaxy2.x / 100) * W;
      const by = (selectedGalaxy2.y / 100) * H;

      const t = Date.now() / 1000;
      const dashOff = t * 20 % 30;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -dashOff;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = 'rgba(0,212,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    galaxyAnimFrame = requestAnimationFrame(drawFrame);
  }

  // Handle canvas clicks
  canvas.style.cursor = 'pointer';
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    GALAXIES.forEach(g => {
      const x = (g.x / 100) * W;
      const y = (g.y / 100) * H;
      const r = g.id === 'milkyway' ? 40 : Math.max(20, g.diameterLy / 15000);
      const dist = Math.hypot(mx - x, my - y);
      if (dist < r + 15) {
        handleGalaxyClick(g);
      }
    });
  });

  drawFrame();
}

function buildGalaxyGrid() {
  const grid = document.getElementById('galaxy-grid');
  GALAXIES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'galaxy-card';
    card.id = `galaxy-card-${g.id}`;
    const distText = g.distFromMilkyWay === 0
      ? '우리 은하'
      : formatLightYear(g.distFromMilkyWay) + ' (우리 은하로부터)';

    card.innerHTML = `
      <div class="galaxy-card-header">
        <span class="galaxy-icon">${g.emoji}</span>
        <div>
          <div class="galaxy-name">${g.name}</div>
          <div class="galaxy-type">${g.type}</div>
        </div>
      </div>
      <div class="galaxy-dist-from-milky">${distText}</div>
    `;
    card.addEventListener('click', () => handleGalaxyClick(g));
    grid.appendChild(card);
  });
}

function handleGalaxyClick(galaxy) {
  if (!selectedGalaxy) {
    selectedGalaxy = galaxy;
    markGalaxyCard(galaxy.id, 'selected');
  } else if (selectedGalaxy.id === galaxy.id) {
    // Deselect
    markGalaxyCard(galaxy.id, '');
    selectedGalaxy = null;
    selectedGalaxy2 = null;
    updateGalaxyDetail();
    return;
  } else if (!selectedGalaxy2) {
    selectedGalaxy2 = galaxy;
    markGalaxyCard(galaxy.id, 'selected2');
  } else {
    // Replace second selection
    markGalaxyCard(selectedGalaxy2.id, '');
    selectedGalaxy2 = galaxy;
    markGalaxyCard(galaxy.id, 'selected2');
  }
  updateGalaxyDetail();
}

function markGalaxyCard(id, state) {
  const card = document.getElementById(`galaxy-card-${id}`);
  if (!card) return;
  card.classList.remove('selected', 'selected2');
  if (state) card.classList.add(state);
}

function updateGalaxyDetail() {
  const panel = document.getElementById('galaxy-detail-panel');

  if (!selectedGalaxy) {
    panel.innerHTML = '<div class="galaxy-detail-placeholder">은하를 선택하면 상세 정보가 표시됩니다</div>';
    return;
  }

  const g = selectedGalaxy;
  const g2 = selectedGalaxy2;

  let distHtml = '';
  if (g2) {
    const rawDist = getGalaxyDistance(g, g2);
    const distText = g.id === 'milkyway' || g2.id === 'milkyway'
      ? formatLightYear(Math.max(g.distFromMilkyWay, g2.distFromMilkyWay))
      : formatLightYear(rawDist);
    distHtml = `
      <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem">
        <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">두 은하 사이 거리</div>
        <div style="font-family:'Space Mono',monospace;font-size:1.8rem;color:#8b5cf6;font-weight:700">${distText}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:6px">
          ${g.emoji} ${g.name} ↔ ${g2.emoji} ${g2.name}
        </div>
        <div style="font-size:0.78rem;color:var(--accent-gold);margin-top:8px">
          🚀 빛의 속도로도 수백만~수천만 년
        </div>
      </div>
    `;
  }

  const galaxyInfoCard = (gal) => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid ${gal.color}33;border-radius:12px;padding:1.2rem;flex:1">
      <div style="font-size:2rem;margin-bottom:0.5rem">${gal.emoji}</div>
      <div style="font-size:1.1rem;font-weight:700;color:${gal.color};margin-bottom:0.25rem">${gal.name}</div>
      <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem">${gal.nameEn}</div>
      <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.6;margin-bottom:1rem">${gal.description}</div>
      <div class="galaxy-stats-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
        ${[
          ['유형', gal.type],
          ['지름', gal.diameter],
          ['별의 수', gal.stars],
          ['나이', gal.age],
          ['질량', gal.mass],
          ['블랙홀', gal.blackHole],
        ].map(([l, v]) => `
          <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:0.5rem">
            <div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">${l}</div>
            <div style="font-size:0.78rem;color:var(--accent-cyan);font-weight:600;font-family:'Space Mono',monospace">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  panel.innerHTML = `
    ${distHtml}
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap">
      ${galaxyInfoCard(g)}
      ${g2 ? galaxyInfoCard(g2) : '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.9rem">두 번째 은하를 선택하면 거리를 비교할 수 있습니다</div>'}
    </div>
  `;
}

// ===================================================
// ---- WORLD MAP REDRAW on country select ----
// ===================================================
function updateWorldMap() {
  const canvas = document.getElementById('world-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#060b1a';
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(100,160,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Continents
  const regions = [
    [35, -10, 71, 40, 'rgba(74,158,255,0.12)', '유럽'],
    [-35, -18, 37, 51, 'rgba(74,158,255,0.10)', '아프리카'],
    [5, 25, 77, 180, 'rgba(74,158,255,0.11)', '아시아'],
    [15, -170, 72, -55, 'rgba(74,158,255,0.10)', '북아메리카'],
    [-56, -81, 12, -34, 'rgba(74,158,255,0.10)', '남아메리카'],
    [-47, 113, -10, 153, 'rgba(74,158,255,0.10)', '호주'],
  ];

  regions.forEach(([lat1, lng1, lat2, lng2, color, label]) => {
    const x1 = ((lng1 + 180) / 360) * W;
    const y1 = ((90 - lat2) / 180) * H;
    const x2 = ((lng2 + 180) / 360) * W;
    const y2 = ((90 - lat1) / 180) * H;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(74,158,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.fillRect(x1, y1, x2-x1, y2-y1);
    ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    ctx.fillStyle = 'rgba(100,160,255,0.35)';
    ctx.font = '10px Outfit';
    ctx.fillText(window.ST ? window.ST(label) : label, x1 + 5, (y1+y2)/2);
  });

  // All country dots
  COUNTRIES.forEach(c => {
    const x = ((c.lng + 180) / 360) * W;
    const y = ((90 - c.lat) / 180) * H;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74,158,255,0.35)';
    ctx.fill();
  });

  // Highlight selected
  [selectedCountryA, selectedCountryB].forEach((c, i) => {
    if (!c) return;
    const x = ((c.lng + 180) / 360) * W;
    const y = ((90 - c.lat) / 180) * H;
    const color = i === 0 ? '#4a9eff' : '#ec4899';

    const grd = ctx.createRadialGradient(x, y, 2, x, y, 20);
    grd.addColorStop(0, color + '55');
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 11px Outfit';
    ctx.fillStyle = color;
    const lx = x + 10;
    const ly = y - 8;
    ctx.fillText(c.flag + ' ' + c.name, lx, ly);
  });

  // Great circle line
  if (selectedCountryA && selectedCountryB) {
    const ax = ((selectedCountryA.lng + 180) / 360) * W;
    const ay = ((90 - selectedCountryA.lat) / 180) * H;
    const bx = ((selectedCountryB.lng + 180) / 360) * W;
    const by = ((90 - selectedCountryB.lat) / 180) * H;

    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    const mx = (ax + bx) / 2;
    const my = Math.min(ay, by) - 40;
    ctx.quadraticCurveTo(mx, my, bx, by);
    ctx.strokeStyle = 'rgba(0,212,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label on line
    const distKm = haversineDistance(
      selectedCountryA.lat, selectedCountryA.lng,
      selectedCountryB.lat, selectedCountryB.lng
    );
    ctx.font = 'bold 12px Outfit';
    ctx.fillStyle = '#00d4ff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(distKm).toLocaleString()} km`, mx, my - 8);
    ctx.textAlign = 'left';
  }
}


// ===================================================
// ---- STARS SECTION ----
// ===================================================
function initStarsSection() {
  buildStarsLegend();
  buildStarsCatalog();
  setupStarSearch('a');
  setupStarSearch('b');
  initStarmapCanvas();

  // 뷰 모드 토글
  const btnTop = document.getElementById('view-top');
  const btnSide = document.getElementById('view-side');

  if (btnTop && btnSide) {
    btnTop.addEventListener('click', () => {
      starmapViewMode = 'top';
      btnTop.classList.add('active');
      btnSide.classList.remove('active');
    });
    btnSide.addEventListener('click', () => {
      starmapViewMode = 'side';
      btnSide.classList.add('active');
      btnTop.classList.remove('active');
    });
  }
}

// 스펙트럼별 별 색상 범례 빌드
function buildStarsLegend() {
  const legendRow = document.getElementById('starmap-legend-row');
  if (!legendRow) return;

  const types = [
    { label: 'O/B형 (청색 초거성)', color: '#80DEEA' },
    { label: 'A형 (백색 항성)', color: '#E0F2F1' },
    { label: 'F/G형 (황색 왜성/거성)', color: '#FFD700' },
    { label: 'K형 (오렌지색 거성)', color: '#FFB74D' },
    { label: 'M형 (적색 왜성/거성)', color: '#FF5252' }
  ];

  legendRow.innerHTML = types.map(t => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${t.color};box-shadow:0 0 6px ${t.color}"></div>
      <span>${t.label}</span>
    </div>
  `).join('');
}

// 별 목록 카탈로그 카드 빌드
function buildStarsCatalog() {
  const catalog = document.getElementById('stars-catalog');
  if (!catalog) return;

  catalog.innerHTML = STARS.map(s => {
    const distText = s.id === 'sun' ? '기준점' : `${s.distFromEarthLy} 광년`;
    return `
      <div class="galaxy-card star-catalog-card" id="star-card-${s.id}">
        <div class="galaxy-card-header">
          <span class="galaxy-icon" style="text-shadow: 0 0 10px ${s.color}">${s.emoji}</span>
          <div>
            <div class="galaxy-name">${s.name}</div>
            <div class="galaxy-type" style="color:var(--text-muted)">${s.type}</div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <div class="galaxy-dist-from-milky" style="background:${s.color}15; color:${s.color}; border:1px solid ${s.color}33">
            📍 ${distText}
          </div>
          <div style="display:flex; gap:4px;">
            <button class="planet-btn select-slot-btn" onclick="event.stopPropagation(); handleStarSelect('${s.id}', 'a')" style="padding:4px 8px; font-size:0.65rem;">별 A</button>
            <button class="planet-btn select-slot-btn" onclick="event.stopPropagation(); handleStarSelect('${s.id}', 'b')" style="padding:4px 8px; font-size:0.65rem;">별 B</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 글로벌 핸들러 등록 (HTML onclick 호환용)
window.handleStarSelect = function(starId, slot) {
  const star = STARS.find(s => s.id === starId);
  if (star) {
    handleStarClick(star, slot);
  }
};

// 별 검색 입력 및 드롭다운 셋업
function setupStarSearch(slot) {
  const input = document.getElementById(`star-search-${slot}`);
  const dropdown = document.getElementById(`star-dropdown-${slot}`);
  if (!input || !dropdown) return;

  input.addEventListener('focus', () => {
    showStarDropdown(input.value, dropdown, slot);
  });

  input.addEventListener('input', () => {
    showStarDropdown(input.value, dropdown, slot);
  });

  // 드롭다운 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

function showStarDropdown(query, dropdown, slot) {
  const cleanQuery = query.trim().toLowerCase();
  const filtered = STARS.filter(s => 
    s.name.toLowerCase().includes(cleanQuery) || 
    s.nameEn.toLowerCase().includes(cleanQuery)
  );

  if (filtered.length === 0) {
    dropdown.innerHTML = '<div class="country-dropdown-item" style="color:var(--text-muted)">검색 결과 없음</div>';
  } else {
    dropdown.innerHTML = filtered.map(s => `
      <div class="country-dropdown-item" data-id="${s.id}">
        <span>${s.emoji}</span>
        <strong>${s.name}</strong>
        <span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto;">${s.type}</span>
      </div>
    `).join('');

    dropdown.querySelectorAll('.country-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const starId = item.dataset.id;
        const star = STARS.find(s => s.id === starId);
        if (star) {
          handleStarClick(star, slot);
          input.value = star.name;
        }
        dropdown.classList.remove('open');
      });
    });
  }
  dropdown.classList.add('open');
}

// 별 클릭 / 선택 핸들러
function handleStarClick(star, slot) {
  if (slot === 'a') {
    if (selectedStarB && selectedStarB.id === star.id) {
      // B와 중복 선택 방지
      selectedStarB = null;
      updateSelectedStarDisplay('b', null);
      markStarCatalogCard('b', null);
    }
    selectedStarA = star;
    updateSelectedStarDisplay('a', star);
    markStarCatalogCard('a', star.id);
    const inputA = document.getElementById('star-search-a');
    if (inputA) inputA.value = star.name;
  } else {
    if (selectedStarA && selectedStarA.id === star.id) {
      // A와 중복 선택 방지
      selectedStarA = null;
      updateSelectedStarDisplay('a', null);
      markStarCatalogCard('a', null);
    }
    selectedStarB = star;
    updateSelectedStarDisplay('b', star);
    markStarCatalogCard('b', star.id);
    const inputB = document.getElementById('star-search-b');
    if (inputB) inputB.value = star.name;
  }
  updateStarDetail();
}

// 카탈로그 카드의 활성화 상태 보더 표시
function markStarCatalogCard(slot, activeId) {
  // 이전 해당 슬롯 클래스 제거
  document.querySelectorAll('.star-catalog-card').forEach(c => {
    c.classList.remove(slot === 'a' ? 'selected' : 'selected2');
  });

  if (activeId) {
    const activeCard = document.getElementById(`star-card-${activeId}`);
    if (activeCard) {
      activeCard.classList.add(slot === 'a' ? 'selected' : 'selected2');
    }
  }
}

// 검색창 하단 선택된 별 미리보기 업데이트
function updateSelectedStarDisplay(slot, star) {
  const container = document.getElementById(`star-selected-${slot}`);
  if (!container) return;

  if (!star) {
    container.innerHTML = '<div class="star-selected-placeholder">별을 선택하세요</div>';
    return;
  }

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; width:100%">
      <div style="font-size:2.2rem; text-shadow:0 0 10px ${star.color}">${star.emoji}</div>
      <div style="flex:1">
        <div style="font-weight:700; color:${star.color}; font-size:1.05rem;">${star.name}</div>
        <div style="font-size:0.75rem; color:var(--text-secondary);">${star.nameEn}</div>
      </div>
      <button class="planet-btn" onclick="clearStarSlot('${slot}')" style="padding:4px 8px; font-size:0.75rem; background:rgba(236,72,153,0.1); border-color:rgba(236,72,153,0.3); color:#ec4899;">비우기</button>
    </div>
  `;
}

window.clearStarSlot = function(slot) {
  if (slot === 'a') {
    selectedStarA = null;
    updateSelectedStarDisplay('a', null);
    markStarCatalogCard('a', null);
    const input = document.getElementById('star-search-a');
    if (input) input.value = '';
  } else {
    selectedStarB = null;
    updateSelectedStarDisplay('b', null);
    markStarCatalogCard('b', null);
    const input = document.getElementById('star-search-b');
    if (input) input.value = '';
  }
  updateStarDetail();
};

// 별 상세 정보 및 거리 디스플레이 업데이트
function updateStarDetail() {
  const panelA = document.getElementById('star-detail-a');
  const panelB = document.getElementById('star-detail-b');
  const distVal = document.getElementById('star-dist-val');
  const distUnit = document.getElementById('star-dist-unit');
  const distLight = document.getElementById('star-dist-light');
  const distKm = document.getElementById('star-dist-km');

  // 디테일 카드 템플릿 생성
  const renderDetailCard = (star) => `
    <div class="detail-header" style="border-color:${star.color}33">
      <div class="detail-planet-icon" style="color:${star.color}; text-shadow:0 0 15px ${star.color}">${star.emoji}</div>
      <div>
        <div class="detail-planet-name" style="background:none; -webkit-text-fill-color:initial; color:${star.color}">${star.name}</div>
        <div class="detail-planet-type">${star.type}</div>
      </div>
    </div>
    <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.5rem">${star.description}</p>
    <div class="detail-stats">
      <div class="stat-item">
        <div class="stat-label">지구로부터의 거리</div>
        <div class="stat-value" style="color:var(--accent-cyan)">${star.id === 'sun' ? '0 광년' : `${star.distFromEarthLy} 광년`}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">표면 온도</div>
        <div class="stat-value" style="color:var(--accent-gold)">${star.temp}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">항성 반경</div>
        <div class="stat-value">${star.radius}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">항성 질량</div>
        <div class="stat-value">${star.mass}</div>
      </div>
      <div class="stat-item" style="grid-column: span 2">
        <div class="stat-label">절대 광도</div>
        <div class="stat-value" style="color:var(--accent-purple)">${star.luminosity}</div>
      </div>
    </div>
  `;

  // 슬롯 A 카드 업데이트
  if (selectedStarA) {
    panelA.innerHTML = renderDetailCard(selectedStarA);
  } else {
    panelA.innerHTML = '<div class="galaxy-detail-placeholder" style="padding-top:4rem">출발지 별 A를 선택해주세요</div>';
  }

  // 슬롯 B 카드 업데이트
  if (selectedStarB) {
    panelB.innerHTML = renderDetailCard(selectedStarB);
  } else {
    panelB.innerHTML = '<div class="galaxy-detail-placeholder" style="padding-top:4rem">목적지 별 B를 선택해주세요</div>';
  }

  // 거리 연산 결과 출력
  if (selectedStarA && selectedStarB) {
    const ly = getStarDistance(selectedStarA, selectedStarB);
    const km = lightYearToKm(ly);

    distVal.innerText = ly === 0 ? '0' : ly.toFixed(2);
    distUnit.innerText = '광년 (Light Years)';

    if (ly === 0) {
      distLight.innerText = '동일한 천체입니다';
      distKm.innerText = '0 km';
    } else {
      // 빛 속도 소요시간 포맷
      let timeText = '';
      if (ly >= 1.0) {
        timeText = `🚀 빛의 속도로 이동 시 약 ${ly.toFixed(2)}년 소요`;
      } else {
        const days = ly * 365.25;
        if (days >= 1.0) {
          timeText = `🚀 빛의 속도로 이동 시 약 ${days.toFixed(1)}일 소요`;
        } else {
          const hours = days * 24;
          timeText = `🚀 빛의 속도로 이동 시 약 ${hours.toFixed(1)}시간 소요`;
        }
      }
      distLight.innerText = timeText;

      // km 포맷
      if (km >= 1e12) {
        distKm.innerText = `약 ${(km / 1e12).toFixed(2)}조 km`;
      } else {
        distKm.innerText = `약 ${(km / 1e8).toFixed(1)}억 km`;
      }
    }
  } else {
    distVal.innerText = '—';
    distUnit.innerText = '두 별을 선택하세요';
    distLight.innerText = '';
    distKm.innerText = '';
  }
}

// Canvas 인터랙티브 성도 초기화 및 애니메이션 루프
function initStarmapCanvas() {
  const canvas = document.getElementById('starmap-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let hoverStar = null;

  // 마우스 이동 감지
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    hoverStar = null;
    canvas.style.cursor = 'default';

    STARS.forEach(s => {
      const { sx, sy } = projectStar(s, W, H, cx, cy);
      const dist = Math.hypot(mx - sx, my - sy);
      if (dist < 12) {
        hoverStar = s;
        canvas.style.cursor = 'pointer';
      }
    });
  });

  // 마우스 클릭 시 별 선택
  canvas.addEventListener('click', () => {
    if (hoverStar) {
      // A가 없으면 A에, A가 있으면 B에, 둘 다 차 있으면 B에 할당
      if (!selectedStarA) {
        handleStarClick(hoverStar, 'a');
      } else if (!selectedStarB && selectedStarA.id !== hoverStar.id) {
        handleStarClick(hoverStar, 'b');
      } else if (selectedStarA.id === hoverStar.id) {
        handleStarClick(hoverStar, 'a'); // 선택 해제 유도
      } else {
        handleStarClick(hoverStar, 'b');
      }
    }
  });

  // 애니메이션 프레임 함수
  function draw() {
    if (currentSection !== 'stars') {
      starmapAnimFrame = requestAnimationFrame(draw);
      return;
    }

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // 배경
    ctx.fillStyle = '#020309';
    ctx.fillRect(0, 0, W, H);

    // 1. 성도 그리드 원 및 동심원 가이드라인
    ctx.strokeStyle = 'rgba(100, 160, 255, 0.04)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(W, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
    ctx.stroke();

    // 동심 거리가이드라인 동심원 (로그 스케일 투영 대응)
    // 10광년, 50광년, 500광년, 2500광년 반경 표시
    const guideRadii = [10, 50, 500, 2500];
    guideRadii.forEach(r => {
      const r_proj = logScaleRadius(r, W);
      ctx.beginPath();
      ctx.arc(cx, cy, r_proj, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 160, 255, 0.05)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(100, 160, 255, 0.25)';
      ctx.font = '9px Space Mono';
      ctx.fillText(`${r} ly`, cx + r_proj + 3, cy - 4);
    });

    // 2. 두 별이 선택되어 있는 경우 거리 연결선 그리기
    if (selectedStarA && selectedStarB) {
      const pA = projectStar(selectedStarA, W, H, cx, cy);
      const pB = projectStar(selectedStarB, W, H, cx, cy);

      const t = Date.now() / 1000;
      const dashOff = t * 15 % 20;

      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -dashOff;
      ctx.stroke();
      ctx.setLineDash([]);

      // 선 중앙에 거리 라벨 표시
      const mx = (pA.sx + pB.sx) / 2;
      const my = (pA.sy + pB.sy) / 2;
      const actualDist = getStarDistance(selectedStarA, selectedStarB);

      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 10px Space Mono';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(`${actualDist.toFixed(1)} ly`, mx, my - 6);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    // 3. 별들 그리기 (깊이에 따라 투명도/크기 조절)
    STARS.forEach(s => {
      const { sx, sy, depth } = projectStar(s, W, H, cx, cy);

      const isA = selectedStarA && selectedStarA.id === s.id;
      const isB = selectedStarB && selectedStarB.id === s.id;
      const isHover = hoverStar && hoverStar.id === s.id;

      // 깊이(depth)는 -1~1 범위. 1에 가까울수록 전면(밝음), -1에 가까울수록 후면(어두움)
      // 알파값 조절
      const alpha = Math.max(0.2, (depth + 1.5) / 2.5);
      const baseRadius = s.id === 'sun' ? 6 : (s.radius.includes('R☉') ? parseFloat(s.radius) : 1);
      // 스크린 상의 드로잉 반지름 산출
      let radius = 2 + Math.min(6, Math.log10(baseRadius + 1) * 3);
      
      // 별의 주위 후광 효과
      const glowGrd = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.5);
      glowGrd.addColorStop(0, `${s.color}${Math.floor(alpha * 120).toString(16).padStart(2, '0')}`);
      glowGrd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(sx, sy, radius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGrd;
      ctx.fill();

      // 알맹이 별 그리기
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = isHover ? '#ffffff' : s.color;
      ctx.fill();

      // 선택된 별 효과 링
      if (isA || isB) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = isA ? '#4a9eff' : '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 9px Outfit';
        ctx.fillStyle = isA ? '#4a9eff' : '#ec4899';
        ctx.fillText(window.ST ? window.ST(isA ? '별 A' : '별 B') : (isA ? '별 A' : '별 B'), sx + radius + 10, sy - 8);
      }

      // 텍스트 라벨 그리기 (태양과 핵심 별은 항시 표시, 나머지는 가까이 있거나 마우스 호버 시 표시)
      const showLabel = s.id === 'sun' || isA || isB || isHover || (depth > 0.4);
      if (showLabel) {
        ctx.fillStyle = isHover ? '#ffffff' : 'rgba(232, 240, 255, 0.7)';
        ctx.font = (isA || isB || isHover) ? 'bold 10px Outfit' : '9px Outfit';
        ctx.fillText(s.name, sx + radius + 4, sy + 3);
      }
    });

    // 4. 호버한 별 정보 툴팁 그리기
    if (hoverStar) {
      const p = projectStar(hoverStar, W, H, cx, cy);
      ctx.fillStyle = 'rgba(6, 11, 26, 0.9)';
      ctx.strokeStyle = 'rgba(100, 160, 255, 0.4)';
      ctx.lineWidth = 1;
      
      const boxW = 150;
      const boxH = 50;
      let bx = p.sx + 10;
      let by = p.sy - 60;

      // 캔버스 우하단 경계 보정
      if (bx + boxW > W) bx = p.sx - boxW - 10;
      if (by < 0) by = p.sy + 10;

      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Outfit';
      ctx.fillText(`${hoverStar.emoji} ${hoverStar.name}`, bx + 8, by + 16);

      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '9px Outfit';
      ctx.fillText(hoverStar.type, bx + 8, by + 28);
      ctx.fillText(`${window.ST ? window.ST('태양 기준:') : '태양 기준:'} ${hoverStar.id === 'sun' ? '0' : hoverStar.distFromEarthLy} ly`, bx + 8, by + 40);
    }

    starmapAnimFrame = requestAnimationFrame(draw);
  }

  // 루프 시작
  draw();
}

// 3D 위치를 2D Canvas 화면 좌표계로 로그 스케일 투영하는 헬퍼 함수
function projectStar(star, W, H, cx, cy) {
  // 태양으로부터의 거리 계산
  const r = Math.sqrt(star.x*star.x + star.y*star.y + star.z*star.z);
  let sx, sy, depth;

  if (r === 0) {
    // 태양은 정확히 가운데
    sx = cx;
    sy = cy;
    depth = 1.0;
  } else {
    // 방향 벡터
    const dx = star.x / r;
    const dy = star.y / r;
    const dz = star.z / r;

    // 로그 척도로 보정된 가상의 중심거리 (0~W/2 범위 내로 매핑)
    const r_log = logScaleRadius(r, W);

    if (starmapViewMode === 'top') {
      // 위에서 본 뷰 (X-Y 투사, Z는 깊이가 됨)
      sx = cx + dx * r_log;
      sy = cy - dy * r_log;
      // Z축 깊이 정규화 (-1 ~ 1)
      depth = -dz; // Z가 크면 화면 뒤쪽으로 가게 설정
    } else {
      // 옆에서 본 뷰 (X-Z 투사, Y는 깊이가 됨)
      sx = cx + dx * r_log;
      sy = cy - dz * r_log;
      // Y축 깊이 정규화 (-1 ~ 1)
      depth = -dy;
    }
  }

  return { sx, sy, depth };
}

// 로그 스케일 반지름 산출 (가까운 거리는 넓게, 먼 거리는 압축)
function logScaleRadius(ly, canvasWidth) {
  if (ly <= 0) return 0;
  // 최대 범위인 2600광년을 캔버스 가로절반의 약 80% 영역에 안착시킴
  const maxR = canvasWidth * 0.42;
  // 로그 공식 적용: log10(ly + 1)을 사용해 정규화
  // log10(2600 + 1) ≈ 3.415
  const maxLog = Math.log10(2601);
  const curLog = Math.log10(ly + 1);

  return (curLog / maxLog) * maxR;
}



