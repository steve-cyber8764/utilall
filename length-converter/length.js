document.addEventListener('DOMContentLoaded', () => {
  const factors = { mm: 0.001, cm: 0.01, m: 1.0, km: 1000.0, in: 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344 };
  const valEl  = document.getElementById('length-input-val');
  const unitEl = document.getElementById('length-input-unit');

  function fmt(v) {
    if (v === 0) return '0';
    if (Math.abs(v) < 1e-5 || Math.abs(v) > 1e7) return v.toExponential(4);
    return parseFloat(v.toFixed(6)).toString();
  }

  function update() {
    const inputVal = parseFloat(valEl.value);
    if (isNaN(inputVal)) { for (const u in factors) document.getElementById('len-res-' + u).textContent = '—'; return; }
    const base = inputVal * factors[unitEl.value];
    for (const u in factors) document.getElementById('len-res-' + u).textContent = fmt(base / factors[u]);
  }

  valEl.addEventListener('input', update);
  unitEl.addEventListener('change', update);
  update();
});
