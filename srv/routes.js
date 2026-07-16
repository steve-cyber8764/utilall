/* routes.js — 회원(간편 가입) + 게시판 API
 * 엔드포인트:
 *   POST /api/signup   {email,password,name}  회원가입(즉시 활성) + 자동 로그인
 *   POST /api/login    {email,password}       로그인(세션 쿠키)
 *   POST /api/logout                          로그아웃
 *   GET  /api/me                              현재 로그인 사용자
 *   GET  /api/posts                           게시글 목록(공개)
 *   POST /api/posts    {title,body}           글쓰기(로그인 필요)
 *   DELETE /api/posts/:id                     내 글 삭제
 * 참고: Railway가 외부 SMTP를 차단하므로 이메일 인증 대신 간편 가입 사용.
 */
const express = require('express');
const store = require('./store');
const db = require('./db');

const router = express.Router();

const SESSION_TTL = 30 * 24 * 3600 * 1000; // 30일
const COOKIE = 'sid';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isDev = () => process.env.USE_PGMEM === '1' || process.env.MAIL_DEV === '1';

/* ── 쿠키 ── */
function getSid(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === COOKIE) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
function setSid(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: !isDev(), maxAge: SESSION_TTL, path: '/',
  });
}

/* ── 간단 레이트리밋 (IP+동작) ── */
const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

/* ── 공통 ── */
function requireDb(req, res, next) {
  if (!db.isReady()) return res.status(503).json({ error: 'db_unavailable' });
  next();
}
async function loadUser(req, res, next) {
  try { req.user = await store.getSessionUser(getSid(req)); }
  catch (e) { req.user = null; }
  next();
}
function displayName(name, email) {
  if (name && name.trim()) return name.trim();
  const [u, d] = String(email).split('@');
  return (u.slice(0, 2) + '***') + '@' + (d || '');
}

router.use(express.json({ limit: '64kb' }));
router.use(loadUser);

/* ── 회원가입 (간편 가입 + 자동 로그인) ── */
router.post('/signup', requireDb, async (req, res) => {
  if (limited('signup:' + req.ip, 15, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const name = String(req.body.name || '').trim().slice(0, 40);
  if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: 'invalid_email' });
  if (password.length < 8 || password.length > 200) return res.status(400).json({ error: 'weak_password' });

  try {
    if (await store.getUserByEmail(email)) return res.status(409).json({ error: 'email_taken' });
    const user = await store.createUser(email, password, name); // verified=TRUE
    const token = await store.createSession(user.id, SESSION_TTL);
    setSid(res, token); // 가입 즉시 자동 로그인
    res.json({ user: { email: user.email, name: user.name, verified: true } });
  } catch (e) {
    console.error('[signup]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 로그인 ── */
router.post('/login', requireDb, async (req, res) => {
  if (limited('login:' + req.ip, 20, 15 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  try {
    const user = await store.getUserByEmail(email);
    if (!user || !store.verifyPassword(password, user.pass_hash)) return res.status(401).json({ error: 'bad_credentials' });
    const token = await store.createSession(user.id, SESSION_TTL);
    setSid(res, token);
    res.json({ user: { email: user.email, name: user.name, verified: true } });
  } catch (e) {
    console.error('[login]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 로그아웃 ── */
router.post('/logout', async (req, res) => {
  try { await store.deleteSession(getSid(req)); } catch (e) {}
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

/* ── 현재 사용자 ── */
router.get('/me', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ user: req.user ? { email: req.user.email, name: req.user.name, verified: req.user.verified } : null });
});

/* ── 게시글 목록 (공개) ── */
router.get('/posts', requireDb, async (req, res) => {
  try {
    const rows = await store.listPosts(200);
    const posts = rows.map(p => ({
      id: p.id,
      title: p.title,
      body: p.body,
      createdAt: p.created_at,
      author: displayName(p.author_name, p.author_email),
      mine: !!(req.user && String(req.user.id) === String(p.user_id)),
    }));
    res.set('Cache-Control', 'no-store');
    res.json({ posts });
  } catch (e) {
    console.error('[posts:list]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 글쓰기 (로그인+인증 필요) ── */
router.post('/posts', requireDb, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  if (!req.user.verified) return res.status(403).json({ error: 'unverified' });
  if (limited('post:' + req.user.id, 20, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  const title = String(req.body.title || '').trim();
  const body = String(req.body.body || '').trim();
  if (title.length < 1 || title.length > 120) return res.status(400).json({ error: 'invalid_title' });
  if (body.length < 1 || body.length > 5000) return res.status(400).json({ error: 'invalid_body' });
  try {
    const p = await store.createPost(req.user.id, title, body);
    res.json({
      post: { id: p.id, title: p.title, body: p.body, createdAt: p.created_at, author: displayName(req.user.name, req.user.email), mine: true },
    });
  } catch (e) {
    console.error('[posts:create]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 내 글 삭제 ── */
router.delete('/posts/:id', requireDb, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  try {
    const post = await store.getPost(req.params.id);
    if (!post) return res.status(404).json({ error: 'not_found' });
    if (String(post.user_id) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' });
    await store.deletePost(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[posts:delete]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 마이넘버 (저장된 번호) ── */
const GAMES = {
  powerball: { whiteMax: 69, specialMax: 26 },
  mega: { whiteMax: 70, specialMax: 24 },
};
function mapSaved(r) {
  return {
    id: r.id, game: r.game,
    white: String(r.white).split(',').map(n => parseInt(n, 10)),
    special: r.special, createdAt: r.created_at,
  };
}

router.get('/mynumbers', requireDb, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  const game = req.query.game === 'mega' ? 'mega' : 'powerball';
  try {
    const rows = await store.listSaved(req.user.id, game);
    res.set('Cache-Control', 'no-store');
    res.json({ saved: rows.map(mapSaved) });
  } catch (e) { console.error('[mynumbers:list]', e.message); res.status(500).json({ error: 'server_error' }); }
});

router.post('/mynumbers', requireDb, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  const game = GAMES[req.body.game] ? req.body.game : null;
  if (!game) return res.status(400).json({ error: 'invalid_game' });
  const cfg = GAMES[game];
  const white = Array.isArray(req.body.white) ? req.body.white.map(n => parseInt(n, 10)) : [];
  const special = parseInt(req.body.special, 10);
  if (white.length !== 5 || new Set(white).size !== 5 ||
      white.some(n => !(n >= 1 && n <= cfg.whiteMax)) || !(special >= 1 && special <= cfg.specialMax)) {
    return res.status(400).json({ error: 'invalid_numbers' });
  }
  if (limited('save:' + req.user.id, 100, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  try {
    if (await store.countSaved(req.user.id, game) >= 100) return res.status(400).json({ error: 'too_many' });
    const row = await store.createSaved(req.user.id, game, white.sort((a, b) => a - b).join(','), special);
    res.json({ saved: mapSaved(row) });
  } catch (e) { console.error('[mynumbers:create]', e.message); res.status(500).json({ error: 'server_error' }); }
});

router.delete('/mynumbers/:id', requireDb, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'login_required' });
  try {
    const row = await store.getSaved(req.params.id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (String(row.user_id) !== String(req.user.id)) return res.status(403).json({ error: 'forbidden' });
    await store.deleteSaved(req.params.id);
    res.json({ ok: true });
  } catch (e) { console.error('[mynumbers:delete]', e.message); res.status(500).json({ error: 'server_error' }); }
});

module.exports = router;
