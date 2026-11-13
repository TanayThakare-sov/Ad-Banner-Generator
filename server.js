// Zero-dependency Node server: serves /public and stores templates in data/templates.json
const http = require('http');
const fs = require('fs');
const path = require('path');
const { BRAND } = require('./public/js/banners.js');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DB = path.join(__dirname, 'data', 'templates.json');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };

function readDb() { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch (e) { return []; } }
function send(res, code, body, type) { res.writeHead(code, { 'Content-Type': type || 'application/json' }); res.end(typeof body === 'string' ? body : JSON.stringify(body)); }

function clean(b) {
  const s = (v, n) => String(v || '').slice(0, n);
  const t = { name: s(b.name, 40), headline: s(b.headline, BRAND.max.headline), offer: s(b.offer, BRAND.max.offer), cta: s(b.cta, BRAND.max.cta), color: s(b.color, 7) };
  if (!t.name || !t.headline || !t.cta) return null;
  if (!Object.values(BRAND.colors).includes(t.color)) return null;
  return t;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/templates' && req.method === 'GET') return send(res, 200, readDb());
  if (url.pathname === '/api/templates' && req.method === 'POST') {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1e5) req.destroy(); });
    req.on('end', () => {
      let t; try { t = clean(JSON.parse(raw)); } catch (e) { t = null; }
      if (!t) return send(res, 400, { error: 'Invalid template data.' });
      const list = readDb().filter((x) => x.name !== t.name); list.push(t);
      fs.writeFileSync(DB, JSON.stringify(list, null, 2));
      send(res, 201, t);
    });
    return;
  }
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, { error: 'Not found' });
    send(res, 200, buf, TYPES[path.extname(file)] || 'application/octet-stream');
  });
});

if (require.main === module) server.listen(PORT, () => console.log('Running at http://localhost:' + PORT));
module.exports = server;
