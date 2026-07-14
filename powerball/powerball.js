/* 파워볼 분석기 — 미국 파워볼 당첨번호 자동 수집 + 출현 빈도/출현율 + 핫콜드 + 번호 생성
 * 데이터: 뉴욕주 공개데이터 Socrata API (CORS 허용, API 키 불필요)
 *   https://data.ny.gov/resource/d6yy-54nr.json
 *   winning_numbers = "08 10 14 45 59 05" → 앞 5개 = 흰 공(1~69), 마지막 = 파워볼(1~26)
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const isEn = () => !!(window.I18N && window.I18N.lang === 'en');

  const WHITE_MAX = 69, PB_MAX = 26, WHITE_PICK = 5;
  const API = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=5000&$order=draw_date%20DESC';

  const state = {
    draws: [],        // [{date, white:[..5], pb, pp}], 최신순
    range: 100,
    pool: 'white',
    mode: 'hot',
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
    if (!raw) return null;
    const nums = raw.split(/\s+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
    if (nums.length < 6) return null;
    return {
      date: (r.draw_date || '').slice(0, 10),
      white: nums.slice(0, 5).sort((a, b) => a - b),
      pb: nums[5],
      pp: r.multiplier ? parseInt(r.multiplier, 10) : null,
    };
  }

  function showError() {
    $('pb-latest-balls').innerHTML =
      '<div class="pb-error">' + tr('pb.error') + '</div>';
  }

  /* ── 볼 렌더 ─────────────────────────────────────────── */
  function ball(n, type, extra) {
    const cls = type === 'pb' ? 'pb-ball red' : 'pb-ball';
    const sub = extra ? `<span class="pb-ball-sub">${extra}</span>` : '';
    return `<div class="${cls}"><span class="pb-ball-n">${String(n).padStart(2, '0')}</span>${sub}</div>`;
  }

  function renderLatest() {
    const d = state.draws[0];
    if (!d) return;
    $('pb-latest-date').textContent = fmtDate(d.date);
    let html = d.white.map(n => ball(n)).join('');
    html += '<span class="pb-plus">+</span>' + ball(d.pb, 'pb');
    $('pb-latest-balls').innerHTML = html;
    $('pb-latest-foot').textContent = d.pp
      ? tr('pb.powerplay') + ' ×' + d.pp
      : '';
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
    const pb = new Array(PB_MAX + 1).fill(0);
    draws.forEach(d => {
      d.white.forEach(n => { if (n >= 1 && n <= WHITE_MAX) white[n]++; });
      if (d.pb >= 1 && d.pb <= PB_MAX) pb[d.pb]++;
    });
    return { white, pb };
  }

  function recompute() {
    if (!state.loaded) return;
    const draws = activeDraws();
    const c = counts(draws);
    const n = draws.length;
    $('pb-range-hint').textContent =
      tr('pb.analyzing').replace('{n}', n) +
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
    const pr = rank(c.pb, PB_MAX);
    const byHot = (a, b) => b.c - a.c || a.n - b.n;
    const byCold = (a, b) => a.c - b.c || a.n - b.n;

    const hcBall = (o) => {
      const rate = n ? (o.c / n * 100) : 0;
      return `<div class="pb-hc-ball"><span class="pb-hc-num">${String(o.n).padStart(2,'0')}</span><span class="pb-hc-cnt">${o.c}${tr('pb.times')} · ${rate.toFixed(0)}%</span></div>`;
    };
    const pbHcBall = (o) => {
      const rate = n ? (o.c / n * 100) : 0;
      return `<div class="pb-hc-ball red"><span class="pb-hc-num">${String(o.n).padStart(2,'0')}</span><span class="pb-hc-cnt">${o.c}${tr('pb.times')} · ${rate.toFixed(0)}%</span></div>`;
    };

    $('pb-hot-white').innerHTML = [...wr].sort(byHot).slice(0, 6).map(hcBall).join('');
    $('pb-hot-pb').innerHTML = [...pr].sort(byHot).slice(0, 3).map(pbHcBall).join('');
    $('pb-cold-white').innerHTML = [...wr].sort(byCold).slice(0, 6).map(hcBall).join('');
    $('pb-cold-pb').innerHTML = [...pr].sort(byCold).slice(0, 3).map(pbHcBall).join('');
  }

  /* ── 히트맵 그리드 ──────────────────────────────────── */
  function renderGrid(c, n) {
    const isWhite = state.pool === 'white';
    const arr = isWhite ? c.white : c.pb;
    const max = isWhite ? WHITE_MAX : PB_MAX;
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
      let cell = isWhite ? 'pb-cell' : 'pb-cell red';
      if (filterOn) {
        if (cnt >= lo2 && cnt <= hi2) { cell += ' match'; matched++; }
        else cell += ' dimmed';
      }
      html += `<div class="${cell}" style="--t:${t.toFixed(3)}" title="${tr('pb.number')} ${i}: ${cnt}${tr('pb.times')} (${rate.toFixed(1)}%)">`
        + `<span class="pb-cell-n">${String(i).padStart(2,'0')}</span>`
        + `<span class="pb-cell-c">${cnt}</span>`
        + `<span class="pb-cell-r">${rate.toFixed(0)}%</span></div>`;
    }
    $('pb-grid').innerHTML = html;

    const countEl = $('pb-filter-count');
    if (countEl) countEl.textContent = filterOn ? tr('pb.matched').replace('{n}', matched) : '';
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
    // 흰 공 이론적 기대 출현율 = 5/69, 파워볼 = 1/26
    const items = [
      [tr('pb.statTotal'), total.toLocaleString() + tr('pb.draws')],
      [tr('pb.statRange'), n.toLocaleString() + tr('pb.draws')],
      [tr('pb.statPeriod'), fmtDate(oldest) + ' ~ ' + fmtDate(newest)],
      [tr('pb.statExpW'), (5 / WHITE_MAX * 100).toFixed(1) + '%'],
      [tr('pb.statExpP'), (1 / PB_MAX * 100).toFixed(1) + '%'],
    ];
    $('pb-stats').innerHTML = items.map(([k, v]) =>
      `<div class="pb-stat"><span class="pb-stat-k">${k}</span><span class="pb-stat-v">${v}</span></div>`
    ).join('');
  }

  /* ── 최근 회차 표 ──────────────────────────────────── */
  function renderRecent() {
    const rows = state.draws.slice(0, 15).map(d => {
      const w = d.white.map(n => `<span class="pb-mini">${String(n).padStart(2,'0')}</span>`).join('');
      return `<tr><td>${fmtDate(d.date)}</td><td class="pb-mini-row">${w}</td>`
        + `<td><span class="pb-mini red">${String(d.pb).padStart(2,'0')}</span></td>`
        + `<td>${d.pp ? '×' + d.pp : '—'}</td></tr>`;
    }).join('');
    $('pb-recent-body').innerHTML = rows;
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

  function generate() {
    if (!state.loaded) return;
    const c = counts(activeDraws());
    const white = weightedPick(weightsFor(c.white, WHITE_MAX, state.mode), WHITE_PICK);
    const pb = weightedPick(weightsFor(c.pb, PB_MAX, state.mode), 1)[0];
    let html = white.map(n => ball(n)).join('');
    html += '<span class="pb-plus">+</span>' + ball(pb, 'pb');
    $('pb-gen-out').innerHTML = html;
  }

  /* ── 이벤트 ─────────────────────────────────────────── */
  $('pb-range-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#pb-range-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    const v = b.getAttribute('data-range');
    state.range = v === 'all' ? 'all' : parseInt(v, 10);
    recompute();
  });

  $('pb-pool-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#pb-pool-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.pool = b.getAttribute('data-pool');
    refreshGrid();
  });

  function readFilter() {
    const parse = (v) => { const n = parseInt(v, 10); return isNaN(n) || n < 0 ? null : n; };
    state.fmin = parse($('pb-filter-min').value);
    state.fmax = parse($('pb-filter-max').value);
    refreshGrid();
  }
  $('pb-filter-min').addEventListener('input', readFilter);
  $('pb-filter-max').addEventListener('input', readFilter);
  $('pb-filter-clear').addEventListener('click', () => {
    $('pb-filter-min').value = '';
    $('pb-filter-max').value = '';
    state.fmin = state.fmax = null;
    refreshGrid();
  });

  $('pb-mode-row').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-mode-btn'); if (!b) return;
    document.querySelectorAll('#pb-mode-row .pb-mode-btn').forEach(x => x.classList.toggle('active', x === b));
    state.mode = b.getAttribute('data-mode');
  });

  $('pb-gen-btn').addEventListener('click', generate);

  window.addEventListener('langchange', () => {
    if (state.loaded) { renderLatest(); renderRecent(); recompute(); }
  });

  load();
});
