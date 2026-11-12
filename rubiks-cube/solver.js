// NxN 큐브 논리 모델 + 단계별 풀이.
// 풀이 순서: (홀수) 가운데 센터 방향 → 패리티 → 면별 센터 → 모서리 → 코너.
// 모든 조각은 "그 조각 3개만 바꾸는" 교환자(commutator) 3-사이클로 맞추므로 이미 맞춘 부분은 깨지지 않는다.
(function (root) {
'use strict';
const NAMES = { ko: ['빨강', '주황', '흰색', '노랑', '초록', '파랑'], en: ['Red', 'Orange', 'White', 'Yellow', 'Green', 'Blue'] }; // +x -x +y -y +z -z
const GOALS = {
  ko: { mid: () => '가운데 센터를 제자리로 맞춥니다.', parity: () => '패리티(조각 배치의 짝·홀)를 맞춥니다.',
        center: n => `${n[0]} 면의 센터를 맞춥니다.`, edge: n => `${n[0]}-${n[1]} 모서리를 맞춥니다.`, corner: n => `${n.join('-')} 코너를 맞춥니다.` },
  en: { mid: () => 'Put the middle centers in place.', parity: () => 'Fix parity (even/odd piece arrangement).',
        center: n => `Solve the ${n[0]} center.`, edge: n => `Solve the ${n[0]}-${n[1]} edge.`, corner: n => `Solve the ${n.join('-')} corner.` },
};
// 목표 문장을 모든 언어로 만들어 둔다 (화면에서 언어를 바꿔도 다시 풀 필요 없음)
const goalAll = (k, faces = []) => { const r = {}; for (const l in GOALS) r[l] = GOALS[l][k](faces.map(f => NAMES[l][f])); return r; };

// 스티커 id = face*N³ + 큐비 위치(x,y,z). 회전 m = ((축*N + 층) << 2) | q, q는 +축 기준 90°×q
function Model(N) {
  const N2 = N * N, N3 = N2 * N, h = N - 1;
  const sid = (f, x, y, z) => f * N3 + x * N2 + y * N + z;
  const faceOf = s => Math.floor(s / N3);
  const cubieOf = s => s % N3;
  const coords = c => [Math.floor(c / N2), Math.floor(c / N) % N, c % N];
  const enc = (a, L, q) => ((a * N + L) << 2) | q;
  const inv = m => (m & ~3) | (4 - (m & 3));
  const dec = m => { const r = m >> 2; return [Math.floor(r / N), r % N, m & 3]; };
  const fm = (f, q) => enc(f >> 1, f % 2 === 0 ? h : 0, q);

  const stickers = [];
  for (let f = 0; f < 6; f++) {
    const a = f >> 1, v = f % 2 === 0 ? h : 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const c = [0, 0, 0]; c[a] = v; c[(a + 1) % 3] = i; c[(a + 2) % 3] = j;
      stickers.push(sid(f, c[0], c[1], c[2]));
    }
  }

  function cubieStickers(c) {
    const p = coords(c), out = [];
    for (let a = 0; a < 3; a++) {
      if (p[a] === h) out.push(sid(2 * a, p[0], p[1], p[2]));
      else if (p[a] === 0) out.push(sid(2 * a + 1, p[0], p[1], p[2]));
    }
    return out;
  }

  function mv1(s, m) {
    const q = m & 3, r0 = m >> 2, L = r0 % N, a = (r0 - L) / N;
    const f = Math.floor(s / N3);
    let c = s - f * N3;
    const z0 = c % N; c = (c - z0) / N;
    const y0 = c % N; const x0 = (c - y0) / N;
    if ((a === 0 ? x0 : a === 1 ? y0 : z0) !== L) return s;
    let x = 2 * x0 - h, y = 2 * y0 - h, z = 2 * z0 - h, nx = 0, ny = 0, nz = 0, t;
    const sg = f % 2 === 0 ? 1 : -1;
    if (f >> 1 === 0) nx = sg; else if (f >> 1 === 1) ny = sg; else nz = sg;
    for (let i = 0; i < q; i++) {
      if (a === 0) { t = y; y = -z; z = t; t = ny; ny = -nz; nz = t; }
      else if (a === 1) { t = z; z = -x; x = t; t = nz; nz = -nx; nx = t; }
      else { t = x; x = -y; y = t; t = nx; nx = -ny; ny = t; }
    }
    const nf = nx ? (nx > 0 ? 0 : 1) : ny ? (ny > 0 ? 2 : 3) : (nz > 0 ? 4 : 5);
    return sid(nf, (x + h) / 2, (y + h) / 2, (z + h) / 2);
  }

  const permCache = new Map();
  function perm(m) {
    let p = permCache.get(m);
    if (!p) {
      const [a, L] = dec(m);
      const src = stickers.filter(s => coords(cubieOf(s))[a] === L);
      p = { src: Int32Array.from(src), dst: Int32Array.from(src, s => mv1(s, m)), tmp: new Uint8Array(src.length) };
      permCache.set(m, p);
    }
    return p;
  }
  function apply(st, m) {
    const { src, dst, tmp } = perm(m);
    for (let i = 0; i < src.length; i++) tmp[i] = st[src[i]];
    for (let i = 0; i < src.length; i++) st[dst[i]] = tmp[i];
  }
  function solvedState() { const st = new Uint8Array(6 * N3); for (const s of stickers) st[s] = faceOf(s); return st; }
  function isSolved(st) {
    for (let f = 0; f < 6; f++) {
      const c0 = st[stickers[f * N2]];
      for (let i = 1; i < N2; i++) if (st[stickers[f * N2 + i]] !== c0) return false;
    }
    return true;
  }
  const allMoves = [];
  for (let a = 0; a < 3; a++) for (let L = 0; L < N; L++) for (let q = 1; q <= 3; q++) allMoves.push(enc(a, L, q));

  return { N, N2, N3, h, sid, faceOf, cubieOf, coords, enc, inv, dec, fm, stickers, cubieStickers, mv1, perm, apply, solvedState, isSolved, allMoves };
}

// ---- 교환자 모음: 모두 길이 8, 정확히 2~3개 조각만 움직인다 ----
function buildFamilies(md) {
  const { N, N3, h } = md;
  const SEQ = [], FROM = [], TO = [], LEN = [];
  const track = (s, seq, model = md) => { for (const m of seq) s = model.mv1(s, m); return s; };
  const push = (seq, from, to) => {
    for (let i = 0; i < 8; i++) SEQ.push(seq[i]);
    for (let i = 0; i < 9; i++) { FROM.push(i < from.length ? from[i] : -1); TO.push(i < to.length ? to[i] : -1); }
    LEN.push(from.length);
  };
  const add = (seq, from, to) => { push(seq, from, to); push(seq.slice().reverse().map(md.inv), to, from); };
  const nBound = c => md.coords(c).filter(v => v === 0 || v === h).length;

  // 센터: [슬라이스a, X·슬라이스b·X'] — 두 지지집합이 센터 1개에서만 겹친다
  for (let al = 0; al < 3; al++) for (let a = 1; a < h; a++) for (let X = 0; X < 6; X++) {
    const ax = X >> 1; if (ax === al) continue;
    const vX = X % 2 === 0 ? h : 0, t3 = 3 - ax - al;
    for (const q1 of [1, 3]) for (let b = 1; b < h; b++) {
      if (b === a) continue;
      let s0 = -1;
      for (let j = 1; j < h; j++) {
        const p = [0, 0, 0]; p[ax] = vX; p[al] = a; p[t3] = j;
        const s = md.sid(X, p[0], p[1], p[2]);
        if (md.coords(md.cubieOf(md.mv1(s, md.fm(X, q1))))[al] === b) { s0 = s; break; }
      }
      if (s0 < 0) continue;
      for (let qa = 1; qa <= 3; qa++) for (let qb = 1; qb <= 3; qb++) {
        const A = md.enc(al, a, qa), S = md.enc(al, b, qb);
        const seq = [A, md.fm(X, q1), S, md.fm(X, 4 - q1), md.inv(A), md.fm(X, q1), md.inv(S), md.fm(X, 4 - q1)];
        const s1 = track(s0, seq), s2 = track(s1, seq);
        if (s1 === s0 || track(s2, seq) !== s0) continue;
        add(seq, [s0, s1, s2], [s1, s2, s0]);
      }
    }
  }

  // 모서리(윙·가운데 모서리): [슬라이스a, X·W·X'] — W는 슬라이스와 평행한 바깥 면
  for (let al = 0; al < 3; al++) for (let a = 1; a < h; a++) for (let qa = 1; qa <= 3; qa++) {
    const A = md.enc(al, a, qa);
    const edgeSt = Array.from(md.perm(A).src).filter(s => nBound(md.cubieOf(s)) === 2);
    for (let X = 0; X < 6; X++) {
      if (X >> 1 === al) continue;
      for (const q1 of [1, 3]) for (const W of [2 * al, 2 * al + 1]) for (let q2 = 1; q2 <= 3; q2++) {
        const seq = [A, md.fm(X, q1), md.fm(W, q2), md.fm(X, 4 - q1), md.inv(A), md.fm(X, q1), md.fm(W, 4 - q2), md.fm(X, 4 - q1)];
        const s0 = edgeSt.find(s => track(s, seq) !== s);
        if (s0 === undefined) continue;
        const p0 = md.cubieStickers(md.cubieOf(s0)).find(s => s !== s0);
        const s1 = track(s0, seq), s2 = track(s1, seq), p1 = track(p0, seq), p2 = track(p1, seq);
        if (track(s2, seq) !== s0) continue;
        add(seq, [s0, s1, s2, p0, p1, p2], [s1, s2, s0, p1, p2, p0]);
      }
    }
  }

  // 코너: [Y·W·Y', V] — 바깥 면만 쓰므로 3×3에서 순수한지 확인한 뒤 N에 맞게 옮긴다
  const m3 = N === 3 ? md : Model(3);
  const conv = s => { const p = m3.coords(m3.cubieOf(s)).map(v => (v === 2 ? h : v)); return md.sid(m3.faceOf(s), p[0], p[1], p[2]); };
  const convM = m => { const [a, L, q] = m3.dec(m); return md.enc(a, L === 2 ? h : 0, q); };
  const seen = new Set();
  for (let Y = 0; Y < 6; Y++) for (let q1 = 1; q1 <= 3; q1++) for (let W = 0; W < 6; W++) {
    if (W >> 1 === Y >> 1) continue;
    for (let q2 = 1; q2 <= 3; q2++) for (let V = 0; V < 6; V++) for (let q3 = 1; q3 <= 3; q3++) {
      const seq = [m3.fm(Y, q1), m3.fm(W, q2), m3.fm(Y, 4 - q1), m3.fm(V, q3), m3.fm(Y, q1), m3.fm(W, 4 - q2), m3.fm(Y, 4 - q1), m3.fm(V, 4 - q3)];
      const from = [], to = [];
      let pure = true;
      for (const s of m3.stickers) {
        const t = track(s, seq, m3);
        if (t === s) continue;
        if (m3.coords(m3.cubieOf(s)).some(v => v === 1)) { pure = false; break; }
        from.push(s); to.push(t);
      }
      if (!pure || !from.length || from.length > 9) continue;
      const key = from.map((s, i) => s + '>' + to[i]).join();
      if (seen.has(key)) continue;
      seen.add(key);
      push(seq.map(convM), from.map(conv), to.map(conv));
    }
  }

  // 조각(큐비) → 그 조각을 움직이는 교환자 목록 (CSR)
  const K = LEN.length;
  const cubiesOf = k => { const set = new Set(); for (let i = 0; i < LEN[k]; i++) set.add(md.cubieOf(FROM[k * 9 + i])); return set; };
  const start = new Int32Array(N3 + 1);
  for (let k = 0; k < K; k++) for (const c of cubiesOf(k)) start[c + 1]++;
  for (let c = 0; c < N3; c++) start[c + 1] += start[c];
  const fill = start.slice(0, N3), list = new Int32Array(start[N3]);
  for (let k = 0; k < K; k++) for (const c of cubiesOf(k)) list[fill[c]++] = k;

  // 궤도: 회전으로 서로 오갈 수 있는 조각 묶음 (union-find)
  const parent = Int32Array.from({ length: N3 }, (_, i) => i);
  const find = x => { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
  for (const m of md.allMoves) { const { src, dst } = md.perm(m); for (let i = 0; i < src.length; i++) parent[find(md.cubieOf(src[i]))] = find(md.cubieOf(dst[i])); }
  const cst = new Array(N3), members = new Map();
  for (const s of md.stickers) { const c = md.cubieOf(s); if (!cst[c]) { cst[c] = md.cubieStickers(c); const o = find(c); if (!members.has(o)) members.set(o, []); members.get(o).push(c); } }

  // 준비 동작(conjugate): 0~2수. 2수는 (아무 회전 → 바깥 면) — 같은 모서리의 두 윙을 다룰 때 필요
  const outer = md.allMoves.filter(m => { const L = md.dec(m)[1]; return L === 0 || L === h; });
  const mk = S => ({ S, Si: S.slice().reverse().map(md.inv) });
  const setups = (firsts) => {
    const out = [mk([])];
    firsts.forEach(m => out.push(mk([m])));
    firsts.forEach(m => outer.forEach(o => { if (md.dec(o)[0] !== md.dec(m)[0]) out.push(mk([m, o])); }));
    out.forEach((s, i) => (s.id = i));
    return out;
  };
  return {
    SEQ, FROM, TO, LEN, start, list, cst, members, orbit: c => find(c),
    setupsCorner: setups(outer), setupsOther: setups(md.allMoves),
  };
}

function simplify(md, moves) {
  const out = [];
  for (const m of moves) {
    const [a, L, q] = md.dec(m);
    let merged = false;
    for (let i = out.length - 1; i >= 0; i--) {
      const [a2, L2, q2] = md.dec(out[i]);
      if (a2 !== a) break;
      if (L2 === L) { const nq = (q + q2) % 4; if (nq) out[i] = md.enc(a, L, nq); else out.splice(i, 1); merged = true; break; }
    }
    if (!merged) out.push(m);
  }
  return out;
}

const vec = f => { const v = [0, 0, 0]; v[f >> 1] = f % 2 === 0 ? 1 : -1; return v; };
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

// 반환: [{ goal: '…을 맞춥니다.', moves: [회전…] }, …]
function solve(md, st0, lang = 'ko') {
  const F = md.fam || (md.fam = buildFamilies(md));
  const { N, N3, h } = md;
  const st = Uint8Array.from(st0);
  const stages = [];
  let cur = null;
  const begin = goals => stages.push(cur = { goal: goals[lang] || goals.ko, goals, moves: [] });
  const doMove = m => { md.apply(st, m); cur.moves.push(m); };
  const locked = new Uint8Array(N3);
  const free = new Map();
  for (const [o, mem] of F.members) free.set(o, mem.length);
  const lock = c => { if (!locked[c]) { locked[c] = 1; const o = F.orbit(c); free.set(o, free.get(o) - 1); } };
  const correct = c => F.cst[c].every(s => st[s] === md.faceOf(s));
  const setupsFor = c => (F.cst[c].length === 3 ? F.setupsCorner : F.setupsOther);

  const run = (s, seq) => { for (let i = 0; i < seq.length; i++) s = md.mv1(s, seq[i]); return s; };
  // 준비동작 U, 교환자 k, U⁻¹ 를 한 뒤 x 자리에 오는 스티커가 원래 있던 곳
  function pre(x, k, U) {
    let y = run(x, U.S);
    const b = k * 9;
    for (let i = 0; i < F.LEN[k]; i++) if (F.TO[b + i] === y) { y = F.FROM[b + i]; break; }
    return run(y, U.Si);
  }
  function cycleOk(k, U, allow) {
    const b = k * 9;
    for (let i = 0; i < F.LEN[k]; i++) if (!allow(md.cubieOf(run(F.FROM[b + i], U.Si)))) return false;
    return true;
  }
  function applyConj(k, U) {
    U.S.forEach(doMove);
    for (let i = 0; i < 8; i++) doMove(F.SEQ[k * 8 + i]);
    U.Si.forEach(doMove);
  }
  // t를 움직이는 (교환자, 준비동작) 후보들 — 짧은 준비동작부터
  function* candidates(t, maxLen = 2) {
    const x0 = F.cst[t][0];
    for (const U of setupsFor(t)) {
      if (U.S.length > maxLen) break;
      const tS = md.cubieOf(run(x0, U.S));
      for (let p = F.start[tS]; p < F.start[tS + 1]; p++) yield [F.list[p], U];
    }
  }
  function greedy(t) {
    const xs = F.cst[t];
    for (const [k, U] of candidates(t)) {
      if (!xs.every(x => st[pre(x, k, U)] === md.faceOf(x))) continue;
      if (!cycleOk(k, U, c => c === t || !locked[c])) continue;
      applyConj(k, U);
      return true;
    }
    return false;
  }
  // 바로 맞출 수 없으면, 안 맞춘 조각끼리 한 번 섞은 뒤 다시 시도
  function greedy2(t) {
    const snap = st.slice(), len = cur.moves.length;
    let tries = 0;
    for (const [k, U] of candidates(t, 1)) {
      if (!cycleOk(k, U, c => !locked[c])) continue;
      applyConj(k, U);
      if (greedy(t)) return true;
      st.set(snap); cur.moves.length = len;
      if (++tries > 100) break;
    }
    return false;
  }
  // 궤도의 마지막 3조각은 한꺼번에(교환자 1~2개로) 맞춘다 — 비틀림/뒤집힘까지 처리
  function endgame(o) {
    const Us = F.members.get(o).filter(c => !locked[c]);
    const X = Us.flatMap(c => F.cst[c]);
    const ok = f => X.every((x, i) => st[X[f(i)]] === md.faceOf(x));
    let done = X.every(x => st[x] === md.faceOf(x));
    for (let maxLen = 1; maxLen <= 2 && !done; maxLen++) {
      const cands = [], seen = new Set(), inU = new Set(Us);
      for (const u of Us) for (const [k, U] of candidates(u, maxLen)) {
        if (!cycleOk(k, U, c => inU.has(c))) continue;
        const pm = X.map(x => X.indexOf(pre(x, k, U))), key = pm.join();
        if (seen.has(key)) continue; // 효과가 같은 후보는 하나만
        seen.add(key);
        cands.push({ k, U, pm });
      }
      for (const c of cands) if (ok(i => c.pm[i])) { applyConj(c.k, c.U); done = true; break; }
      outer: for (const c1 of done ? [] : cands) for (const c2 of cands) {
        if (ok(i => c1.pm[c2.pm[i]])) { applyConj(c1.k, c1.U); applyConj(c2.k, c2.U); done = true; break outer; }
      }
    }
    if (!done) throw new Error('endgame failed');
    Us.forEach(lock);
  }
  function solveSlots(slots) {
    for (const t of slots) {
      if (locked[t]) continue;
      if (free.get(F.orbit(t)) <= 3) { endgame(F.orbit(t)); continue; }
      if (!correct(t) && !greedy(t) && !greedy2(t)) throw new Error('stuck: ' + cur.goal);
      lock(t);
    }
  }
  const cub = (x, y, z) => (x * N + y) * N + z;
  const at = (fixed, free3) => { // fixed: {축: 값}, free3: 남는 축 하나의 값
    const p = [0, 0, 0]; let fa = -1;
    for (let a = 0; a < 3; a++) if (a in fixed) p[a] = fixed[a]; else { fa = a; p[a] = free3; }
    return cub(p[0], p[1], p[2]);
  };
  const fixOf = fs => { const o = {}; for (const f of fs) o[f >> 1] = f % 2 === 0 ? h : 0; return o; };

  // 1) 홀수 큐브: 가운데 센터 6개를 가운데 슬라이스로 제자리에
  if (N % 2 === 1 && N >= 3) {
    const mid = h / 2;
    const tc = [0, 1, 2, 3, 4, 5].map(f => { const p = [mid, mid, mid]; p[f >> 1] = f % 2 === 0 ? h : 0; return md.sid(f, p[0], p[1], p[2]); });
    const mids = md.allMoves.filter(m => md.dec(m)[1] === mid);
    const startV = tc.map(s => st[s]).join(''), seen = new Map([[startV, null]]), q = [startV];
    while (q.length && !seen.has('012345')) {
      const v = q.shift();
      for (const m of mids) {
        const nv = new Array(6);
        tc.forEach((s, f) => { nv[tc.indexOf(md.mv1(s, m))] = v[f]; });
        const key = nv.join('');
        if (!seen.has(key)) { seen.set(key, [v, m]); q.push(key); }
      }
    }
    const path = [];
    for (let v = '012345'; seen.get(v); v = seen.get(v)[0]) path.unshift(seen.get(v)[1]);
    begin(goalAll('mid'));
    path.forEach(doMove);
    tc.forEach(s => lock(md.cubieOf(s)));
  }

  // 2) 패리티: 3-사이클은 짝순열만 만들 수 있으므로 홀순열인 궤도는 먼저 한 번 돌려 짝으로
  const home = c => {
    const [s1, s2] = F.cst[c];
    const n1 = vec(md.faceOf(s1)), n2 = vec(md.faceOf(s2)), m1 = vec(st[s1]), m2 = vec(st[s2]);
    const n3 = cross(n1, n2), m3 = cross(m1, m2), p = md.coords(c).map(v => 2 * v - h);
    const r = [0, 1, 2].map(i => m1[i] * dot(n1, p) + m2[i] * dot(n2, p) + m3[i] * dot(n3, p));
    return cub(...r.map(v => (v + h) / 2));
  };
  const odd = slots => {
    const idx = new Map(slots.map((c, i) => [c, i])), seen = new Uint8Array(slots.length);
    let par = 0;
    for (let i = 0; i < slots.length; i++) {
      if (seen[i]) continue;
      let len = 0;
      for (let j = i; !seen[j]; j = idx.get(home(slots[j]))) { seen[j] = 1; len++; }
      par ^= (len - 1) & 1;
    }
    return par === 1;
  };
  const corners = [[2, 4, 0], [2, 0, 5], [2, 5, 1], [2, 1, 4], [3, 4, 0], [3, 0, 5], [3, 5, 1], [3, 1, 4]];
  const cornerCubie = fs => { const o = fixOf(fs); return cub(o[0], o[1], o[2]); };
  const edges = [[2, 4], [2, 0], [2, 5], [2, 1], [3, 4], [3, 0], [3, 5], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1]];
  const edgeCubies = fs => { const o = fixOf(fs), out = []; for (let i = 1; i < h; i++) out.push(at(o, i)); return out; };
  const parityMoves = [];
  if (odd(corners.map(cornerCubie))) { parityMoves.push(md.enc(1, h, 1)); }
  parityMoves.forEach(m => md.apply(st, m));
  for (let k = 1; k < h - k; k++) {
    const orbitK = edges.flatMap(edgeCubies).filter(c => { const p = md.coords(c).find(v => v !== 0 && v !== h); return p === k || p === h - k; });
    if (odd(orbitK)) { const m = md.enc(1, k, 1); md.apply(st, m); parityMoves.push(m); }
  }
  if (parityMoves.length) {
    begin(goalAll('parity'));
    cur.moves.push(...parityMoves);
  }

  // 3) 면별 센터
  if (N >= 4) for (const f of [2, 3, 4, 5, 0, 1]) {
    begin(goalAll('center', [f]));
    const o = fixOf([f]), slots = [];
    for (let i = 1; i < h; i++) for (let j = 1; j < h; j++) {
      const p = [0, 0, 0], fr = [0, 1, 2].filter(a => !(a in o));
      p[f >> 1] = o[f >> 1]; p[fr[0]] = i; p[fr[1]] = j;
      slots.push(cub(p[0], p[1], p[2]));
    }
    solveSlots(slots);
  }
  // 4) 모서리
  if (N >= 3) for (const e of edges) {
    begin(goalAll('edge', e));
    solveSlots(edgeCubies(e));
  }
  // 5) 코너
  for (const c of corners) {
    begin(goalAll('corner', c));
    solveSlots([cornerCubie(c)]);
  }

  if (!md.isSolved(st)) throw new Error('not solved');
  return stages.map(s => ({ goal: s.goal, goals: s.goals, moves: simplify(md, s.moves) })).filter(s => s.moves.length);
}

const api = { Model, solve, simplify };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CubeSolver = api;
})(this);
