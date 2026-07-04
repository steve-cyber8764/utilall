/* =========================================================================
 * Space Distance Explorer — i18n (KO default / EN)
 * Strategy for EN:
 *   1) Mutate data arrays (values) to English using window.SPACE_TR.
 *   2) Override the Korean number/unit formatters.
 *   3) Translate the DOM (static + dynamically rendered) via a text pass +
 *      MutationObserver, using exact UI matches then regex/substring rules.
 * Language comes from the ?lang= query param (set by the parent UtilAll page),
 * falling back to timezone / browser language.
 * ========================================================================= */
(function () {
  function detectLang() {
    const p = new URLSearchParams(location.search).get('lang');
    if (p === 'ko' || p === 'en') return p;
    try { if ((Intl.DateTimeFormat().resolvedOptions().timeZone || '') === 'Asia/Seoul') return 'ko'; } catch (e) {}
    const nav = (navigator.language || '').toLowerCase();
    return nav.startsWith('ko') ? 'ko' : 'en';
  }

  const LANG = detectLang();
  window.SLANG = LANG;
  const TR = window.SPACE_TR || {};
  window.ST = (s) => s; // default passthrough (Korean); replaced below for EN

  if (LANG !== 'en') return; // Korean is the source language — nothing to do.

  /* ---- 1) Localize data arrays in place (runs before app.js renders) ---- */
  const tr = (s) => (TR[s] !== undefined ? TR[s] : s);
  function localizeList(list, fields) {
    if (!Array.isArray(list)) return;
    list.forEach(o => fields.forEach(f => { if (typeof o[f] === 'string') o[f] = tr(o[f]); }));
  }
  try {
    localizeList(window.PLANETS || (typeof PLANETS !== 'undefined' ? PLANETS : null),
      ['name', 'type', 'description', 'atmosphere', 'avgTemp', 'rotationPeriod', 'orbitalPeriod']);
    localizeList(typeof COUNTRIES !== 'undefined' ? COUNTRIES : null,
      ['name', 'capital', 'continent', 'currency']);
    // Galaxies & stars already carry nameEn: show English as the primary name,
    // and keep the Korean name as the secondary (nameEn) subtitle.
    [['GALAXIES', ['type', 'description', 'diameter', 'stars', 'age', 'blackHole', 'mass']],
     ['STARS', ['type', 'description']]].forEach(([arrName, fields]) => {
      const arr = (typeof window[arrName] !== 'undefined') ? window[arrName]
                : (arrName === 'GALAXIES' && typeof GALAXIES !== 'undefined') ? GALAXIES
                : (arrName === 'STARS' && typeof STARS !== 'undefined') ? STARS : null;
      if (!Array.isArray(arr)) return;
      arr.forEach(o => {
        fields.forEach(f => { if (typeof o[f] === 'string') o[f] = tr(o[f]); });
        if (o.nameEn) { const ko = o.name; o.name = o.nameEn; o.nameEn = ko; }
      });
    });
  } catch (e) { console.warn('[i18n] data localize failed', e); }

  /* ---- 2) Override Korean unit formatters with English versions ---- */
  window.formatLightYear = function (ly) {
    if (ly >= 1e9) return `${(ly / 1e9).toFixed(2)} billion ly`;
    if (ly >= 1e6) return `${(ly / 1e6).toFixed(2)} million ly`;
    if (ly >= 1e3) return `${(ly / 1e3).toFixed(1)}k ly`;
    return `${Math.round(ly).toLocaleString()} ly`;
  };
  window.formatKm = function (km) {
    if (km >= 1e9) return `${(km / 1e9).toFixed(3)} billion km`;
    if (km >= 1e6) return `${(km / 1e6).toFixed(2)} million km`;
    if (km >= 1e3) return `${(km / 1e3).toFixed(1)}k km`;
    return `${Math.round(km).toLocaleString()} km`;
  };

  /* ---- 3) DOM translation ---- */
  const UI = {
    // nav
    '☀️ 태양계': '☀️ Solar System', '🌍 나라간 거리': '🌍 Countries', '🌌 은하': '🌌 Galaxies', '⭐ 은하 내 별': '⭐ Stars',
    // hero
    '우주의 모든 거리': 'Explore Every Distance', '를': '', '탐색하세요': 'in the Universe',
    '태양계 행성부터 먼 은하까지, 세상 모든 거리를 한눈에': 'From planets to distant galaxies — every distance, at a glance',
    // solar section
    '☀️ 태양계 탐색': '☀️ Solar System', '두 천체를 선택하여 거리와 상세 정보를 확인하세요': 'Select two bodies to see their distance and details',
    '출발지': 'From', '목적지': 'To', '거리': 'Distance', '선택하세요': 'Select',
    'km (같은 천체)': 'km (same body)',
    // planet detail labels
    '지름': 'Diameter', '태양까지 거리': 'Distance from Sun', '공전 주기': 'Orbital period',
    '자전 주기': 'Rotation period', '평균 온도': 'Avg temperature', '위성 수': 'Moons',
    '질량': 'Mass', '중력': 'Gravity', '대기 성분': 'Atmosphere', '개': '',
    // countries section
    '🌍 나라 간 거리': '🌍 Distance Between Countries', '두 나라의 수도 간 직선 거리를 확인하세요': 'See the straight-line distance between two capitals',
    '출발 국가': 'From country', '도착 국가': 'To country', '국가를 선택하세요': 'Select a country',
    '두 나라를 선택하세요': 'Select two countries', '검색 결과 없음': 'No results',
    '🔍 국가 검색...': '🔍 Search country...',
    // galaxies section
    '🌌 은하 간 거리': '🌌 Distance Between Galaxies', '우리 은하와 주변 은하들 사이의 거리를 탐색하세요': 'Explore distances between the Milky Way and nearby galaxies',
    '은하를 선택하면 상세 정보가 표시됩니다': 'Select a galaxy to see its details',
    '두 번째 은하를 선택하면 거리를 비교할 수 있습니다': 'Select a second galaxy to compare distances',
    '두 은하 사이 거리': 'Distance between galaxies', '우리 은하': 'Milky Way',
    '유형': 'Type', '별의 수': 'Stars', '나이': 'Age', '블랙홀': 'Black hole',
    // stars section
    '⭐ 은하 내 별 탐색': '⭐ Stars in the Galaxy', '우리 은하 속 주요 별들 사이의 거리와 특성을 탐색하세요': 'Explore distances and properties of major stars in the Milky Way',
    '⬆ 위에서 본 뷰 (X-Y)': '⬆ Top view (X-Y)', '➡ 옆에서 본 뷰 (X-Z)': '➡ Side view (X-Z)',
    '🔍 별 A 선택': '🔍 Select star A', '🔍 별 B 선택': '🔍 Select star B', '별 이름 검색...': 'Search star name...',
    '별을 선택하세요': 'Select a star', '두 별을 선택하세요': 'Select two stars',
    '📚 주요 별 목록': '📚 Major star catalog', '클릭하면 A 또는 B로 선택됩니다': 'Click to set as A or B',
    '출발지 별 A를 선택해주세요': 'Please select star A', '목적지 별 B를 선택해주세요': 'Please select star B',
    '광년 (Light Years)': 'Light-years', '동일한 천체입니다': 'Same object', '0 광년': '0 ly', '0 km': '0 km', '기준점': 'Reference',
    '별 A': 'Star A', '별 B': 'Star B', '태양 기준:': 'From Sun:',
    // star spectral legend
    'O/B형 (청색 초거성)': 'O/B-type (blue supergiant)', 'A형 (백색 항성)': 'A-type (white star)',
    'F/G형 (황색 왜성/거성)': 'F/G-type (yellow dwarf/giant)', 'K형 (오렌지색 거성)': 'K-type (orange giant)',
    'M형 (적색 왜성/거성)': 'M-type (red dwarf/giant)',
    // star detail labels
    '지구로부터의 거리': 'Distance from Earth', '표면 온도': 'Surface temp', '항성 반경': 'Radius',
    '항성 질량': 'Mass', '절대 광도': 'Luminosity',
    // footer
    '🌌 Universe Distance Explorer — 모든 데이터는 천문학적 평균값 기준입니다': '🌌 Universe Distance Explorer — all data based on astronomical averages',
    '태양계 데이터: NASA JPL | 국가 데이터: UN Statistics | 은하 데이터: ESA/Hubble | 별 데이터: HYG Database / Hipparcos Catalog': 'Solar system: NASA JPL | Countries: UN Statistics | Galaxies: ESA/Hubble | Stars: HYG Database / Hipparcos Catalog'
  };

  const SUBS = [
    ['수도:', 'Capital:'], ['대륙:', 'Continent:'], ['면적:', 'Area:'],
    ['인구:', 'Population:'], ['통화:', 'Currency:'], ['태양 기준:', 'From Sun:'],
    [' (우리 은하로부터)', ' (from the Milky Way)']
  ];
  const RX = [
    [/🚀 빛의 속도로 이동 시 약 ([\d.,]+)년 소요/g, '🚀 ~$1 yrs at light speed'],
    [/🚀 빛의 속도로 이동 시 약 ([\d.,]+)일 소요/g, '🚀 ~$1 days at light speed'],
    [/🚀 빛의 속도로 이동 시 약 ([\d.,]+)시간 소요/g, '🚀 ~$1 hrs at light speed'],
    [/🚀 빛의 속도로도 수백만~수천만 년/g, '🚀 Millions–tens of millions of yrs even at light speed'],
    [/🚀 빛의 속도로 ([\d.,]+)시간/g, '🚀 $1 hrs at light speed'],
    [/🚀 빛의 속도로 ([\d.,]+)분/g, '🚀 $1 min at light speed'],
    [/약 ([\d.,]+)조 km/g, '≈ $1 trillion km'],
    [/약 ([\d.,]+)억 km/g, '≈ $1×10⁸ km'],
    [/([\d.,]+)\s*광년/g, '$1 ly'],
    [/([\d,]+)명/g, '$1']
  ];

  // Translator usable from app.js (e.g. canvas labels): data dict, then UI dict.
  window.ST = (s) => (typeof s === 'string' ? (TR[s] !== undefined ? TR[s] : (UI[s] !== undefined ? UI[s] : s)) : s);

  function translateText(value) {
    const key = value.trim();
    if (UI[key] !== undefined) return value.replace(key, UI[key]);
    let v = value;
    for (const [a, b] of SUBS) if (v.includes(a)) v = v.split(a).join(b);
    for (const [rx, rep] of RX) rx.lastIndex = 0, v = v.replace(rx, rep);
    return v;
  }

  function translateTextNode(n) {
    if (!n.nodeValue || !/[가-힣]/.test(n.nodeValue)) return;
    const nv = translateText(n.nodeValue);
    if (nv !== n.nodeValue) n.nodeValue = nv;
  }

  function translateEl(el) {
    if (el.nodeType !== 1) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
    // placeholders
    const phEls = el.matches && el.matches('[placeholder]') ? [el] : [];
    el.querySelectorAll && el.querySelectorAll('[placeholder]').forEach(e => phEls.push(e));
    phEls.forEach(e => { const k = e.getAttribute('placeholder'); if (UI[k] !== undefined) e.setAttribute('placeholder', UI[k]); });
  }

  function translateAll() {
    if (document.body) translateEl(document.body);
  }

  // Observe dynamic renders
  const obs = new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) translateEl(n);
      else if (n.nodeType === 3) translateTextNode(n);
    }));
  });

  function start() {
    document.documentElement.setAttribute('lang', 'en');
    document.title = 'Universe Distance Explorer';
    translateAll();
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
