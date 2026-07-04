/* =========================================================================
 * UtilAll static server + persistent visitor counter
 * - Serves the static site (index.html, assets, /space, ads.txt, etc.)
 * - GET  /api/visits  → { total }            (read current count)
 * - POST /api/visit   → { total }            (increment + persist)
 * Count is stored in a JSON file on a Railway Volume so it SURVIVES
 * redeploys. Railway sets RAILWAY_VOLUME_MOUNT_PATH when a volume is
 * attached; we fall back to a local ./data dir if none is mounted.
 * ========================================================================= */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
const COUNT_FILE = path.join(DATA_DIR, 'visits.json');

function readCount() {
  try {
    const raw = fs.readFileSync(COUNT_FILE, 'utf8');
    const n = JSON.parse(raw).total;
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
}

function writeCount(n) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(COUNT_FILE, JSON.stringify({ total: n }));
  } catch (e) {
    console.error('[visits] write failed:', e.message);
  }
}

let total = readCount();
console.log(`[visits] data dir: ${DATA_DIR} (starting total: ${total})`);

// --- Visitor counter API ---
app.get('/api/visits', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ total });
});

app.post('/api/visit', (req, res) => {
  total += 1;
  writeCount(total);
  res.set('Cache-Control', 'no-store');
  res.json({ total });
});

// --- Static site ---
// Don't expose the server's own files.
const BLOCK = new Set(['/server.js', '/package.json', '/package-lock.json', '/serve.json']);
app.use((req, res, next) => {
  if (BLOCK.has(req.path)) return res.status(404).end();
  next();
});

app.use(express.static(__dirname, {
  extensions: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.xml')) res.set('Content-Type', 'application/xml');
  }
}));

app.listen(PORT, () => console.log(`[utilall] listening on ${PORT}`));
