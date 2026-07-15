/* board.js — 개선사항 게시판 (이메일 회원가입/로그인 + 글쓰기/목록)
 * 백엔드 API(server.js /api/*)와 통신. 로그인 상태에 따라 UI 전환.
 * 사용자 입력은 항상 esc()로 이스케이프해 XSS를 방지한다.
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const t = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
  const applyI18n = () => { if (window.I18N && window.I18N.applyI18n) window.I18N.applyI18n(); };
  const lang = () => (window.I18N && window.I18N.lang) || 'ko';

  const state = { user: null, posts: [] };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

  async function api(method, path, body) {
    const opts = { method, credentials: 'same-origin', headers: {} };
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    let res, data = {};
    try {
      res = await fetch(path, opts);
      data = await res.json().catch(() => ({}));
    } catch (e) {
      return { ok: false, status: 0, data: { error: 'network' } };
    }
    return { ok: res.ok, status: res.status, data };
  }

  const ERR = (code) => t('bd.err.' + code) !== 'bd.err.' + code ? t('bd.err.' + code) : t('bd.err.server_error');

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const p = (n) => String(n).padStart(2, '0');
    const ymd = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    return `${ymd} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /* ── 인증 영역 렌더 ── */
  function renderAuth() {
    const box = $('bd-auth');
    if (state.user) {
      const who = state.user.name || state.user.email;
      box.innerHTML =
        `<div class="bd-me">
           <span class="bd-me-hi"><b>${esc(who)}</b><span data-i18n="bd.welcome"> 님, 환영합니다</span></span>
           <button class="bd-btn" data-action="logout" data-i18n="bd.logout">로그아웃</button>
         </div>`;
      $('bd-write').style.display = '';
    } else {
      box.innerHTML =
        `<div class="bd-tabs">
           <button class="bd-tab active" data-tab="login" data-i18n="bd.tabLogin">로그인</button>
           <button class="bd-tab" data-tab="signup" data-i18n="bd.tabSignup">회원가입</button>
         </div>
         <form class="bd-form" data-form="login">
           <input type="email" name="email" class="bd-input" data-i18n-ph="bd.phEmail" placeholder="이메일" autocomplete="email" required>
           <input type="password" name="password" class="bd-input" data-i18n-ph="bd.phPassword" placeholder="비밀번호" autocomplete="current-password" required>
           <button type="submit" class="bd-btn primary" data-i18n="bd.login">로그인</button>
           <button type="button" class="bd-link" data-action="resend" data-i18n="bd.resend">인증메일 재발송</button>
           <div class="bd-msg" data-msg="login"></div>
         </form>
         <form class="bd-form" data-form="signup" style="display:none">
           <input type="email" name="email" class="bd-input" data-i18n-ph="bd.phEmail" placeholder="이메일" autocomplete="email" required>
           <input type="password" name="password" class="bd-input" data-i18n-ph="bd.phPassword8" placeholder="비밀번호 (8자 이상)" autocomplete="new-password" required>
           <input type="text" name="name" class="bd-input" data-i18n-ph="bd.phName" placeholder="닉네임 (선택)" autocomplete="nickname" maxlength="40">
           <button type="submit" class="bd-btn primary" data-i18n="bd.signup">가입하기</button>
           <div class="bd-msg" data-msg="signup"></div>
         </form>`;
      $('bd-write').style.display = 'none';
    }
    applyI18n();
  }

  function switchTab(tab) {
    document.querySelectorAll('#bd-auth .bd-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
    document.querySelectorAll('#bd-auth .bd-form').forEach(f => f.style.display = f.getAttribute('data-form') === tab ? '' : 'none');
  }
  function setMsg(which, text, kind) {
    const el = document.querySelector(`#bd-auth .bd-msg[data-msg="${which}"]`);
    if (!el) return;
    el.textContent = text || '';
    el.className = 'bd-msg' + (kind ? ' ' + kind : '');
  }

  /* ── 목록 렌더 ── */
  function renderPosts() {
    const box = $('bd-list');
    if (!state.posts.length) {
      box.innerHTML = `<div class="bd-empty" data-i18n="bd.empty">아직 등록된 건의가 없습니다. 첫 글을 남겨보세요!</div>`;
      applyI18n();
    } else {
      box.innerHTML = state.posts.map(p =>
        `<article class="bd-post glass-panel">
           <div class="bd-post-head">
             <h4 class="bd-post-title">${esc(p.title)}</h4>
             ${p.mine ? `<button class="bd-del" data-del="${esc(p.id)}" title="${esc(t('bd.delete'))}">✕</button>` : ''}
           </div>
           <div class="bd-post-meta"><span class="bd-post-author">${esc(p.author)}</span><span class="bd-post-date">${esc(fmtDate(p.createdAt))}</span></div>
           <div class="bd-post-body">${nl2br(p.body)}</div>
         </article>`
      ).join('');
    }
    $('bd-list-count').textContent = state.posts.length ? '(' + state.posts.length + ')' : '';
  }

  /* ── 데이터 로드 ── */
  async function loadMe() {
    const r = await api('GET', '/api/me');
    state.user = r.data.user || null;
    renderAuth();
  }
  async function loadPosts() {
    const r = await api('GET', '/api/posts');
    if (r.ok) { state.posts = r.data.posts || []; renderPosts(); }
    else { $('bd-list').innerHTML = `<div class="bd-empty">${esc(ERR(r.data.error))}</div>`; }
  }

  /* ── 배너(이메일 인증 결과) ── */
  function showBanner() {
    const q = new URLSearchParams(location.search).get('verify');
    if (!q) return;
    const banner = $('bd-banner');
    banner.style.display = '';
    if (q === 'ok') { banner.className = 'bd-banner ok'; banner.textContent = t('bd.verifyOk'); }
    else { banner.className = 'bd-banner err'; banner.textContent = t('bd.verifyFail'); }
    history.replaceState(null, '', location.pathname);
  }

  /* ── 이벤트: 인증 영역 (위임) ── */
  $('bd-auth').addEventListener('click', async (e) => {
    const tabBtn = e.target.closest('.bd-tab');
    if (tabBtn) { switchTab(tabBtn.getAttribute('data-tab')); return; }
    const action = e.target.closest('[data-action]');
    if (!action) return;
    const act = action.getAttribute('data-action');
    if (act === 'logout') {
      await api('POST', '/api/logout');
      state.user = null; renderAuth(); loadPosts();
    } else if (act === 'resend') {
      const email = (document.querySelector('#bd-auth form[data-form="login"] input[name="email"]') || {}).value || '';
      if (!email) { setMsg('login', t('bd.needEmail'), 'err'); return; }
      const r = await api('POST', '/api/resend', { email, lang: lang() });
      setMsg('login', t('bd.resendSent'), 'ok');
      if (r.data.devLink) devLink('login', r.data.devLink);
    }
  });

  $('bd-auth').addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-form]');
    if (!form) return;
    e.preventDefault();
    const which = form.getAttribute('data-form');
    const email = (form.querySelector('input[name="email"]') || {}).value.trim();
    const password = (form.querySelector('input[name="password"]') || {}).value;
    const name = (form.querySelector('input[name="name"]') || {}).value || '';
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      if (which === 'login') {
        const r = await api('POST', '/api/login', { email, password });
        if (r.ok) { state.user = r.data.user; renderAuth(); loadPosts(); }
        else setMsg('login', ERR(r.data.error), 'err');
      } else {
        const r = await api('POST', '/api/signup', { email, password, name, lang: lang() });
        if (r.ok) {
          setMsg('signup', t('bd.signupSent'), 'ok');
          form.reset();
          if (r.data.devLink) devLink('signup', r.data.devLink);
        } else setMsg('signup', ERR(r.data.error), 'err');
      }
    } finally { btn.disabled = false; }
  });

  // 개발 모드에서만 서버가 devLink를 반환 → 인증 링크 노출(로컬 테스트용)
  function devLink(which, url) {
    const el = document.querySelector(`#bd-auth .bd-msg[data-msg="${which}"]`);
    if (el) el.innerHTML += ` <a href="${esc(url)}" style="color:var(--accent-blue)">[DEV 인증]</a>`;
  }

  /* ── 이벤트: 글쓰기 ── */
  $('bd-post-btn').addEventListener('click', async () => {
    const title = $('bd-post-title').value.trim();
    const body = $('bd-post-body').value.trim();
    const msg = $('bd-post-msg');
    if (!title || !body) { msg.textContent = t('bd.needBoth'); msg.className = 'bd-msg err'; return; }
    $('bd-post-btn').disabled = true;
    const r = await api('POST', '/api/posts', { title, body });
    $('bd-post-btn').disabled = false;
    if (r.ok) {
      $('bd-post-title').value = ''; $('bd-post-body').value = '';
      msg.textContent = t('bd.posted'); msg.className = 'bd-msg ok';
      state.posts.unshift(r.data.post); renderPosts();
    } else {
      msg.textContent = ERR(r.data.error); msg.className = 'bd-msg err';
    }
  });

  /* ── 이벤트: 삭제 (위임) ── */
  $('bd-list').addEventListener('click', async (e) => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    if (!confirm(t('bd.confirmDel'))) return;
    const id = del.getAttribute('data-del');
    const r = await api('DELETE', '/api/posts/' + encodeURIComponent(id));
    if (r.ok) { state.posts = state.posts.filter(p => String(p.id) !== String(id)); renderPosts(); }
    else alert(ERR(r.data.error));
  });

  window.addEventListener('langchange', () => { renderAuth(); renderPosts(); });

  showBanner();
  loadMe();
  loadPosts();
});
