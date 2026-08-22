/* D-day 계산기 — 디데이 / 두 날짜 사이 / 기념일(100일 등)
 * 시간대·서머타임 영향을 피하려고 모든 계산은 로컬 자정 날짜 기준.
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const isEn = () => !!(window.I18N && window.I18N.lang === 'en');

  const els = {
    modeSeg: $('dday-mode-seg'),
    target: $('dday-target'), quick: $('dday-quick'),
    start: $('dday-start'), end: $('dday-end'), inclusive: $('dday-inclusive'),
    anniv: $('dday-anniv'), korean: $('dday-korean'),
    result: $('dday-result'),
  };
  if (!els.result) return;

  const state = { mode: 'dday' };

  /* ── 날짜 유틸 ── */
  const MS = 86400000;
  function today() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parse(str) {
    if (!str) return null;
    const p = str.split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function toStr(d) { const z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function addYears(d, n) { return new Date(d.getFullYear() + n, d.getMonth(), d.getDate()); }
  function diffDays(a, b) { return Math.round((b - a) / MS); }

  const WK_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const WK_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function fmtDate(d) {
    const wk = (isEn() ? WK_EN : WK_KO)[d.getDay()];
    if (isEn()) {
      const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${mn[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} (${wk})`;
    }
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${wk})`;
  }
  const nf = (n) => Math.abs(n).toLocaleString();
  function weeksDays(n) {
    const a = Math.abs(n), w = Math.floor(a / 7), d = a % 7;
    if (!w) return d + tr('dday.days');
    return w + tr('dday.weeks') + (d ? ' ' + d + tr('dday.days') : '');
  }

  const primary = (label, sub, cls) =>
    `<div class="dday-primary ${cls || ''}"><div class="dday-primary-val">${label}</div><div class="dday-primary-sub">${sub}</div></div>`;
  const stat = (k, v) => `<div class="bmi-stat"><span class="bmi-stat-k">${k}</span><span class="bmi-stat-v">${v}</span></div>`;

  /* ── 모드별 계산 ── */
  function calcDday() {
    const t = parse(els.target.value);
    if (!t) { els.result.innerHTML = `<div class="dday-empty">${tr('dday.pickDate')}</div>`; return; }
    const n = diffDays(today(), t); // 목표 - 오늘
    let label, sub, cls;
    if (n > 0) { label = 'D-' + nf(n); sub = tr('dday.left').replace('{n}', nf(n)); cls = 'future'; }
    else if (n < 0) { label = 'D+' + nf(-n); sub = tr('dday.past').replace('{n}', nf(-n)); cls = 'past'; }
    else { label = 'D-DAY'; sub = tr('dday.isToday'); cls = 'today'; }
    els.result.innerHTML = primary(label, sub, cls) +
      `<div class="bmi-stats">` +
      stat(tr('dday.targetDate'), fmtDate(t)) +
      stat(tr('dday.gap'), weeksDays(n)) +
      stat(tr('dday.fromToday'), fmtDate(today())) +
      `</div>`;
  }

  function calcBetween() {
    const a = parse(els.start.value), b = parse(els.end.value);
    if (!a || !b) { els.result.innerHTML = `<div class="dday-empty">${tr('dday.pickBoth')}</div>`; return; }
    const lo = a <= b ? a : b, hi = a <= b ? b : a;
    let n = diffDays(lo, hi);
    const inc = els.inclusive.checked;
    if (inc) n += 1;
    // 개월/일 (근사): 달력 기준
    let months = (hi.getFullYear() - lo.getFullYear()) * 12 + (hi.getMonth() - lo.getMonth());
    let dref = addYears(new Date(lo.getFullYear(), lo.getMonth() + months, lo.getDate()), 0);
    if (dref > hi) { months -= 1; }
    const label = nf(n) + tr('dday.daysUnit');
    els.result.innerHTML = primary(label, weeksDays(n), 'future') +
      `<div class="bmi-stats">` +
      stat(tr('dday.startDate'), fmtDate(lo)) +
      stat(tr('dday.endDate'), fmtDate(hi)) +
      stat(tr('dday.approx'), (months >= 0 ? months : 0) + tr('dday.monthsUnit')) +
      (inc ? stat('', `<span class="dday-note-inline">${tr('dday.incOn')}</span>`) : '') +
      `</div>`;
  }

  function calcAnniv() {
    const s = parse(els.anniv.value);
    if (!s) { els.result.innerHTML = `<div class="dday-empty">${tr('dday.pickStart')}</div>`; return; }
    const kr = els.korean.checked;
    const tdy = today();
    const passed = diffDays(s, tdy);         // 경과 일수
    const nth = passed + (kr ? 1 : 0);        // 며칠째
    const label = isEn() ? ('Day ' + nf(nth)) : (nf(nth) + tr('dday.nth'));
    const sub = tr('dday.sinceStart').replace('{d}', fmtDate(s));

    // 다가오는 기념일: 일수 기반 + 연 기반
    const dayMarks = [100, 200, 300, 365, 500, 1000, 1500, 2000, 3000, 5000, 10000];
    const items = [];
    for (const m of dayMarks) {
      const date = addDays(s, kr ? m - 1 : m); // 한국식이면 m일째 = 시작 + (m-1)
      const dleft = diffDays(tdy, date);
      if (dleft >= 0) items.push({ name: nf(m) + tr('dday.nthShort'), date, dleft });
    }
    for (let y = 1; y <= 30; y++) {
      const date = addYears(s, y);
      const dleft = diffDays(tdy, date);
      if (dleft >= 0) items.push({ name: y + tr('dday.year'), date, dleft });
    }
    items.sort((a, b) => a.dleft - b.dleft);
    const upcoming = items.slice(0, 6);

    let list = upcoming.map(it =>
      `<div class="dday-mile"><span class="dday-mile-name">${it.name}</span>` +
      `<span class="dday-mile-date">${fmtDate(it.date)}</span>` +
      `<span class="dday-mile-dday">${it.dleft === 0 ? 'D-DAY' : 'D-' + nf(it.dleft)}</span></div>`
    ).join('');

    els.result.innerHTML = primary(label, sub, 'today') +
      `<div class="bmi-stats">` +
      stat(tr('dday.elapsed'), nf(passed) + tr('dday.daysUnit')) +
      stat(tr('dday.startDate'), fmtDate(s)) +
      `</div>` +
      `<div class="dday-mile-head">${tr('dday.upcoming')}</div><div class="dday-mile-list">${list}</div>`;
  }

  function calc() {
    if (state.mode === 'dday') calcDday();
    else if (state.mode === 'between') calcBetween();
    else calcAnniv();
  }

  /* ── 빠른 설정 (디데이) ── */
  function renderQuick() {
    const t = today();
    const opts = [
      { key: 'dday.q100', date: addDays(t, 100) },
      { key: 'dday.q200', date: addDays(t, 200) },
      { key: 'dday.q1y', date: addYears(t, 1) },
      { key: 'dday.qYearEnd', date: new Date(t.getFullYear(), 11, 31) },
      { key: 'dday.qToday', date: t },
    ];
    els.quick.innerHTML = opts.map(o =>
      `<button class="dday-quick-btn" data-date="${toStr(o.date)}">${tr(o.key)}</button>`).join('');
  }

  /* ── 이벤트 ── */
  els.modeSeg.addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#dday-mode-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.mode = b.getAttribute('data-mode');
    document.querySelectorAll('.dday-panel').forEach(p => {
      p.style.display = p.getAttribute('data-panel') === state.mode ? '' : 'none';
    });
    calc();
  });

  els.quick.addEventListener('click', (e) => {
    const b = e.target.closest('.dday-quick-btn'); if (!b) return;
    els.target.value = b.getAttribute('data-date');
    calc();
  });

  [els.target, els.start, els.end, els.anniv].forEach(el => el && el.addEventListener('input', calc));
  [els.inclusive, els.korean].forEach(el => el && el.addEventListener('change', calc));
  window.addEventListener('langchange', () => { renderQuick(); calc(); });

  /* ── 초기값 ── */
  const t = today();
  els.target.value = toStr(addDays(t, 100));
  els.start.value = toStr(t);
  els.end.value = toStr(addDays(t, 100));
  els.anniv.value = toStr(t);
  renderQuick();
  calc();
});
