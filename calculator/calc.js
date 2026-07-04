document.addEventListener('DOMContentLoaded', () => {
  const tr = (key) => (window.I18N && window.I18N.t ? window.I18N.t(key) : key);

  const calcExprEl    = document.getElementById('calc-expr');
  const calcCurrentEl = document.getElementById('calc-current');
  const historyListEl = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');

  let calcCurrentInput = '0';
  let calcExpression   = '';
  let calcIsEvaluated  = false;
  let calcHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

  function updateCalcDisplay() {
    calcCurrentEl.textContent = calcCurrentInput;
    calcExprEl.textContent    = calcExpression;
  }

  function getOperatorSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  }

  function handleCalcInput(key) {
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
            if (calcCurrentInput.replace('.', '').length >= 15) return;
            calcCurrentInput += key;
          }
        }
      }
    } else if (['+', '-', '*', '/', '^'].includes(key)) {
      if (calcIsEvaluated) {
        calcExpression  = calcCurrentInput + ' ' + getOperatorSymbol(key) + ' ';
        calcIsEvaluated = false;
      } else {
        if (calcCurrentInput === '0' && calcExpression !== '') {
          if (calcExpression.trim().endsWith(')')) {
            calcExpression += getOperatorSymbol(key) + ' ';
          } else {
            calcExpression = calcExpression.trim().slice(0, -1).trim();
            calcExpression += ' ' + getOperatorSymbol(key) + ' ';
          }
        } else {
          calcExpression += calcCurrentInput + ' ' + getOperatorSymbol(key) + ' ';
        }
      }
      calcCurrentInput = '0';
    } else if (key === '(') {
      if (calcIsEvaluated) { calcExpression = '( '; calcCurrentInput = '0'; calcIsEvaluated = false; }
      else if (calcCurrentInput === '0') { calcExpression += '( '; }
      else { calcExpression += calcCurrentInput + ' × ( '; calcCurrentInput = '0'; }
    } else if (key === ')') {
      if (calcIsEvaluated) { calcExpression = '( '; calcCurrentInput = '0'; calcIsEvaluated = false; }
      else if (calcCurrentInput === '0') { calcExpression += ') '; }
      else { calcExpression += calcCurrentInput + ' ) '; calcCurrentInput = '0'; }
    } else if (key === 'negate') {
      if (calcCurrentInput !== '0' && calcCurrentInput !== 'Error') {
        calcCurrentInput = calcCurrentInput.startsWith('-')
          ? calcCurrentInput.slice(1)
          : '-' + calcCurrentInput;
      }
    } else if (key === 'clear') {
      calcCurrentInput = '0'; calcExpression = ''; calcIsEvaluated = false;
    } else if (key === 'backspace') {
      if (calcIsEvaluated) { calcExpression = ''; calcIsEvaluated = false; }
      else { calcCurrentInput = calcCurrentInput.length > 1 ? calcCurrentInput.slice(0, -1) : '0'; }
    } else if (key === '%') {
      if (calcCurrentInput !== '0') calcCurrentInput = (parseFloat(calcCurrentInput) / 100).toString();
    } else if (key === '=') {
      if (calcExpression === '') return;
      let fullExpression = calcExpression;
      if (calcCurrentInput !== '0' || calcExpression.trim().endsWith(')')) fullExpression += calcCurrentInput;
      let cleanedExpr = fullExpression.trim();
      const lastChar = cleanedExpr[cleanedExpr.length - 1];
      if (['+', '-', '×', '÷', '^'].includes(lastChar)) cleanedExpr = cleanedExpr.slice(0, -1).trim();
      const evalExpression = cleanedExpr
        .replace(/&times;|×|×/g, '*')
        .replace(/&divide;|÷|÷/g, '/')
        .replace(/\^/g, '**');
      if (/^[0-9. +\-*/()]+$/.test(evalExpression)) {
        try {
          let result = Function('"use strict"; return (' + evalExpression + ')')();
          if (!isFinite(result)) {
            calcCurrentInput = 'Error';
          } else {
            result = parseFloat(result.toFixed(10));
            calcCurrentInput = result.toString();
            const historyItem = { expr: cleanedExpr, result: calcCurrentInput };
            calcHistory.unshift(historyItem);
            if (calcHistory.length > 30) calcHistory.pop();
            localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
            renderHistory();
          }
          calcExpression  = '';
          calcIsEvaluated = true;
        } catch (e) {
          calcCurrentInput = 'Error'; calcExpression = ''; calcIsEvaluated = true;
        }
      }
    }
    updateCalcDisplay();
  }

  function renderHistory() {
    historyListEl.innerHTML = '';
    if (calcHistory.length === 0) {
      historyListEl.innerHTML = '<div class="empty-history">' + tr('calc.empty') + '</div>';
      return;
    }
    calcHistory.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = '<div class="hist-expr">' + item.expr + '</div><div class="hist-result">' + item.result + '</div>';
      div.addEventListener('click', () => {
        calcCurrentInput = item.result; calcExpression = ''; calcIsEvaluated = false; updateCalcDisplay();
      });
      historyListEl.appendChild(div);
    });
  }

  document.querySelectorAll('.calc-keypad .btn').forEach(btn => {
    btn.addEventListener('click', () => handleCalcInput(btn.getAttribute('data-key')));
  });

  clearHistoryBtn.addEventListener('click', () => {
    calcHistory = []; localStorage.removeItem('calcHistory'); renderHistory();
  });

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (!isNaN(key))                         handleCalcInput(key);
    else if (key === '.')                    handleCalcInput('.');
    else if (['+','-','*','/'].includes(key)) handleCalcInput(key);
    else if (key === 'Enter' || key === '=') { e.preventDefault(); handleCalcInput('='); }
    else if (key === 'Backspace')            handleCalcInput('backspace');
    else if (key === 'Escape')               handleCalcInput('clear');
    else if (key === '%')                    handleCalcInput('%');
    else if (key === '(' || key === ')')     handleCalcInput(key);
    else if (key === '^')                    handleCalcInput('^');
  });

  renderHistory();
});
