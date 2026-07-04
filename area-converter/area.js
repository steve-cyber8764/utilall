document.addEventListener('DOMContentLoaded', () => {
  // 1 단위 = 몇 m² 인지 (기준: m²)
  const factors = {
    cm2:    0.0001,
    m2:     1,
    pyeong: 3.305785,
    ha:     10000,
    km2:    1000000,
    ft2:    0.09290304,
    yd2:    0.83612736,
    acre:   4046.8564224,
    mi2:    2589988.110336,
  };

  const valEl  = document.getElementById('area-input-val');
  const unitEl = document.getElementById('area-input-unit');

  function fmt(v) {
    if (v === 0) return '0';
    if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e10) return v.toExponential(4);
    if (Math.abs(v) >= 1000) return parseFloat(v.toFixed(4)).toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    return parseFloat(v.toFixed(6)).toString();
  }

  function update() {
    const iv = parseFloat(valEl.value);
    if (isNaN(iv)) {
      for (const u in factors) {
        const el = document.getElementById('area-res-' + u);
        if (el) el.textContent = '—';
      }
      return;
    }
    const baseM2 = iv * factors[unitEl.value];
    for (const u in factors) {
      const el = document.getElementById('area-res-' + u);
      if (el) el.textContent = fmt(baseM2 / factors[u]);
    }
  }

  valEl.addEventListener('input', update);
  unitEl.addEventListener('change', update);

  // 칩 클릭 — m² 기준으로 입력
  document.querySelectorAll('.chip[data-area-val]').forEach(chip => {
    chip.addEventListener('click', () => {
      valEl.value  = chip.getAttribute('data-area-val');
      unitEl.value = chip.getAttribute('data-area-unit') || 'm2';
      update();
    });
  });

  update();
});
