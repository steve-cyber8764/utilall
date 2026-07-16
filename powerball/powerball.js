/* 파워볼 분석기 — 미국 파워볼 당첨번호 자동 수집 + 출현 빈도/출현율 + 핫콜드 + 번호 생성
 * 데이터: 뉴욕주 공개데이터 Socrata API (CORS 허용, API 키 불필요)
 *   https://data.ny.gov/resource/d6yy-54nr.json
 *   winning_numbers = "08 10 14 45 59 05" → 앞 5개 = 흰 공(1~69), 마지막 = 파워볼(1~26)
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const isEn = () => !!(window.I18N && window.I18N.lang === 'en');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const WHITE_MAX = 69, PB_MAX = 26, WHITE_PICK = 5;
  const API = 'https://data.ny.gov/resource/d6yy-54nr.json?$limit=5000&$order=draw_date%20DESC';

  const state = {
    draws: [],        // [{date, white:[..5], pb, pp}], 최신순
    range: 100,
    pool: 'white',
    mode: 'hot',
    genCount: 1,  // 선택한 게임 수 (1~5)
    sets: [],     // 생성된 게임 결과 보존 [{white:[5], pb}] — '번호 생성' 때만 갱신
    fmin: null,   // 출현 횟수 필터 최소
    fmax: null,   // 출현 횟수 필터 최대
    jackpot: null, // 예상 당첨금 {jackpot, cash}
    usdkrw: null,  // USD→KRW 환율
    user: null,    // 로그인 사용자
    saved: [],     // 마이넘버 목록
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
      loadJackpot();
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

  /* ── 예상 당첨금(잭팟) ──────────────────────────────── */
  function fmtUsd(n) {
    if (n == null) return '';
    if (n >= 1e9) return '$' + parseFloat((n / 1e9).toFixed(2)) + ' Billion';
    if (n >= 1e6) return '$' + parseFloat((n / 1e6).toFixed(1)) + ' Million';
    return '$' + Math.round(n).toLocaleString();
  }
  function fmtKrw(n) {
    n = Math.round(n);
    const jo = Math.floor(n / 1e12), eok = Math.floor((n % 1e12) / 1e8);
    const p = [];
    if (jo) p.push(jo.toLocaleString() + '조');
    if (eok) p.push(eok.toLocaleString() + '억');
    if (!p.length) p.push(Math.max(1, Math.round(n / 1e4)).toLocaleString() + '만');
    return p.join(' ') + ' 원';
  }
  async function loadJackpot() {
    try {
      const res = await fetch('/api/jackpots');
      if (!res.ok) return;
      const d = await res.json();
      state.jackpot = d.powerball;
      state.usdkrw = d.usdkrw;
      renderJackpot();
    } catch (e) { /* 백엔드 없거나 실패 시 조용히 숨김 */ }
  }
  function renderJackpot() {
    const el = $('pb-jackpot');
    if (!el) return;
    const j = state.jackpot;
    if (!j || !j.jackpot) { el.innerHTML = ''; return; }
    const rate = state.usdkrw;
    const usdMain = fmtUsd(j.jackpot), usdCash = j.cash ? fmtUsd(j.cash) : '';
    let html = `<div class="pb-jp-label">💰 ${tr('pb.jackpotLabel')}</div>`;
    if (isEn() || !rate) {
      html += `<div class="pb-jp-amount">${usdMain}</div>`;
      if (usdCash) html += `<div class="pb-jp-cash">${tr('pb.jackpotCash')} ${usdCash}</div>`;
    } else {
      html += `<div class="pb-jp-amount">${tr('pb.approx')} ${fmtKrw(j.jackpot * rate)}</div>`;
      html += `<div class="pb-jp-usd">${usdMain}</div>`;
      if (j.cash) html += `<div class="pb-jp-cash">${tr('pb.jackpotCash')} ${tr('pb.approx')} ${fmtKrw(j.cash * rate)} <span class="pb-jp-usd2">(${usdCash})</span></div>`;
      html += `<div class="pb-jp-rate">${tr('pb.jackpotRate').replace('{r}', rate.toLocaleString(undefined, { maximumFractionDigits: 2 }))}</div>`;
    }
    el.innerHTML = html;
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

  // 한 게임(흰 공 5 + 파워볼 1) 생성
  function makeSet(c) {
    return {
      white: weightedPick(weightsFor(c.white, WHITE_MAX, state.mode), WHITE_PICK),
      pb: weightedPick(weightsFor(c.pb, PB_MAX, state.mode), 1)[0],
    };
  }

  function setLabel(idx, show) {
    return show ? `<span class="pb-gen-set-label">${tr('pb.set').replace('{n}', idx + 1)}</span>` : '';
  }
  function setRow(set, idx, show) {
    const balls = set.white.map(n => ball(n)).join('') + '<span class="pb-plus">+</span>' + ball(set.pb, 'pb');
    const saveBtn = state.user ? `<button class="pb-save" data-save="${idx}" title="${tr('pb.saveBtn')}">💾</button>` : '';
    return `<div class="pb-gen-set">${setLabel(idx, show)}<div class="pb-gen-set-balls">${balls}${saveBtn}</div></div>`;
  }
  function blankRow(idx, show) {
    const balls = '<div class="pb-ball empty"></div>'.repeat(WHITE_PICK)
      + '<span class="pb-plus">+</span><div class="pb-ball red empty"></div>';
    return `<div class="pb-gen-set">${setLabel(idx, show)}<div class="pb-gen-set-balls">${balls}</div></div>`;
  }

  // 결과 칸 렌더: 생성된 세트는 유지, 늘어난 슬롯은 빈칸, 줄어든 줄은 숨김(데이터는 보존)
  function renderGenOut() {
    const out = $('pb-gen-out');
    if (!state.sets.length) { out.innerHTML = `<div class="pb-loading">${tr('pb.genHint')}</div>`; return; }
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

  /* ── 마이넘버 (로그인 저장) ─────────────────────────── */
  const errMsg = (code) => {
    const v = tr('pb.err.' + code);
    return v === 'pb.err.' + code ? tr('pb.err.server_error') : v;
  };

  async function loadAuth() {
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      state.user = (await res.json()).user || null;
    } catch (e) { state.user = null; }
    if (state.user) await loadSaved();
    renderAuthBar();
    renderMyNumbers();
    renderGenOut(); // 로그인 상태에 따라 저장 버튼 표시
  }

  function renderAuthBar() {
    const el = $('pb-authbar');
    if (!el) return;
    if (state.user) {
      el.innerHTML =
        `<span class="pb-auth-user">👤 ${esc(state.user.name || state.user.email)}</span>` +
        `<button class="pb-auth-btn" data-auth="logout">${tr('pb.logout')}</button>`;
    } else {
      el.innerHTML =
        `<form class="pb-auth-login" data-auth="loginform">
           <input type="email" name="email" class="pb-auth-input" placeholder="${esc(tr('pb.emailPh'))}" autocomplete="email" required>
           <input type="password" name="password" class="pb-auth-input" placeholder="${esc(tr('pb.pwPh'))}" autocomplete="current-password" required>
           <button type="submit" class="pb-auth-btn primary">${tr('pb.login')}</button>
           <a class="pb-auth-link" href="/board/">${tr('pb.signupLink')}</a>
           <span class="pb-auth-msg" id="pb-auth-msg"></span>
         </form>`;
    }
  }

  async function doLogin(form) {
    const email = (form.querySelector('input[name="email"]') || {}).value.trim();
    const password = (form.querySelector('input[name="password"]') || {}).value;
    const btn = form.querySelector('button[type="submit"]');
    const msg = $('pb-auth-msg');
    btn.disabled = true;
    try {
      const res = await fetch('/api/login', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.user) {
        state.user = d.user;
        await loadSaved();
        renderAuthBar(); renderMyNumbers(); renderGenOut();
      } else { if (msg) msg.textContent = errMsg(d.error); btn.disabled = false; }
    } catch (e) { btn.disabled = false; }
  }
  async function doLogout() {
    try { await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }); } catch (e) { /* noop */ }
    state.user = null; state.saved = [];
    renderAuthBar(); renderMyNumbers(); renderGenOut();
  }
  async function loadSaved() {
    try {
      const res = await fetch('/api/mynumbers?game=powerball', { credentials: 'same-origin' });
      if (res.ok) state.saved = (await res.json()).saved || [];
    } catch (e) { /* noop */ }
  }

  async function saveSet(idx, btn) {
    const set = state.sets[idx];
    if (!set || !state.user) return;
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/api/mynumbers', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'powerball', white: set.white, special: set.pb }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.saved) {
        state.saved.unshift(d.saved);
        renderMyNumbers();
        if (btn) { btn.textContent = '✓'; btn.classList.add('done'); btn.title = tr('pb.saved'); }
      } else { if (btn) btn.disabled = false; alert(errMsg(d.error)); }
    } catch (e) { if (btn) btn.disabled = false; }
  }

  async function deleteSaved(id) {
    try {
      const res = await fetch('/api/mynumbers/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'same-origin' });
      if (res.ok) { state.saved = state.saved.filter(s => String(s.id) !== String(id)); renderMyNumbers(); }
    } catch (e) { /* noop */ }
  }

  function renderMyNumbers() {
    const el = $('pb-mynumbers');
    if (!el) return;
    if (!state.user) {
      el.innerHTML = `<div class="pb-mine-hint">${tr('pb.loginToSave')}</div>`;
      return;
    }
    const rows = state.saved.map(s => {
      const balls = s.white.map(n => ball(n)).join('') + '<span class="pb-plus">+</span>' + ball(s.special, 'pb');
      return `<div class="pb-mine-row"><div class="pb-gen-set-balls">${balls}</div><button class="pb-mine-del" data-del="${s.id}" title="${tr('pb.deleteNum')}">✕</button></div>`;
    }).join('');
    el.innerHTML =
      `<div class="pb-mine-head"><h3>${tr('pb.myNumbers')}</h3><span class="pb-mine-count">${state.saved.length ? '(' + state.saved.length + ')' : ''}</span></div>`
      + (state.saved.length ? `<div class="pb-mine-list">${rows}</div>` : `<div class="pb-mine-empty">${tr('pb.myNumbersEmpty')}</div>`);
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
    state.sets = [];   // 모드가 바뀌면 이전 번호는 무효 → 비우고 '번호 생성'을 눌러야 나옴
    renderGenOut();
  });

  $('pb-count-seg').addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#pb-count-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.genCount = parseInt(b.getAttribute('data-count'), 10) || 1;
    renderGenOut();   // 표시만 갱신(생성된 세트는 보존) — 늘리면 빈칸, 줄이면 숨김
  });

  $('pb-gen-btn').addEventListener('click', generate);

  $('pb-gen-out').addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]'); if (!b || b.disabled) return;
    saveSet(parseInt(b.getAttribute('data-save'), 10), b);
  });
  $('pb-mynumbers').addEventListener('click', (e) => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    if (confirm(tr('pb.confirmDelNum'))) deleteSaved(b.getAttribute('data-del'));
  });

  $('pb-authbar').addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-auth="loginform"]'); if (!f) return;
    e.preventDefault(); doLogin(f);
  });
  $('pb-authbar').addEventListener('click', (e) => {
    if (e.target.closest('[data-auth="logout"]')) doLogout();
  });

  window.addEventListener('langchange', () => {
    if (state.loaded) { renderLatest(); renderRecent(); recompute(); renderGenOut(); renderJackpot(); }
    renderAuthBar(); renderMyNumbers();
  });

  load();
  loadAuth();
});
