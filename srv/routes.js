/* routes.js — 회원(이메일 인증) + 게시판 API
 * 엔드포인트:
 *   POST /api/signup   {email,password,name,lang}  회원가입 + 인증메일 발송
 *   POST /api/resend   {email,lang}                인증메일 재발송
 *   GET  /api/verify?token=...                     이메일 인증 → /board/ 로 리다이렉트
 *   POST /api/login    {email,password}            로그인(세션 쿠키)
 *   POST /api/logout                               로그아웃
 *   GET  /api/me                                   현재 로그인 사용자
 *   GET  /api/posts                                게시글 목록(공개)
 *   POST /api/posts    {title,body}                글쓰기(로그인+인증 필요)
 *   DELETE /api/posts/:id                          내 글 삭제
 */
const express = require('express');
const store = require('./store');
const mail = require('./mail');
const db = require('./db');

const router = express.Router();

const SESSION_TTL = 30 * 24 * 3600 * 1000; // 30일
const VERIFY_TTL = 24 * 3600 * 1000;       // 24시간
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
function baseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

router.use(express.json({ limit: '64kb' }));
router.use(loadUser);

/* ── 회원가입 ── */
router.post('/signup', requireDb, async (req, res) => {
  if (limited('signup:' + req.ip, 10, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const name = String(req.body.name || '').trim().slice(0, 40);
  const lang = req.body.lang === 'en' ? 'en' : 'ko';
  if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: 'invalid_email' });
  if (password.length < 8 || password.length > 200) return res.status(400).json({ error: 'weak_password' });

  try {
    if (await store.getUserByEmail(email)) return res.status(409).json({ error: 'email_taken' });
    const user = await store.createUser(email, password, name);
    const token = await store.createEmailToken(user.id, 'verify', VERIFY_TTL);
    const link = `${baseUrl(req)}/api/verify?token=${token}`;
    let devLink;
    try {
      const r = await mail.sendVerification(email, link, lang);
      if (r && r.dev) devLink = link;
    } catch (e) {
      if (e.code === 'mail_not_configured') return res.status(500).json({ error: 'mail_not_configured' });
      throw e;
    }
    res.json({ ok: true, ...(devLink ? { devLink } : {}) });
  } catch (e) {
    console.error('[signup]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 인증메일 재발송 ── */
router.post('/resend', requireDb, async (req, res) => {
  if (limited('resend:' + req.ip, 10, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate_limited' });
  const email = String(req.body.email || '').trim().toLowerCase();
  const lang = req.body.lang === 'en' ? 'en' : 'ko';
  try {
    const user = await store.getUserByEmail(email);
    let devLink;
    if (user && !user.verified) {
      const token = await store.createEmailToken(user.id, 'verify', VERIFY_TTL);
      const link = `${baseUrl(req)}/api/verify?token=${token}`;
      try { const r = await mail.sendVerification(email, link, lang); if (r && r.dev) devLink = link; }
      catch (e) { if (e.code !== 'mail_not_configured') throw e; }
    }
    res.json({ ok: true, ...(devLink ? { devLink } : {}) }); // 이메일 존재 여부는 노출하지 않음
  } catch (e) {
    console.error('[resend]', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

/* ── 이메일 인증 ── */
router.get('/verify', requireDb, async (req, res) => {
  const token = String(req.query.token || '');
  try {
    const userId = await store.consumeEmailToken(token, 'verify');
    if (!userId) return res.redirect('/board/?verify=fail');
    await store.setVerified(userId);
    res.redirect('/board/?verify=ok');
  } catch (e) {
    console.error('[verify]', e.message);
    res.redirect('/board/?verify=fail');
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
    if (!user.verified) return res.status(403).json({ error: 'unverified' });
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

module.exports = router;
