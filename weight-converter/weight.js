document.addEventListener('DOMContentLoaded', () => {
  const factors = { mg: 0.001, g: 1.0, kg: 1000.0, t: 1000000.0, oz: 28.349523125, lb: 453.59237, st: 6350.29318 };
  const valEl  = document.getElementById('weight-input-val');
  const unitEl = document.getElementById('weight-input-unit');
  function fmt(v) { if (v===0) return '0'; if (Math.abs(v)<1e-5||Math.abs(v)>1e7) return v.toExponential(4); return parseFloat(v.toFixed(6)).toString(); }
  function update() {
    const iv = parseFloat(valEl.value);
    if (isNaN(iv)) { for (const u in factors) document.getElementById('wt-res-'+u).textContent='—'; return; }
    const base = iv * factors[unitEl.value];
    for (const u in factors) document.getElementById('wt-res-'+u).textContent = fmt(base/factors[u]);
  }
  valEl.addEventListener('input', update);
  unitEl.addEventListener('change', update);
  update();
});
