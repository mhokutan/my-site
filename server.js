const http = require('http');
const fs = require('fs');
const path = require('path');

// Ensure `fetch` is available in older Node versions
const fetch = global.fetch || ((...args) =>
  import('node-fetch').then(({ default: f }) => f(...args)));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/ai') {
    if (!OPENAI_API_KEY) {
      return sendJson(res, 500, { error: 'OPENAI_API_KEY is not set' });
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
        const formattedMessages = messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 500)
        }));
        const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: formattedMessages
          })
        });
        const apiJson = await apiRes.json();
        if (!apiRes.ok) {
          const message = apiJson.error?.message || 'OpenAI API request failed';
          return sendJson(res, 500, { error: message });
        }
        const reply = apiJson.choices?.[0]?.message?.content || '';
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
      res.writeHead(200, { 'Content-Type': map[ext] || 'text/plain' });
      res.end(content);
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
