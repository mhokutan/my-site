const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const API_TOKEN = process.env.AI_API_TOKEN || process.env.API_TOKEN || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const ipHits = new Map();

if (!GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_API_KEY environment variable.');
  process.exit(1);
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN
  });
  res.end(JSON.stringify(obj));
}

function rateLimited(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipHits.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  ipHits.set(ip, entry);
  return entry.count > RATE_MAX;
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type,X-API-Key',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
    });
    return res.end();
  }
  if (req.method === 'POST' && req.url === '/api/ai') {
    if (API_TOKEN && req.headers['x-api-key'] !== API_TOKEN) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }
    if (rateLimited(req)) {
      return sendJson(res, 429, { error: 'Too many requests' });
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.connection.destroy(); // limit body size
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const messages = Array.isArray(data.messages) ? data.messages : [];
        const contents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content || '').slice(0, 500) }]
        }));
        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
        const apiJson = await apiRes.json();
        const reply = apiJson.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
        return sendJson(res, 200, { reply });
      } catch (err) {
        console.error('AI error', err);
        return sendJson(res, 500, { error: 'AI request failed' });
      }
    });
  } else {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(filePath);
      const map = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
      res.writeHead(200, {
        'Content-Type': map[ext] || 'text/plain',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN
      });
      res.end(content);
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
