/* db.js — PostgreSQL 연결 + 스키마 초기화
 * - 프로덕션: DATABASE_URL(Railway Postgres)로 연결
 * - 로컬 개발/테스트: USE_PGMEM=1 이면 pg-mem(인메모리) 사용 → DB 없이 전체 흐름 테스트 가능
 * DATABASE_URL / USE_PGMEM 둘 다 없으면 미설정 상태로 두고, 회원/게시판 API는 503을 반환한다.
 */
let pool = null;
let ready = false;

async function init() {
  if (process.env.USE_PGMEM === '1') {
    const { newDb } = require('pg-mem');
    const mem = newDb();
    const pg = mem.adapters.createPg();
    pool = new pg.Pool();
    console.log('[db] using in-memory pg-mem (dev)');
  } else if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Railway 내부 프라이빗 URL은 SSL 불필요. 외부/관리형 DB면 PGSSL=require 설정.
      ssl: process.env.PGSSL === 'require' ? { rejectUnauthorized: false } : false,
    });
    console.log('[db] using PostgreSQL (DATABASE_URL)');
  } else {
    console.warn('[db] DATABASE_URL 미설정 — 회원/게시판 기능 비활성화 (방문자 카운터는 정상 동작)');
    return false;
  }

  await migrate();
  ready = true;
  return true;
}

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      pass_hash TEXT NOT NULL,
      name TEXT,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_tokens (
      token TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      purpose TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_numbers (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      game TEXT NOT NULL,
      white TEXT NOT NULL,
      special INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
}

function q(text, params) {
  return pool.query(text, params);
}

module.exports = { init, q, isReady: () => ready };
