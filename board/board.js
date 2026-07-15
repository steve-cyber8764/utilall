/* board.js — 개선사항 게시판 (이메일 회원가입/로그인 + 글쓰기/목록)
 * 백엔드 API(server.js /api/*)와 통신. 로그인 상태에 따라 UI 전환.
 * 사용자 입력은 항상 esc()로 이스케이프해 XSS를 방지한다.
 */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const t = (k) => (window.I18N && window.I18N.t ? window.I18N.t(k) : k);
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
    // 주입 콘텐츠는 t()로 직접 번역 — applyI18n()을 부르면 langchange가 재발생해 무한 루프가 됨
    if (state.user) {
      const who = state.user.name || state.user.email;
      box.innerHTML =
        `<div class="bd-me">
           <span class="bd-me-hi"><b>${esc(who)}</b>${esc(t('bd.welcome'))}</span>
           <button class="bd-btn" data-action="logout">${esc(t('bd.logout'))}</button>
         </div>`;
      $('bd-write').style.display = '';
    } else {
      box.innerHTML =
        `<div class="bd-tabs">
           <button class="bd-tab active" data-tab="login">${esc(t('bd.tabLogin'))}</button>
           <button class="bd-tab" data-tab="signup">${esc(t('bd.tabSignup'))}</button>
         </div>
         <form class="bd-form" data-form="login">
           <input type="email" name="email" class="bd-input" placeholder="${esc(t('bd.phEmail'))}" autocomplete="email" required>
           <input type="password" name="password" class="bd-input" placeholder="${esc(t('bd.phPassword'))}" autocomplete="current-password" required>
           <button type="submit" class="bd-btn primary">${esc(t('bd.login'))}</button>
           <div class="bd-msg" data-msg="login"></div>
         </form>
         <form class="bd-form" data-form="signup" style="display:none">
           <input type="email" name="email" class="bd-input" placeholder="${esc(t('bd.phEmail'))}" autocomplete="email" required>
           <input type="password" name="password" class="bd-input" placeholder="${esc(t('bd.phPassword8'))}" autocomplete="new-password" required>
           <input type="text" name="name" class="bd-input" placeholder="${esc(t('bd.phName'))}" autocomplete="nickname" maxlength="40">
           <button type="submit" class="bd-btn primary">${esc(t('bd.signup'))}</button>
           <div class="bd-msg" data-msg="signup"></div>
         </form>`;
      $('bd-write').style.display = 'none';
    }
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
      box.innerHTML = `<div class="bd-empty">${esc(t('bd.empty'))}</div>`;
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
        const r = await api('POST', '/api/signup', { email, password, name });
        // 간편 가입: 성공 시 서버가 세션 쿠키+user를 반환 → 자동 로그인
        if (r.ok && r.data.user) { state.user = r.data.user; renderAuth(); loadPosts(); }
        else setMsg('signup', ERR(r.data.error), 'err');
      }
    } finally { btn.disabled = false; }
  });

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
