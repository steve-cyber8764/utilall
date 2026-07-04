document.addEventListener('DOMContentLoaded', () => {
  const tr = (key) => (window.I18N && window.I18N.t ? window.I18N.t(key) : key);

  const baseInputs = [
    { el: document.getElementById('base-bin'), base: 2,  regex: /^[01]*$/,       card: 'base-bin-card' },
    { el: document.getElementById('base-oct'), base: 8,  regex: /^[0-7]*$/,      card: 'base-oct-card' },
    { el: document.getElementById('base-dec'), base: 10, regex: /^[0-9]*$/,      card: 'base-dec-card' },
    { el: document.getElementById('base-hex'), base: 16, regex: /^[0-9a-fA-F]*$/, card: 'base-hex-card' }
  ];

  baseInputs.forEach(inputObj => {
    const inputEl = inputObj.el;
    inputEl.addEventListener('focus', () => document.getElementById(inputObj.card).classList.add('focus-glow'));
    inputEl.addEventListener('blur',  () => document.getElementById(inputObj.card).classList.remove('focus-glow'));
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      const cardEl = document.getElementById(inputObj.card);
      if (val === '') {
        baseInputs.forEach(i => { i.el.value = ''; document.getElementById(i.card).classList.remove('invalid'); });
        return;
      }
      if (!inputObj.regex.test(val)) { cardEl.classList.add('invalid'); return; }
      cardEl.classList.remove('invalid');
      try {
        let dec;
        if      (inputObj.base === 2)  dec = BigInt('0b' + val);
        else if (inputObj.base === 8)  dec = BigInt('0o' + val);
        else if (inputObj.base === 16) dec = BigInt('0x' + val);
        else                           dec = BigInt(val);
        baseInputs.forEach(o => {
          if (o.el !== inputEl) {
            o.el.value = dec.toString(o.base).toUpperCase();
            document.getElementById(o.card).classList.remove('invalid');
          }
        });
      } catch (e) { cardEl.classList.add('invalid'); }
    });
  });

  document.querySelectorAll('.btn-copy').forEach(copyBtn => {
    copyBtn.addEventListener('click', () => {
      const inputEl = document.getElementById(copyBtn.getAttribute('data-target'));
      if (inputEl && inputEl.value !== '') {
        navigator.clipboard.writeText(inputEl.value).then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = tr('common.copied');
          copyBtn.style.color = '#84fab0';
          setTimeout(() => { copyBtn.textContent = orig; copyBtn.style.color = ''; }, 1500);
        }).catch(() => {});
      }
    });
  });
});
