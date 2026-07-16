/* jackpots.js — 파워볼/메가밀리언 예상 당첨금(잭팟) + USD→KRW 환율
 * 공식 사이트에서 서버측으로 가져온다(CORS 우회). 30분 캐시 + 8초 타임아웃(hang 방지).
 *   Powerball    : 홈페이지 HTML의 game-jackpot-number 파싱
 *   Mega Millions: GetLatestDrawData JSON (NextPrizePool / NextCashValue)
 *   환율         : open.er-api.com (무료, 키 불필요)
 */
const CACHE_MS = 30 * 60 * 1000;
let cache = { at: 0, data: null };

async function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms || 8000);
  try { return await fetch(url, Object.assign({ signal: ctrl.signal }, opts)); }
  finally { clearTimeout(timer); }
}

function parseUsdText(s) { // "$526 Million" → 526000000
  const m = String(s).match(/([\d,.]+)\s*(billion|million|thousand)?/i);
  if (!m) return null;
  let v = parseFloat(m[1].replace(/,/g, ''));
  if (isNaN(v)) return null;
  const u = (m[2] || '').toLowerCase();
  if (u === 'billion') v *= 1e9;
  else if (u === 'million') v *= 1e6;
  else if (u === 'thousand') v *= 1e3;
  return Math.round(v);
}

async function getPowerball() {
  const r = await fetchTimeout('https://www.powerball.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const m = [...html.matchAll(/game-jackpot-number[^>]*>\s*([^<]+?)\s*</g)].map(x => x[1].trim());
  if (!m.length) return null;
  const jackpot = parseUsdText(m[0]);
  return jackpot ? { jackpot, cash: m[1] ? parseUsdText(m[1]) : null } : null;
}

async function getMega() {
  const r = await fetchTimeout('https://www.megamillions.com/cmspages/utilservice.asmx/GetLatestDrawData',
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, body: '{}' });
  const outer = await r.json();
  const jp = (JSON.parse(outer.d) || {}).Jackpot || {};
  const jackpot = jp.NextPrizePool || jp.CurrentPrizePool || null;
  const cash = jp.NextCashValue || jp.CurrentCashValue || null;
  return jackpot ? { jackpot: Math.round(jackpot), cash: cash ? Math.round(cash) : null } : null;
}

async function getRate() {
  const r = await fetchTimeout('https://open.er-api.com/v6/latest/USD', {});
  const j = await r.json();
  return (j && j.rates && j.rates.KRW) ? j.rates.KRW : null;
}

async function getJackpots() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  const [pb, mm, rate] = await Promise.all([
    getPowerball().catch(e => (console.error('[jackpot:pb]', e.message), null)),
    getMega().catch(e => (console.error('[jackpot:mm]', e.message), null)),
    getRate().catch(e => (console.error('[jackpot:rate]', e.message), null)),
  ]);
  const data = { powerball: pb, mega: mm, usdkrw: rate, updated: new Date().toISOString() };
  if (pb || mm) cache = { at: Date.now(), data }; // 최소 하나라도 성공하면 캐시
  return data;
}

module.exports = { getJackpots };
