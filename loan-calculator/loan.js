/* 금리(대출) 계산기 — 원리금균등 / 원금균등 / 만기일시 + 거치기간 + 다국가 통화 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const els = {
    currency: $('loan-currency'),
    principal: $('loan-principal'), principalKr: $('loan-principal-kr'), principalUnit: $('loan-principal-unit'),
    rate: $('loan-rate'), grace: $('loan-grace'),
    term: $('loan-term'), termUnit: $('loan-term-unit'),
    monthly: $('loan-monthly'), monthlySub: $('loan-monthly-sub'),
    mInterest: $('loan-m-interest'), mPrincipal: $('loan-m-principal'),
    yearly: $('loan-yearly'), graceMonthly: $('loan-grace-monthly'),
    totalInterest: $('loan-total-interest'), total: $('loan-total'),
    months: $('loan-months'), body: $('loan-schedule-body'),
  };
  if (!els.principal) return;

  // 통화 정의: suffix 있으면 뒤에 붙임(원/円/元/₫), 없으면 앞에 기호 붙임($/€/£…)
  const CUR = {
    KRW: { sym: '₩',   suffix: '원', myriad: { man: '만', eok: '억', unit: '원' } },
    USD: { sym: '$' },
    EUR: { sym: '€' },
    JPY: { sym: '¥',   suffix: '円', myriad: { man: '万', eok: '億', unit: '円' } },
    CNY: { sym: '¥',   suffix: '元', myriad: { man: '万', eok: '亿', unit: '元' } },
    GBP: { sym: '£' },
    INR: { sym: '₹' },
    AUD: { sym: 'A$' },
    CAD: { sym: 'C$' },
    HKD: { sym: 'HK$' },
    TWD: { sym: 'NT$' },
    SGD: { sym: 'S$' },
    VND: { sym: '₫',   suffix: '₫' },
    THB: { sym: '฿' },
  };

  const tr = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const cur = () => CUR[els.currency.value] || CUR.KRW;
  const num = (n) => Math.round(n).toLocaleString();
  const digitsOf = (s) => parseInt(String(s).replace(/[^\d]/g, ''), 10) || 0;

  // 통화 서식: 접미사형은 "1,000 원", 기호형은 "$1,000"
  function money(n) {
    const c = cur();
    const s = num(n);
    return c.suffix ? (s + ' ' + c.suffix) : (c.sym + s);
  }

  // 큰 금액 읽기: 한국/일본/중국 = 억·만 / 그 외 = K·M·B·T
  function readable(n) {
    if (!n) return '';
    const c = cur();
    const en = !!(window.I18N && window.I18N.lang === 'en');
    if (!en && c.myriad) {
      const eok = Math.floor(n / 1e8), man = Math.floor((n % 1e8) / 1e4), rest = Math.floor(n % 1e4);
      const p = [];
      if (eok) p.push(eok.toLocaleString() + c.myriad.eok);
      if (man) p.push(man.toLocaleString() + c.myriad.man);
      if (rest) p.push(rest.toLocaleString());
      return '= ' + p.join(' ') + c.myriad.unit;
    }
    let v, suf = '';
    if (n >= 1e12) { v = n / 1e12; suf = 'T'; }
    else if (n >= 1e9) { v = n / 1e9; suf = 'B'; }
    else if (n >= 1e6) { v = n / 1e6; suf = 'M'; }
    else if (n >= 1e3) { v = n / 1e3; suf = 'K'; }
    else { v = n; }
    const vs = suf ? (parseFloat(v.toFixed(2)).toString() + suf) : Math.round(v).toLocaleString();
    return '= ' + (c.suffix ? (vs + ' ' + c.suffix) : (c.sym + vs));
  }

  function calc() {
    const P = Math.max(0, digitsOf(els.principal.value));
    const annual = Math.max(0, parseFloat(els.rate.value) || 0);
    const grace = Math.max(0, parseInt(els.grace.value, 10) || 0);
    let n = Math.max(1, parseInt(els.term.value, 10) || 1);
    if (els.termUnit.value === 'years') n *= 12;
    const method = (document.querySelector('input[name="loan-method"]:checked') || {}).value || 'equal_payment';
    const i = annual / 100 / 12;

    const c = cur();
    els.principalUnit.textContent = c.suffix || c.sym;
    els.principalKr.textContent = readable(P);

    const rows = [];
    let bal = P, totalInterest = 0;

    for (let m = 0; m < grace; m++) {
      const interest = bal * i;
      rows.push({ payment: interest, interest, principal: 0, balance: bal });
      totalInterest += interest;
    }

    if (method === 'equal_payment') {
      const A = (i === 0) ? P / n : P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
      for (let k = 1; k <= n; k++) {
        const interest = bal * i;
        let principal = A - interest;
        if (k === n) principal = bal;
        bal -= principal; if (bal < 0.005) bal = 0;
        rows.push({ payment: interest + principal, interest, principal, balance: bal });
        totalInterest += interest;
      }
    } else if (method === 'equal_principal') {
      const pp = P / n;
      for (let k = 1; k <= n; k++) {
        const interest = bal * i;
        let principal = pp;
        if (k === n) principal = bal;
        bal -= principal; if (bal < 0.005) bal = 0;
        rows.push({ payment: principal + interest, interest, principal, balance: bal });
        totalInterest += interest;
      }
    } else { // bullet
      for (let k = 1; k <= n; k++) {
        const interest = P * i;
        const principal = (k === n) ? P : 0;
        if (k === n) bal = 0;
        rows.push({ payment: interest + principal, interest, principal, balance: bal });
        totalInterest += interest;
      }
    }

    const totalPay = P + totalInterest;
    const firstRepay = rows[grace] || rows[0] || { payment: 0, interest: 0, principal: 0 };

    if (method === 'equal_payment') {
      els.monthly.textContent = money(firstRepay.payment);
      els.monthlySub.textContent = (grace > 0 ? tr('loan.afterGrace') + ' · ' : '') + tr('loan.splitVaries');
    } else if (method === 'equal_principal') {
      const last = rows[rows.length - 1] || { payment: 0 };
      els.monthly.textContent = num(firstRepay.payment) + ' → ' + money(last.payment);
      els.monthlySub.textContent = tr('loan.decreasing');
    } else {
      els.monthly.textContent = money(P * i);
      els.monthlySub.textContent = tr('loan.bulletSub');
    }

    els.mInterest.textContent = money(firstRepay.interest);
    els.mPrincipal.textContent = money(firstRepay.principal);
    els.graceMonthly.textContent = grace > 0 ? money(P * i) : '—';
    els.totalInterest.textContent = money(totalInterest);
    els.total.textContent = money(totalPay);
    els.months.textContent = (grace + n) + ' ' + tr('loan.months');

    let html = '', firstYearPay = 0;
    for (let y = 0; y * 12 < rows.length; y++) {
      const slice = rows.slice(y * 12, (y + 1) * 12);
      const pay = slice.reduce((s, r) => s + r.payment, 0);
      const intr = slice.reduce((s, r) => s + r.interest, 0);
      const prin = slice.reduce((s, r) => s + r.principal, 0);
      const endBal = slice[slice.length - 1].balance;
      if (y === 0) firstYearPay = pay;
      html += `<tr><td>${y + 1}${tr('loan.yearUnit')}</td><td>${num(pay)}</td><td>${num(intr)}</td><td>${num(prin)}</td><td>${num(endBal)}</td></tr>`;
    }
    els.body.innerHTML = html;
    els.yearly.textContent = money(firstYearPay);
  }

  els.principal.addEventListener('input', () => {
    const d = els.principal.value.replace(/[^\d]/g, '');
    els.principal.value = d ? Number(d).toLocaleString() : '';
    calc();
  });
  els.currency.addEventListener('change', calc);
  [els.rate, els.grace, els.term].forEach(e => e.addEventListener('input', calc));
  els.termUnit.addEventListener('change', calc);
  document.querySelectorAll('input[name="loan-method"]').forEach(r => r.addEventListener('change', calc));
  window.addEventListener('langchange', calc);
  calc();
});
