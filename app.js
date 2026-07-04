document.addEventListener('DOMContentLoaded', () => {

  // i18n helper — returns the translated string, or the key if i18n isn't ready
  const tr = (key) => (window.I18N && window.I18N.t ? window.I18N.t(key) : key);

  /* =========================================================================
   * 1. SPA Navigation & Routing
   * ========================================================================= */
  const navItems = document.querySelectorAll('.nav-item');
  const tabSections = document.querySelectorAll('.tab-section');
  const dashboardCards = document.querySelectorAll('.dashboard-card');

  function switchTab(tabId) {
    // 1. Active class toggle for navbar items
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. Active class toggle for sections
    tabSections.forEach(section => {
      if (section.id === `section-${tabId}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Scroll back to top of the content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Sidebar navigation click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Dashboard card quick link click
  dashboardCards.forEach(card => {
    card.addEventListener('click', () => {
      const tabId = card.getAttribute('data-go-tab');
      switchTab(tabId);
    });
  });

  // Brand logo → home
  const brandLogo = document.querySelector('.sidebar-brand');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => switchTab('home'));
    brandLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchTab('home');
      }
    });
  }


  /* =========================================================================
   * 2. Electronic Calculator Logic
   * ========================================================================= */
  const calcExprEl = document.getElementById('calc-expr');
  const calcCurrentEl = document.getElementById('calc-current');
  const historyListEl = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');
  
  let calcCurrentInput = '0';
  let calcExpression = '';
  let calcIsEvaluated = false;
  let calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

  function updateCalcDisplay() {
    calcCurrentEl.textContent = calcCurrentInput;
    calcExprEl.textContent = calcExpression;
  }

  function handleCalcInput(key) {
    // Number check
    if (!isNaN(key) || key === '.') {
      if (calcIsEvaluated) {
        calcCurrentInput = key === '.' ? '0.' : key;
        calcIsEvaluated = false;
      } else {
        if (key === '.') {
          if (calcCurrentInput.includes('.')) return;
          calcCurrentInput += '.';
        } else {
          if (calcCurrentInput === '0') {
            calcCurrentInput = key;
          } else {
            // Limit to 15 digits
            if (calcCurrentInput.replace('.', '').length >= 15) return;
            calcCurrentInput += key;
          }
        }
      }
    } 
    // Operators (+, -, *, /, ^)
    else if (['+', '-', '*', '/', '^'].includes(key)) {
      if (calcIsEvaluated) {
        calcExpression = calcCurrentInput + ' ' + getOperatorSymbol(key) + ' ';
        calcIsEvaluated = false;
      } else {
        if (calcCurrentInput === '0' && calcExpression !== '') {
          // If the expression ends with a closing parenthesis, we append the operator rather than replacing
          if (calcExpression.trim().endsWith(')')) {
            calcExpression += getOperatorSymbol(key) + ' ';
          } else {
            // Replace last operator
            calcExpression = calcExpression.trim().slice(0, -1).trim();
            // Check if it ends with another operator or parenthesis
            calcExpression += ' ' + getOperatorSymbol(key) + ' ';
          }
        } else {
          calcExpression += calcCurrentInput + ' ' + getOperatorSymbol(key) + ' ';
        }
      }
      calcCurrentInput = '0';
    } 
    // Parenthesis (
    else if (key === '(') {
      if (calcIsEvaluated) {
        calcExpression = '( ';
        calcCurrentInput = '0';
        calcIsEvaluated = false;
      } else {
        if (calcCurrentInput === '0') {
          calcExpression += '( ';
        } else {
          // Auto-multiply: 5( -> 5 * (
          calcExpression += calcCurrentInput + ' × ( ';
          calcCurrentInput = '0';
        }
      }
    }
    // Parenthesis )
    else if (key === ')') {
      if (calcIsEvaluated) {
        calcExpression = '( ';
        calcCurrentInput = '0';
        calcIsEvaluated = false;
      } else {
        if (calcCurrentInput === '0') {
          calcExpression += ') ';
        } else {
          calcExpression += calcCurrentInput + ' ) ';
          calcCurrentInput = '0';
        }
      }
    }
    // Sign conversion (+/-)
    else if (key === 'negate') {
      if (calcCurrentInput !== '0' && calcCurrentInput !== 'Error') {
        if (calcCurrentInput.startsWith('-')) {
          calcCurrentInput = calcCurrentInput.slice(1);
        } else {
          calcCurrentInput = '-' + calcCurrentInput;
        }
      }
    }
    // Action keys
    else if (key === 'clear') {
      calcCurrentInput = '0';
      calcExpression = '';
      calcIsEvaluated = false;
    } else if (key === 'backspace') {
      if (calcIsEvaluated) {
        calcExpression = '';
        calcIsEvaluated = false;
      } else {
        if (calcCurrentInput.length > 1) {
          calcCurrentInput = calcCurrentInput.slice(0, -1);
        } else {
          calcCurrentInput = '0';
        }
      }
    } else if (key === '%') {
      if (calcCurrentInput !== '0') {
        calcCurrentInput = (parseFloat(calcCurrentInput) / 100).toString();
      }
    } else if (key === '=') {
      // Allow evaluation if expression is present
      if (calcExpression === '') return;
      
      let fullExpression = calcExpression;
      if (calcCurrentInput !== '0' || calcExpression.trim().endsWith(')')) {
        fullExpression += calcCurrentInput;
      }
      
      // Clean up expression (remove trailing operators if any)
      let cleanedExpr = fullExpression.trim();
      const lastChar = cleanedExpr[cleanedExpr.length - 1];
      if (['+', '-', '×', '÷', '^'].includes(lastChar)) {
        cleanedExpr = cleanedExpr.slice(0, -1).trim();
      }

      // Convert UI operators back to standard JS operators for eval
      const evalExpression = cleanedExpr
        .replace(/&times;|\u00d7|×/g, '*')
        .replace(/&divide;|\u00f7|÷/g, '/')
        .replace(/\^/g, '**');
      
      // Safety regex check for eval to avoid arbitrary code execution
      if (/^[0-9. +\-*/()]+$/.test(evalExpression)) {
        try {
          let result = Function(`"use strict"; return (${evalExpression})`)();
          
          if (!isFinite(result)) {
            calcCurrentInput = 'Error';
          } else {
            result = parseFloat(result.toFixed(10));
            calcCurrentInput = result.toString();
            
            // Add to history
            const historyItem = {
              expr: cleanedExpr,
              result: calcCurrentInput
            };
            calcHistory.unshift(historyItem);
            if (calcHistory.length > 30) calcHistory.pop();
            localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
            renderHistory();
          }
          calcExpression = '';
          calcIsEvaluated = true;
        } catch (e) {
          calcCurrentInput = 'Error';
          calcExpression = '';
          calcIsEvaluated = true;
        }
      }
    }
    updateCalcDisplay();
  }

  function getOperatorSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  }

  function renderHistory() {
    historyListEl.innerHTML = '';
    if (calcHistory.length === 0) {
      historyListEl.innerHTML = '<div class="empty-history" data-i18n="calc.empty">' + tr('calc.empty') + '</div>';
      return;
    }

    calcHistory.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="hist-expr">${item.expr}</div>
        <div class="hist-result">${item.result}</div>
      `;
      div.addEventListener('click', () => {
        calcCurrentInput = item.result;
        calcExpression = '';
        calcIsEvaluated = false;
        updateCalcDisplay();
      });
      historyListEl.appendChild(div);
    });
  }

  // Keypad click listeners
  document.querySelectorAll('.calc-keypad .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      handleCalcInput(key);
    });
  });

  // History Clear
  clearHistoryBtn.addEventListener('click', () => {
    calcHistory = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
  });

  // Calculator Keyboard Bindings
  document.addEventListener('keydown', (e) => {
    // Only capture keys if Calculator tab is active
    const activeSection = document.querySelector('.tab-section.active');
    if (!activeSection || activeSection.id !== 'section-calc') return;

    const key = e.key;
    if (!isNaN(key)) {
      handleCalcInput(key);
    } else if (key === '.') {
      handleCalcInput('.');
    } else if (['+', '-', '*', '/'].includes(key)) {
      handleCalcInput(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleCalcInput('=');
    } else if (key === 'Backspace') {
      handleCalcInput('backspace');
    } else if (key === 'Escape') {
      handleCalcInput('clear');
    } else if (key === '%') {
      handleCalcInput('%');
    } else if (key === '(' || key === ')') {
      handleCalcInput(key);
    } else if (key === '^') {
      handleCalcInput('^');
    }
  });

  // Initial history render
  renderHistory();


  /* =========================================================================
   * 3. Base Converter Logic
   * ========================================================================= */
  const baseBinInput = document.getElementById('base-bin');
  const baseOctInput = document.getElementById('base-oct');
  const baseDecInput = document.getElementById('base-dec');
  const baseHexInput = document.getElementById('base-hex');

  const baseInputs = [
    { el: baseBinInput, base: 2, regex: /^[01]*$/, card: 'base-bin-card' },
    { el: baseOctInput, base: 8, regex: /^[0-7]*$/, card: 'base-oct-card' },
    { el: baseDecInput, base: 10, regex: /^[0-9]*$/, card: 'base-dec-card' },
    { el: baseHexInput, base: 16, regex: /^[0-9a-fA-F]*$/, card: 'base-hex-card' }
  ];

  baseInputs.forEach(inputObj => {
    const inputEl = inputObj.el;
    
    // Focus styling
    inputEl.addEventListener('focus', () => {
      document.getElementById(inputObj.card).classList.add('focus-glow');
    });
    inputEl.addEventListener('blur', () => {
      document.getElementById(inputObj.card).classList.remove('focus-glow');
    });

    // Input validation & conversion
    inputEl.addEventListener('input', () => {
      const val = inputEl.value.trim();
      const cardEl = document.getElementById(inputObj.card);

      if (val === '') {
        // Clear all inputs
        baseInputs.forEach(i => {
          i.el.value = '';
          document.getElementById(i.card).classList.remove('invalid');
        });
        return;
      }

      // Check regex pattern
      if (!inputObj.regex.test(val)) {
        cardEl.classList.add('invalid');
        return;
      } else {
        cardEl.classList.remove('invalid');
      }

      // Convert value
      try {
        // Parse current value to decimal BigInt or standard number (BigInt is safer for large integers)
        let decimalValue;
        if (inputObj.base === 16) {
          decimalValue = BigInt('0x' + val);
        } else if (inputObj.base === 2) {
          decimalValue = BigInt('0b' + val);
        } else if (inputObj.base === 8) {
          decimalValue = BigInt('0o' + val);
        } else {
          decimalValue = BigInt(val);
        }

        // Update all other inputs
        baseInputs.forEach(otherObj => {
          if (otherObj.el !== inputEl) {
            let outputVal = decimalValue.toString(otherObj.base).toUpperCase();
            otherObj.el.value = outputVal;
            document.getElementById(otherObj.card).classList.remove('invalid');
          }
        });
      } catch (e) {
        // Decimal parse fail (usually double zeros or other corner cases for BigInt)
        cardEl.classList.add('invalid');
      }
    });
  });

  // Base Converter Copy to Clipboard
  document.querySelectorAll('.btn-copy').forEach(copyBtn => {
    copyBtn.addEventListener('click', () => {
      const targetId = copyBtn.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      if (inputEl && inputEl.value !== '') {
        navigator.clipboard.writeText(inputEl.value)
          .then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = tr('common.copied');
            copyBtn.style.color = '#84fab0';
            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.style.color = '';
            }, 1500);
          })
          .catch(err => {
            console.error('Copy failed:', err);
          });
      }
    });
  });


  /* =========================================================================
   * 4. Area Converter Logic (㎡ <-> pyeong)
   * ========================================================================= */
  const areaM2Input = document.getElementById('area-m2');
  const areaPyeongInput = document.getElementById('area-pyeong');
  const areaChips = document.querySelectorAll('.chip');

  const M2_TO_PYEONG = 0.3025;
  const PYEONG_TO_M2 = 3.305785;

  areaM2Input.addEventListener('input', () => {
    const val = parseFloat(areaM2Input.value);
    if (isNaN(val)) {
      areaPyeongInput.value = '';
      return;
    }
    // Calculate Pyeong
    const pyeong = val * M2_TO_PYEONG;
    // Format to max 4 decimal places, remove trailing zeros
    areaPyeongInput.value = parseFloat(pyeong.toFixed(4));
  });

  areaPyeongInput.addEventListener('input', () => {
    const val = parseFloat(areaPyeongInput.value);
    if (isNaN(val)) {
      areaM2Input.value = '';
      return;
    }
    // Calculate M2
    const m2 = val * PYEONG_TO_M2;
    // Format to max 4 decimal places, remove trailing zeros
    areaM2Input.value = parseFloat(m2.toFixed(4));
  });

  // Shortcut chip clicks
  areaChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-val');
      const type = chip.getAttribute('data-type');

      if (type === 'm2') {
        areaM2Input.value = val;
        // Trigger manual input event to recalculate
        areaM2Input.dispatchEvent(new Event('input'));
      } else if (type === 'pyeong') {
        areaPyeongInput.value = val;
        // Trigger manual input event to recalculate
        areaPyeongInput.dispatchEvent(new Event('input'));
      }
    });
  });


  /* =========================================================================
   * 5. Length Converter Logic
   * ========================================================================= */
  const lenInputVal = document.getElementById('length-input-val');
  const lenInputUnit = document.getElementById('length-input-unit');

  // Conversion factors relative to 1 Meter (m)
  const lengthToMeter = {
    mm: 0.001,
    cm: 0.01,
    m: 1.0,
    km: 1000.0,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mile: 1609.344
  };

  function updateLengthConversions() {
    const inputVal = parseFloat(lenInputVal.value);
    const inputUnit = lenInputUnit.value;

    if (isNaN(inputVal)) {
      // Clear all results
      for (const unit in lengthToMeter) {
        document.getElementById(`len-res-${unit}`).textContent = '—';
      }
      return;
    }

    // 1. Convert input to meters
    const valueInMeters = inputVal * lengthToMeter[inputUnit];

    // 2. Convert meters to all other units
    for (const unit in lengthToMeter) {
      const convertedVal = valueInMeters / lengthToMeter[unit];
      
      // Formatting details:
      // Avoid excessive floating decimal points. Keep up to 6 significant digits.
      let displayVal;
      if (convertedVal === 0) {
        displayVal = '0';
      } else if (Math.abs(convertedVal) < 1e-5 || Math.abs(convertedVal) > 1e7) {
        // Use scientific notation for very small/large values
        displayVal = convertedVal.toExponential(4);
      } else {
        // Strip trailing zeros after parsing float
        displayVal = parseFloat(convertedVal.toFixed(6)).toString();
      }

      document.getElementById(`len-res-${unit}`).textContent = displayVal;
    }
  }

  // Listeners
  lenInputVal.addEventListener('input', updateLengthConversions);
  lenInputUnit.addEventListener('change', updateLengthConversions);

  // Initial trigger to populate the default 1cm grid
  updateLengthConversions();


  /* =========================================================================
   * 5b. Generic Unit Converter (Distance & Weight)
   * ========================================================================= */
  function setupUnitConverter(valId, unitId, factors, idPrefix) {
    const valEl = document.getElementById(valId);
    const unitEl = document.getElementById(unitId);
    if (!valEl || !unitEl) return;

    function update() {
      const inputVal = parseFloat(valEl.value);
      if (isNaN(inputVal)) {
        for (const u in factors) document.getElementById(idPrefix + u).textContent = '—';
        return;
      }
      const base = inputVal * factors[unitEl.value];
      for (const u in factors) {
        const v = base / factors[u];
        let d;
        if (v === 0) d = '0';
        else if (Math.abs(v) < 1e-5 || Math.abs(v) > 1e7) d = v.toExponential(4);
        else d = parseFloat(v.toFixed(6)).toString();
        document.getElementById(idPrefix + u).textContent = d;
      }
    }

    valEl.addEventListener('input', update);
    unitEl.addEventListener('change', update);
    update();
  }

  // Distance — same units as the length converter (factors relative to 1 meter)
  setupUnitConverter('distance-input-val', 'distance-input-unit', {
    mm: 0.001, cm: 0.01, m: 1.0, km: 1000.0, in: 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344
  }, 'dist-res-');

  // Weight — factors relative to 1 gram
  setupUnitConverter('weight-input-val', 'weight-input-unit', {
    mg: 0.001, g: 1.0, kg: 1000.0, t: 1000000.0, oz: 28.349523125, lb: 453.59237, st: 6350.29318
  }, 'wt-res-');

  /* =========================================================================
   * 6. Dark / Light Theme Toggle
   * ========================================================================= */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleIcon = themeToggleBtn.querySelector('.theme-toggle-icon');
  const themeToggleText = themeToggleBtn.querySelector('.theme-toggle-text');
  const metaThemeColor = document.getElementById('meta-theme-color');

  // Theme label reflects the OPPOSITE mode (the action the button performs)
  function updateThemeLabel() {
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleText.textContent = isDark ? tr('theme.light') : tr('theme.dark');
  }

  // Check user preference from LocalStorage (default is light theme as requested)
  const savedTheme = localStorage.getItem('themePreference') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleIcon.textContent = '🌙';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#090d16');
  } else {
    document.body.classList.remove('dark-theme');
    themeToggleIcon.textContent = '☀️';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#d1d7e0');
  }
  updateThemeLabel();

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
      localStorage.setItem('themePreference', 'dark');
      themeToggleIcon.textContent = '🌙';
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#090d16');
    } else {
      localStorage.setItem('themePreference', 'light');
      themeToggleIcon.textContent = '☀️';
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#d1d7e0');
    }
    updateThemeLabel();
  });

  // Keep the embedded Space Distance Explorer (iframe) in sync with the language.
  const spaceFrame = document.querySelector('.space-embed');
  function syncSpaceFrame() {
    if (!spaceFrame) return;
    const base = spaceFrame.getAttribute('data-src') || 'space/index.html';
    const lang = (window.I18N && window.I18N.lang) ? window.I18N.lang : 'ko';
    const desired = base + '?lang=' + lang;
    // Only (re)load when the language actually changed to avoid redundant reloads
    if (spaceFrame.getAttribute('data-lang') !== lang) {
      spaceFrame.setAttribute('data-lang', lang);
      spaceFrame.src = desired;
    }
  }
  syncSpaceFrame();

  // Re-apply language-dependent dynamic labels when the language changes
  window.addEventListener('langchange', () => {
    updateThemeLabel();
    syncSpaceFrame();
  });


  /* =========================================================================
   * 6b. Home info tabs (About / Guide / FAQ)
   * ========================================================================= */
  (function initInfoTabs() {
    const tabs = document.querySelectorAll('.info-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-info');
        tabs.forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.info-panel').forEach(p => {
          p.classList.toggle('active', p.id === 'info-' + key);
        });
      });
    });
  })();


  /* =========================================================================
   * 7. Visitor counter (server-persisted)
   * ========================================================================= */
  (function initVisitorCounter() {
    const countEl = document.getElementById('vc-count');
    if (!countEl) return;

    function render(n) {
      if (typeof n === 'number') countEl.textContent = n.toLocaleString();
    }

    // Count once per browser per day; otherwise just read the current total.
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem('utilall_visit_day');
    const firstToday = last !== today;

    const req = firstToday
      ? fetch('/api/visit', { method: 'POST' })
      : fetch('/api/visits');

    req
      .then(r => r.json())
      .then(d => {
        if (firstToday) localStorage.setItem('utilall_visit_day', today);
        render(d.total);
      })
      .catch(() => { countEl.textContent = '—'; });
  })();


  /* =========================================================================
   * 6. PDF Watermark (client-side, pdf-lib)
   * ========================================================================= */
  (function initPdfWatermark() {
    const fileInput = document.getElementById('pdf-file-input');
    const dropZone = document.getElementById('pdf-drop-zone');
    if (!fileInput || !dropZone) return;

    const fileNameEl = document.getElementById('pdf-file-name');
    const textInput = document.getElementById('pdf-wm-text');
    const sizeInput = document.getElementById('pdf-wm-size');
    const opacityInput = document.getElementById('pdf-wm-opacity');
    const angleInput = document.getElementById('pdf-wm-angle');
    const colorInput = document.getElementById('pdf-wm-color');
    const applyBtn = document.getElementById('pdf-apply-btn');
    const statusEl = document.getElementById('pdf-status');
    const sizeVal = document.getElementById('pdf-size-val');
    const opacityVal = document.getElementById('pdf-opacity-val');
    const angleVal = document.getElementById('pdf-angle-val');

    let selectedFile = null;

    // Live value labels for sliders
    sizeInput.addEventListener('input', () => { sizeVal.textContent = sizeInput.value; });
    opacityInput.addEventListener('input', () => { opacityVal.textContent = opacityInput.value + '%'; });
    angleInput.addEventListener('input', () => { angleVal.textContent = angleInput.value + '°'; });

    function setStatus(msg, type) {
      statusEl.textContent = msg || '';
      statusEl.className = 'pdf-status' + (type ? ' ' + type : '');
    }

    function pickFile(file) {
      if (!file) return;
      if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
        setStatus(tr('pdf.status.onlyPdf'), 'error');
        return;
      }
      selectedFile = file;
      fileNameEl.textContent = '📎 ' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + ' MB)';
      dropZone.classList.add('has-file');
      applyBtn.disabled = false;
      setStatus('');
    }

    fileInput.addEventListener('change', () => pickFile(fileInput.files[0]));

    ['dragover', 'dragenter'].forEach(ev =>
      dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('dragging'); })
    );
    ['dragleave', 'dragend'].forEach(ev =>
      dropZone.addEventListener(ev, () => dropZone.classList.remove('dragging'))
    );
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
    });

    // Build a transparent PNG (data URL) sized to one PDF page with the watermark drawn on it.
    function makeWatermarkPng(wPts, hPts, opts) {
      const scale = Math.min(2, 2000 / Math.max(wPts, hPts));
      const cw = Math.max(1, Math.round(wPts * scale));
      const ch = Math.max(1, Math.round(hPts * scale));
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      const fontPx = opts.size * scale;
      ctx.font = `bold ${fontPx}px 'Noto Sans KR', 'Outfit', sans-serif`;
      ctx.fillStyle = opts.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const angle = -opts.angle * Math.PI / 180;

      if (opts.layout === 'center') {
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate(angle);
        ctx.fillText(opts.text, 0, 0);
        ctx.restore();
      } else {
        const tw = Math.max(ctx.measureText(opts.text).width, fontPx);
        const stepX = tw + fontPx * 1.5;
        const stepY = fontPx * 3;
        for (let y = -ch; y < ch * 2; y += stepY) {
          for (let x = -cw; x < cw * 2; x += stepX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(opts.text, 0, 0);
            ctx.restore();
          }
        }
      }
      return canvas.toDataURL('image/png');
    }

    function dataUrlToBytes(dataUrl) {
      const base64 = dataUrl.split(',')[1];
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }

    applyBtn.addEventListener('click', async () => {
      if (!selectedFile) return;
      if (typeof PDFLib === 'undefined') {
        setStatus(tr('pdf.status.noLib'), 'error');
        return;
      }
      const text = (textInput.value || '').trim();
      if (!text) {
        setStatus(tr('pdf.status.needText'), 'error');
        textInput.focus();
        return;
      }

      const opts = {
        text: text,
        size: parseInt(sizeInput.value, 10),
        opacity: parseInt(opacityInput.value, 10) / 100,
        angle: parseInt(angleInput.value, 10),
        color: colorInput.value,
        layout: (document.querySelector('input[name="pdf-layout"]:checked') || {}).value || 'tiled'
      };

      applyBtn.disabled = true;
      setStatus(tr('pdf.status.processing'), 'loading');

      try {
        const bytes = new Uint8Array(await selectedFile.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();
        const cache = {};

        for (const page of pages) {
          const { width, height } = page.getSize();
          const key = Math.round(width) + 'x' + Math.round(height);
          if (!cache[key]) {
            const pngBytes = dataUrlToBytes(makeWatermarkPng(width, height, opts));
            cache[key] = await pdfDoc.embedPng(pngBytes);
          }
          page.drawImage(cache[key], { x: 0, y: 0, width, height, opacity: opts.opacity });
        }

        const out = await pdfDoc.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const baseName = selectedFile.name.replace(/\.pdf$/i, '');
        const a = document.createElement('a');
        a.href = url;
        a.download = baseName + '_watermarked.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);

        setStatus(tr('pdf.status.done').replace('{n}', pages.length), 'success');
      } catch (err) {
        console.error(err);
        setStatus(tr('pdf.status.fail'), 'error');
      } finally {
        applyBtn.disabled = false;
      }
    });
  })();

});
