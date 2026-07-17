/* 비만도(BMI) 계산기 — 체질량지수 + 비만 단계 + 표준체중
 * 판정 기준: 아시아·태평양(대한비만학회) / WHO 국제
 * 단위: 미터법(cm·kg) / 야드파운드법(ft·in·lb)
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);

  const els = {
    unitSeg: $('bmi-unit-seg'), stdSeg: $('bmi-std-seg'), stdNote: $('bmi-std-note'),
    hMetric: $('bmi-height-metric'), hImperial: $('bmi-height-imperial'),
    height: $('bmi-height'), ft: $('bmi-height-ft'), inch: $('bmi-height-in'),
    weight: $('bmi-weight'), weightUnit: $('bmi-weight-unit'),
    value: $('bmi-value'), category: $('bmi-category'),
    track: $('bmi-gauge-track'), marker: $('bmi-gauge-marker'), scale: $('bmi-gauge-scale'),
    normalRange: $('bmi-normal-range'), ideal: $('bmi-ideal'),
    diffLabel: $('bmi-diff-label'), diff: $('bmi-diff'),
  };
  if (!els.value) return;

  const state = { unit: 'metric', std: 'asia' };
  const GMIN = 15, GMAX = 40; // 게이지 표시 범위

  // 판정 기준별 구간 [상한(미만), i18n키, 색]
  function bands() {
    if (state.std === 'who') return [
      { lt: 18.5, key: 'bmi.cat.under', color: '#3b82f6' },
      { lt: 25,   key: 'bmi.cat.normal', color: '#10b981' },
      { lt: 30,   key: 'bmi.cat.over',  color: '#f59e0b' },
      { lt: 35,   key: 'bmi.cat.obese1', color: '#f97316' },
      { lt: 40,   key: 'bmi.cat.obese2', color: '#ef4444' },
      { lt: Infinity, key: 'bmi.cat.obese3', color: '#b91c1c' },
    ];
    return [ // 아시아·태평양 (대한비만학회)
      { lt: 18.5, key: 'bmi.cat.under', color: '#3b82f6' },
      { lt: 23,   key: 'bmi.cat.normal', color: '#10b981' },
      { lt: 25,   key: 'bmi.cat.over',  color: '#f59e0b' },
      { lt: 30,   key: 'bmi.cat.obese1', color: '#f97316' },
      { lt: 35,   key: 'bmi.cat.obese2', color: '#ef4444' },
      { lt: Infinity, key: 'bmi.cat.obese3', color: '#b91c1c' },
    ];
  }
  const normalMax = () => (state.std === 'who' ? 25 : 23); // 정상 상한(미만)

  const num = (el) => Math.max(0, parseFloat(el.value) || 0);
  const kgFmt = (kg) => {
    if (state.unit === 'imperial') return (kg / 0.45359237).toFixed(1) + ' lb';
    return kg.toFixed(1) + ' kg';
  };

  function heightMeters() {
    if (state.unit === 'imperial') {
      const totalIn = num(els.ft) * 12 + num(els.inch);
      return totalIn * 0.0254;
    }
    return num(els.height) / 100;
  }
  function weightKg() {
    const w = num(els.weight);
    return state.unit === 'imperial' ? w * 0.45359237 : w;
  }

  const pos = (bmi) => Math.max(0, Math.min(100, (bmi - GMIN) / (GMAX - GMIN) * 100));

  function renderGauge(bmi) {
    // 색 구간
    const b = bands();
    let html = '', prev = GMIN;
    for (const seg of b) {
      const upper = Math.min(seg.lt, GMAX);
      if (upper <= prev) { prev = seg.lt; continue; }
      const w = (upper - prev) / (GMAX - GMIN) * 100;
      html += `<div class="bmi-zone" style="width:${w}%;background:${seg.color}"></div>`;
      prev = seg.lt;
      if (prev >= GMAX) break;
    }
    els.track.innerHTML = html;
    // 눈금 (판정 경계값)
    const marks = b.slice(0, -1).map(s => s.lt).filter(v => v > GMIN && v < GMAX);
    els.scale.innerHTML = marks.map(v =>
      `<span class="bmi-tick" style="left:${pos(v)}%">${v}</span>`).join('');
    // 마커
    if (bmi && isFinite(bmi)) {
      els.marker.style.display = '';
      els.marker.style.left = pos(bmi) + '%';
    } else {
      els.marker.style.display = 'none';
    }
  }

  function calc() {
    const h = heightMeters();
    const wKg = weightKg();
    els.weightUnit.textContent = state.unit === 'imperial' ? 'lb' : 'kg';

    if (h <= 0 || wKg <= 0) {
      els.value.textContent = '—';
      els.category.textContent = '—';
      els.category.style.background = '';
      els.category.style.color = '';
      els.normalRange.textContent = '—';
      els.ideal.textContent = '—';
      els.diff.textContent = '—';
      renderGauge(null);
      return;
    }

    const bmi = wKg / (h * h);
    els.value.textContent = bmi.toFixed(1);

    const band = bands().find(s => bmi < s.lt);
    els.category.textContent = tr(band.key);
    els.category.style.background = band.color;
    els.category.style.color = '#fff';

    // 표준체중 범위 (BMI 18.5 ~ 정상상한)
    const lowKg = 18.5 * h * h;
    const highKg = (normalMax() - 0.1) * h * h;
    els.normalRange.textContent = kgFmt(lowKg) + ' ~ ' + kgFmt(highKg);
    // 표준체중 (BMI 22)
    els.ideal.textContent = kgFmt(22 * h * h);

    // 조언
    if (bmi < 18.5) {
      els.diffLabel.textContent = tr('bmi.toGain');
      els.diff.textContent = '+' + kgFmt(lowKg - wKg);
      els.diff.style.color = '#3b82f6';
    } else if (bmi < normalMax()) {
      els.diffLabel.textContent = tr('bmi.status');
      els.diff.textContent = tr('bmi.inNormal');
      els.diff.style.color = '#10b981';
    } else {
      els.diffLabel.textContent = tr('bmi.toLose');
      els.diff.textContent = '−' + kgFmt(wKg - highKg);
      els.diff.style.color = 'var(--accent-coral)';
    }

    renderGauge(bmi);
  }

  /* ── 이벤트 ── */
  els.unitSeg.addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#bmi-unit-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    const prev = state.unit;
    state.unit = b.getAttribute('data-unit');
    if (state.unit === prev) return;
    // 입력값 단위 환산 (편의)
    if (state.unit === 'imperial') {
      const cm = num(els.height), totalIn = cm / 2.54;
      els.ft.value = Math.floor(totalIn / 12);
      els.inch.value = (totalIn % 12).toFixed(1);
      els.weight.value = (num(els.weight) / 0.45359237).toFixed(1);
      els.hMetric.style.display = 'none'; els.hImperial.style.display = '';
    } else {
      const cm = (num(els.ft) * 12 + num(els.inch)) * 2.54;
      els.height.value = cm.toFixed(1);
      els.weight.value = (num(els.weight) * 0.45359237).toFixed(1);
      els.hMetric.style.display = ''; els.hImperial.style.display = 'none';
    }
    calc();
  });

  els.stdSeg.addEventListener('click', (e) => {
    const b = e.target.closest('.pb-seg-btn'); if (!b) return;
    document.querySelectorAll('#bmi-std-seg .pb-seg-btn').forEach(x => x.classList.toggle('active', x === b));
    state.std = b.getAttribute('data-std');
    els.stdNote.textContent = tr(state.std === 'who' ? 'bmi.whoNote' : 'bmi.asiaNote');
    els.stdNote.setAttribute('data-i18n', state.std === 'who' ? 'bmi.whoNote' : 'bmi.asiaNote');
    calc();
  });

  [els.height, els.ft, els.inch, els.weight].forEach(el => el && el.addEventListener('input', calc));
  window.addEventListener('langchange', calc);

  calc();
});
