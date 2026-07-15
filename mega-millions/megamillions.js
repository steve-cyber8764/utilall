/* 메가 밀리언 분석기 — 미국 Mega Millions 당첨번호 자동 수집 + 출현 빈도/출현율 + 핫콜드 + 번호 생성
 * 데이터: 뉴욕주 공개데이터 Socrata API (CORS 허용, API 키 불필요)
 *   https://data.ny.gov/resource/5xaw-6ayf.json
 *   winning_numbers = "02 39 44 46 56" (흰 공 5개, 1~70), mega_ball = "23" (메가볼, 1~24)
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const isEn = () => !!(window.I18N && window.I18N.lang === 'en');

  const WHITE_MAX = 70, MEGA_MAX = 24, WHITE_PICK = 5;
  const API = 'https://data.ny.gov/resource/5xaw-6ayf.json?$limit=5000&$order=draw_date%20DESC';

  const state = {
    draws: [],        // [{date, white:[..5], mega}], 최신순
    range: 100,
    pool: 'white',
    mode: 'hot',
    genCount: 1,  // 선택한 게임 수 (1~5)
    sets: [],     // 생성된 게임 결과 보존 [{white:[5], mega}] — '번호 생성' 때만 갱신
    fmin: null,   // 출현 횟수 필터 최소
    fmax: null,   // 출현 횟수 필터 최대
    loaded: false,
  };

  /* ── 데이터 로드 ──────────────────────────────────────── */
  async function load() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rows = await res.json();
      state.draws = rows.map(parseRow).filter(Boolean);
      if (!state.draws.length) throw new Error('empty');
      state.loaded = true;
      renderLatest();
      renderRecent();
      recompute();
    } catch (e) {
      showError();
    }
  }

  function parseRow(r) {
    const raw = (r.winning_numbers || '').trim();
    const mega = parseInt(r.mega_ball, 10);
    if (!raw || isNaN(mega)) return null;
    const nums = raw.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
    if (nums.length < 5) return null;
    return {
      date: (r.draw_date || '').slice(0, 10),
      white: nums.slice(0, 5).sort((a, b) => a - b),
      mega: mega,
    };
  }

  function showError() {
    $('mm-latest-balls').innerHTML =
      '<div class="pb-error">' + tr('mm.error') + '</div>';
  }

  /* ── 볼 렌더 ─────────────────────────────────────────── */
  function ball(n, type) {
    const cls = type === 'mega' ? 'pb-ball gold' : 'pb-ball';
    return `<div class="${cls}"><span class="pb-ball-n">${String(n).padStart(2, '0')}</span></div>`;
  }

  function renderLatest() {
    const d = state.draws[0];
    if (!d) return;
    $('mm-latest-date').textContent = fmtDate(d.date);
    let html = d.white.map(n => ball(n)).join('');
    html += '<span class="pb-plus">+</span>' + ball(d.mega, 'mega');
    $('mm-latest-balls').innerHTML = html;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, day] = iso.split('-');
    if (isEn()) {
      const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${mn[+m - 1]} ${+day}, ${y}`;
    }
    return `${y}년 ${+m}월 ${+day}일`;
  }

  /* ── 빈도 계산 ───────────────────────────────────────── */
  function activeDraws() {
    if (state.range === 'all') return state.draws;
    return state.draws.slice(0, Math.min(state.range, state.draws.length));
  }

  function counts(draws) {
    const white = new Array(WHITE_MAX + 1).fill(0);
    const mega = new Array(MEGA_MAX + 1).fill(0);
    draws.forEach(d => {
      d.white.forEach(n => { if (n >= 1 && n <= WHITE_MAX) white[n]++; });
      if (d.mega >= 1 && d.mega <= MEGA_MAX) mega[d.mega]++;
    });
    return { white, mega };
  }

  function recompute() {
    if (!state.loaded) return;
    const draws = activeDraws();
    const c = counts(draws);
    const n = draws.length;
    $('mm-range-hint').textContent =
      tr('mm.analyzing').replace('{n}', n) +
      (draws.length ? ' · ' + fmtDate(draws[draws.length - 1].date) + ' ~ ' + fmtDate(draws[0].date) : '');
    renderHotCold(c, n);
    renderGrid(c, n);
    renderStats(c, n);
  }

  /* ── 핫 / 콜드 ──────────────────────────────────────── */
  function rank(arr, max) {
    const list = [];
    for (let i = 1; i <= max; i++) list.push({ n: i, c: arr[i] });
    return list;
  }

  function renderHotCold(c, n) {
    const wr = rank(c.white, WHITE_MAX);
    const mr = rank(c.mega, MEGA_MAX);
    const byHot = (a, b) => b.c - a.c || a.n - b.n;
    const byCold = (a, b) => a.c - b.c || a.n - b.n;

    const hcBall = (o) => {
      const rate = n ? (o.c / n * 100) : 0;
      return `<div class="pb-hc-ball"><span class="pb-hc-num">${String(o.n).padStart(2,'0')}</span><span class="pb-hc-cnt">${o.c}${tr('mm.times')} · ${rate.toFixed(0)}%</span></div>`;
    };
    const megaHcBall = (o) => {
      const rate = n ? (o.c / n * 100) : 0;
      return `<div class="pb-hc-ball gold"><span class="pb-hc-num">${String(o.n).padStart(2,'0')}</span><span class="pb-hc-cnt">${o.c}${tr('mm.times')} · ${rate.toFixed(0)}%</span></div>`;
    };

    $('mm-hot-white').innerHTML = [...wr].sort(byHot).slice(0, 6).map(hcBall).join('');
    $('mm-hot-mega').innerHTML = [...mr].sort(byHot).slice(0, 3).map(megaHcBall).join('');
    $('mm-cold-white').innerHTML = [...wr].sort(byCold).slice(0, 6).map(hcBall).join('');
    $('mm-cold-mega').innerHTML = [...mr].sort(byCold).slice(0, 3).map(megaHcBall).join('');
  }

  /* ── 히트맵 그리드 ──────────────────────────────────── */
  function renderGrid(c, n) {
    const isWhite = state.pool === 'white';
    const arr = isWhite ? c.white : c.mega;
    const max = isWhite ? WHITE_MAX : MEGA_MAX;
    let hi = 0, lo = Infinity;
    for (let i = 1; i <= max; i++) { if (arr[i] > hi) hi = arr[i]; if (arr[i] < lo) lo = arr[i]; }
    if (!isFinite(lo)) lo = 0;

    const filterOn = state.fmin !== null || state.fmax !== null;
    const lo2 = state.fmin !== null ? state.fmin : -Infinity;
    const hi2 = state.fmax !== null ? state.fmax : Infinity;
    let matched = 0;

    let html = '';
    for (let i = 1; i <= max; i++) {
      const cnt = arr[i];
      const rate = n ? (cnt / n * 100) : 0;
      const t = hi > lo ? (cnt - lo) / (hi - lo) : 0; // 0~1
      let cell = isWhite ? 'pb-cell' : 'pb-cell gold';
      if (filterOn) {
        if (cnt >= lo2 && cnt <= hi2) { cell += ' match'; matched++; }
        else cell += ' dimmed';
      }
      html += `<div class="${cell}" style="--t:${t.toFixed(3)}" title="${tr('mm.number')} ${i}: ${cnt}${tr('mm.times')} (${rate.toFixed(1)}%)">`
        + `<span class="pb-cell-n">${String(i).padStart(2,'0')}</span>`
        + `<span class="pb-cell-c">${cnt}</span>`
        + `<span class="pb-cell-r">${rate.toFixed(0)}%</span></div>`;
    }
    $('mm-grid').innerHTML = html;

    const countEl = $('mm-filter-count');
    if (countEl) countEl.textContent = filterOn ? tr('mm.matched').replace('{n}', matched) : '';
  }

  function refreshGrid() {
    if (!state.loaded) return;
    const draws = activeDraws();
    renderGrid(counts(draws), draws.length);
  }

  /* ── 통계 요약 ──────────────────────────────────────── */
  function renderStats(c, n) {
    const total = state.draws.length;
    const oldest = total ? state.draws[total - 1].date : '';
    const newest = total ? state.draws[0].date : '';
    // 흰 공 이론적 기대 출현율 = 5/70, 메가볼 = 1/24
    const items = [
      [tr('mm.statTotal'), total.toLocaleString() + tr('mm.draws')],
      [tr('mm.statRange'), n.toLocaleString() + tr('mm.draws')],
      [tr('mm.statPeriod'), fmtDate(oldest) + ' ~ ' + fmtDate(newest)],
      [tr('mm.statExpW'), (5 / WHITE_MAX * 100).toFixed(1) + '%'],
      [tr('mm.statExpP'), (1 / MEGA_MAX * 100).toFixed(1) + '%'],
    ];
    $('mm-stats').innerHTML = items.map(([k, v]) =>
      `<div class="pb-stat"><span class="pb-stat-k">${k}</span><span class="pb-stat-v">${v}</span></div>`
    ).join('');
  }

  /* ── 최근 회차 표 ──────────────────────────────────── */
  function renderRecent() {
    const rows = state.draws.slice(0, 15).map(d => {
      const w = d.white.map(n => `<span class="pb-mini">${String(n).padStart(2,'0')}</span>`).join('');
      return `<tr><td>${fmtDate(d.date)}</td><td class="pb-mini-row">${w}</td>`
        + `<td><span class="pb-mini gold">${String(d.mega).padStart(2,'0')}</span></td></tr>`;
    }).join('');
    $('mm-recent-body').innerHTML = rows;
  }

  /* ── 번호 생성 (재미용) ─────────────────────────────── */
  function weightedPick(weights, k) {
    // weights: [{n, w}] · w>0 · 중복 없이 k개 선택
    const pool = weights.map(o => ({ n: o.n, w: Math.max(o.w, 1e-6) }));
    const out = [];
    for (let i = 0; i < k && pool.length; i++) {
      const total = pool.reduce((s, o) => s + o.w, 0);
      let r = Math.random() * total, idx = 0;
      for (; idx < pool.length; idx++) { r -= pool[idx].w; if (r <= 0) break; }
      if (idx >= pool.length) idx = pool.length - 1;
      out.push(pool[idx].n);
      pool.splice(idx, 1);
    }
    return out.sort((a, b) => a - b);
  }

  function weightsFor(arr, max, mode) {
    const list = [];
    let maxc = 0;
    for (let i = 1; i <= max; i++) maxc = Math.max(maxc, arr[i]);
    for (let i = 1; i <= max; i++) {
      const c = arr[i];
      let w;
      if (mode === 'hot') w = c + 1;                    // 자주 나온 번호 선호
      else if (mode === 'cold') w = (maxc - c) + 1;      // 뜸한 번호 선호
      else if (mode === 'balanced') w = Math.sqrt(c + 1); // 완만한 가중
      else w = 1;                                        // random = 균등
      list.push({ n: i, w });
    }
    return list;
  }

  // 한 게임(흰 공 5 + 메가볼 1) 생성
  function makeSet(c) {
    return {
      white: weightedPick(weightsFor(c.white, WHITE_MAX, state.mode), WHITE_PICK),
      mega: weightedPick(weightsFor(c.mega, MEGA_MAX, state.mode), 1)[0],
    };
  }

  function setLabel(idx, show) {
    return show ? `<span class="pb-gen-set-label">${tr('mm.set').replace('{n}', idx + 1)}</span>` : '';
  }
  function setRow(set, idx, show) {
    const balls = set.white.map(n => ball(n)).join('') + '<span class="pb-plus">+</span>' + ball(set.mega, 'mega');
    return `<div class="pb-gen-set">${setLabel(idx, show)}<div class="pb-gen-set-balls">${balls}</div></div>`;
  }
  function blankRow(idx, show) {
    const balls = '<div class="pb-ball empty"></div>'.repeat(WHITE_PICK)
      + '<span class="pb-plus">+</span><div class="pb-ball gold empty"></div>';
    return `<div class="pb-gen-set">${setLabel(idx, show)}<div class="pb-gen-set-balls">${balls}</div></div>`;
  }

  // 결과 칸 렌더: 생성된 세트는 유지, 늘어난 슬롯은 빈칸, 줄어든 줄은 숨김(데이터는 보존)
  function renderGenOut() {
    const out = $('mm-gen-out');
    if (!state.sets.length) { out.innerHTML = `<div class="pb-loading">${tr('mm.genHint')}</div>`; return; }
    const multi = state.genCount > 1;
    let html = '';
    for (let i = 0; i < state.genCount; i++) {
      html += state.sets[i] ? setRow(state.sets[i], i, multi) : blankRow(i, multi);
    }
    out.innerHTML = html;
  }

  // '번호 생성' — 선택한 게임 수만큼 전부 새로 생성(초과분 폐기)
  function generate() {
    if (!state.loaded) return;
    const c = counts(activeDraws());
    const arr = [];
    for (let g = 0; g < state.genCount; g++) arr.push(makeSet(c));
    state.sets = arr;
    renderGenOut();
  }

  /* ── 이벤트 ─────────────────────────────────────────── */
  $('mm-range-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#mm-range-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    const v = b.getAttribute('data-range');
    state.range = v === 'all' ? 'all' : parseInt(v, 10);
    recompute();
  });

  $('mm-pool-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#mm-pool-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.pool = b.getAttribute('data-pool');
    refreshGrid();
  });

  function readFilter() {
    const parse = (v) => { const n = parseInt(v, 10); return isNaN(n) || n < 0 ? null : n; };
    state.fmin = parse($('mm-filter-min').value);
    state.fmax = parse($('mm-filter-max').value);
    refreshGrid();
  }
  $('mm-filter-min').addEventListener('input', readFilter);
  $('mm-filter-max').addEventListener('input', readFilter);
  $('mm-filter-clear').addEventListener('click', () => {
    $('mm-filter-min').value = '';
    $('mm-filter-max').value = '';
    state.fmin = state.fmax = null;
    refreshGrid();
  });

  $('mm-mode-row').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-mode-btn'); if (!b) return;
    document.querySelectorAll('#mm-mode-row .pb-mode-btn').forEach(x => x.classList.toggle('active', x === b));
    state.mode = b.getAttribute('data-mode');
    state.sets = [];   // 모드가 바뀌면 이전 번호는 무효 → 비우고 '번호 생성'을 눌러야 나옴
    renderGenOut();
  });

  $('mm-count-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#mm-count-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.genCount = parseInt(b.getAttribute('data-count'), 10) || 1;
    renderGenOut();   // 표시만 갱신(생성된 세트는 보존) — 늘리면 빈칸, 줄이면 숨김
  });

  $('mm-gen-btn').addEventListener('click', generate);

  window.addEventListener('langchange', () => {
    if (state.loaded) { renderLatest(); renderRecent(); recompute(); renderGenOut(); }
  });

  load();
});
