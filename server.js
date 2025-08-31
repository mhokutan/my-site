import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.static('.'));

const server = createServer(app);
const wss = new WebSocketServer({ server });

const waiting = new Map(); // category => array of sockets
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }
    if (msg.type === 'join') {
      ws.nickname = msg.nickname;
      ws.category = msg.category;
      let queue = waiting.get(ws.category);
      if (queue && queue.length > 0) {
        const partner = queue.shift();
        ws.partner = partner;
        partner.partner = ws;
        ws.send(JSON.stringify({ type: 'info', message: `${partner.nickname} ile sohbettesiniz.` }));
        partner.send(JSON.stringify({ type: 'info', message: `${ws.nickname} ile sohbettesiniz.` }));
      } else {
        if (!queue) {
          queue = [];
          waiting.set(ws.category, queue);
        }
        queue.push(ws);
        ws.send(JSON.stringify({ type: 'info', message: 'Eşleşme bekleniyor...' }));
      }
    } else if (msg.type === 'message') {
      if (ws.partner && ws.partner.readyState === ws.OPEN) {
        ws.partner.send(JSON.stringify({ type: 'message', from: ws.nickname, text: msg.text }));
      } else {
        const reply = await aiReply(ws.category, msg.text);
        ws.send(JSON.stringify({ type: 'message', from: 'AI', text: reply }));
      }
    }
  });

  ws.on('close', () => {
    if (ws.partner && ws.partner.readyState === ws.OPEN) {
      ws.partner.send(JSON.stringify({ type: 'info', message: 'Karşı kullanıcı ayrıldı.' }));
      ws.partner.partner = null;
    } else {
      const queue = waiting.get(ws.category);
      if (queue) {
        const idx = queue.indexOf(ws);
        if (idx >= 0) queue.splice(idx, 1);
        if (queue.length === 0) waiting.delete(ws.category);
      }
    }
  });
});

async function aiReply(category, text) {
  if (!process.env.OPENAI_API_KEY) {
    return 'OpenAI anahtarı bulunamadı.';
  }
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `Sen ${category} konusunda sohbet eden yardımsever bir asistansın.` },
      { role: 'user', content: text }
    ]
  });
  return response.choices[0].message.content.trim();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
