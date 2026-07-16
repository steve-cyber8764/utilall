/* store.js — 데이터 접근 계층 (users / email_tokens / sessions / posts)
 * 모든 쿼리는 파라미터 바인딩($1,$2…)만 사용해 SQL 인젝션을 방지한다.
 */
const crypto = require('crypto');
const { q } = require('./db');

/* ── 비밀번호 해시 (Node 내장 scrypt, 별도 의존성 없음) ── */
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(pw, stored) {
  try {
    const [alg, salt, hash] = String(stored).split('$');
    if (alg !== 'scrypt' || !salt || !hash) return false;
    const test = crypto.scryptSync(pw, salt, 64).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(test, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

const token = () => crypto.randomBytes(32).toString('hex');

/* ── users ── */
async function createUser(email, pw, name) {
  // 간편 가입: 인증메일 없이 즉시 활성(verified=TRUE) — Railway가 외부 SMTP를 차단하므로 SMTP 인증메일 대신 사용
  const r = await q(
    'INSERT INTO users (email, pass_hash, name, verified) VALUES ($1, $2, $3, TRUE) RETURNING id, email, name, verified',
    [email.toLowerCase(), hashPassword(pw), name || null]
  );
  return r.rows[0];
}
async function getUserByEmail(email) {
  const r = await q('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return r.rows[0] || null;
}
async function getUserById(id) {
  const r = await q('SELECT id, email, name, verified FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
}
async function setVerified(id) {
  await q('UPDATE users SET verified = TRUE WHERE id = $1', [id]);
}

/* ── email tokens (인증) ── */
async function createEmailToken(userId, purpose, ttlMs) {
  const t = token();
  const expires = new Date(Date.now() + ttlMs).toISOString();
  await q('INSERT INTO email_tokens (token, user_id, purpose, expires_at) VALUES ($1,$2,$3,$4)',
    [t, userId, purpose, expires]);
  return t;
}
async function consumeEmailToken(t, purpose) {
  const r = await q('SELECT * FROM email_tokens WHERE token = $1 AND purpose = $2', [t, purpose]);
  const row = r.rows[0];
  if (!row) return null;
  await q('DELETE FROM email_tokens WHERE token = $1', [t]);
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row.user_id;
}

/* ── sessions ── */
async function createSession(userId, ttlMs) {
  const t = token();
  const expires = new Date(Date.now() + ttlMs).toISOString();
  await q('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1,$2,$3)', [t, userId, expires]);
  return t;
}
async function getSessionUser(t) {
  if (!t) return null;
  const r = await q('SELECT s.expires_at, u.id, u.email, u.name, u.verified FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1', [t]);
  const row = r.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) { await deleteSession(t); return null; }
  return { id: row.id, email: row.email, name: row.name, verified: row.verified };
}
async function deleteSession(t) {
  if (t) await q('DELETE FROM sessions WHERE token = $1', [t]);
}

/* ── posts ── */
async function listPosts(limit) {
  const r = await q(
    `SELECT p.id, p.title, p.body, p.created_at, p.user_id, u.name AS author_name, u.email AS author_email
     FROM posts p JOIN users u ON u.id = p.user_id
     ORDER BY p.id DESC LIMIT $1`, [limit]);
  return r.rows;
}
async function createPost(userId, title, body) {
  const r = await q(
    'INSERT INTO posts (user_id, title, body) VALUES ($1,$2,$3) RETURNING id, title, body, created_at, user_id',
    [userId, title, body]);
  return r.rows[0];
}
async function getPost(id) {
  const r = await q('SELECT * FROM posts WHERE id = $1', [id]);
  return r.rows[0] || null;
}
async function deletePost(id) {
  await q('DELETE FROM posts WHERE id = $1', [id]);
}

/* ── saved_numbers (마이넘버) ── */
async function listSaved(userId, game) {
  const r = await q(
    'SELECT id, game, white, special, created_at FROM saved_numbers WHERE user_id = $1 AND game = $2 ORDER BY id DESC LIMIT 200',
    [userId, game]);
  return r.rows;
}
async function countSaved(userId, game) {
  const r = await q('SELECT COUNT(*)::int AS n FROM saved_numbers WHERE user_id = $1 AND game = $2', [userId, game]);
  return r.rows[0] ? r.rows[0].n : 0;
}
async function createSaved(userId, game, whiteCsv, special) {
  const r = await q(
    'INSERT INTO saved_numbers (user_id, game, white, special) VALUES ($1,$2,$3,$4) RETURNING id, game, white, special, created_at',
    [userId, game, whiteCsv, special]);
  return r.rows[0];
}
async function getSaved(id) {
  const r = await q('SELECT * FROM saved_numbers WHERE id = $1', [id]);
  return r.rows[0] || null;
}
async function deleteSaved(id) {
  await q('DELETE FROM saved_numbers WHERE id = $1', [id]);
}

module.exports = {
  hashPassword, verifyPassword,
  createUser, getUserByEmail, getUserById, setVerified,
  createEmailToken, consumeEmailToken,
  createSession, getSessionUser, deleteSession,
  listPosts, createPost, getPost, deletePost,
  listSaved, countSaved, createSaved, getSaved, deleteSaved,
};
