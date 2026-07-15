/**
 * common.js — UtilAll 공통 모듈
 * 모든 하위 페이지에서 로드됩니다.
 * 담당: 테마 토글, 언어 전환, 사이드바 active, 방문자 카운터, 홈 info-tabs
 */
document.addEventListener('DOMContentLoaded', () => {

  const tr = (key) => (window.I18N && window.I18N.t ? window.I18N.t(key) : key);

  /* ── 사이드바 active 클래스 (URL 기준) ─────────────────── */
  (function setSidebarActive() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const pageMap = {
      '':                    'home',
      '/':                   'home',
      '/calculator':         'calc',
      '/loan-calculator':   'loan',
      '/base-converter':     'base',
      '/area-converter':     'area',
      '/length-converter':   'length',
      '/distance-converter': 'distance',
      '/weight-converter':   'weight',
      '/pdf-watermark':      'pdf',
      '/space-explorer':     'space',
      '/timer':              'timer',
      '/powerball':          'powerball',
      '/mega-millions':      'mega',
    };
    const activePage = pageMap[path] || 'home';
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === activePage);
    });
  })();


  /* ── 다크/라이트 테마 토글 ─────────────────────────────── */
  const themeToggleBtn   = document.getElementById('theme-toggle');
  const themeToggleIcon  = themeToggleBtn?.querySelector('.theme-toggle-icon');
  const themeToggleText  = themeToggleBtn?.querySelector('.theme-toggle-text');
  const metaThemeColor   = document.getElementById('meta-theme-color');

  function updateThemeLabel() {
    if (!themeToggleText) return;
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleText.textContent = isDark ? tr('theme.light') : tr('theme.dark');
  }

  const savedTheme = localStorage.getItem('themePreference') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#090d16');
  } else {
    document.body.classList.remove('dark-theme');
    if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#d1d7e0');
  }
  updateThemeLabel();

  themeToggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
      localStorage.setItem('themePreference', 'dark');
      if (themeToggleIcon) themeToggleIcon.textContent = '🌙';
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#090d16');
    } else {
      localStorage.setItem('themePreference', 'light');
      if (themeToggleIcon) themeToggleIcon.textContent = '☀️';
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#d1d7e0');
    }
    updateThemeLabel();
  });

  window.addEventListener('langchange', updateThemeLabel);


  /* ── 방문자 카운터 ─────────────────────────────────────── */
  (function initVisitorCounter() {
    const countEl = document.getElementById('vc-count');
    if (!countEl) return;

    function render(n) {
      if (typeof n === 'number') countEl.textContent = n.toLocaleString();
    }

    const today = new Date().toISOString().slice(0, 10);
    const last  = localStorage.getItem('utilall_visit_day');
    const firstToday = last !== today;

    const req = firstToday
      ? fetch('/api/visit', { method: 'POST' })
      : fetch('/api/visits');

    req.then(r => r.json())
       .then(d => { if (firstToday) localStorage.setItem('utilall_visit_day', today); render(d.total); })
       .catch(() => { countEl.textContent = '—'; });
  })();


  /* ── 홈 info-tabs (소개 / 이용 가이드 / FAQ) ──────────── */
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

});
