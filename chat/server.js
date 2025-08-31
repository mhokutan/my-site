require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static(__dirname));

const waiting = [];

io.on('connection', socket => {
  let timeout;

  socket.on('join', nickname => {
    socket.nickname = nickname || 'Anon';
    if (waiting.length > 0) {
      const peer = waiting.shift();
      const room = `${socket.id}#${peer.id}`;
      socket.join(room);
      peer.join(room);
      socket.room = room;
      peer.room = room;
      io.to(room).emit('system', `${socket.nickname} ve ${peer.nickname} bağlandı.`);
    } else {
      waiting.push(socket);
      timeout = setTimeout(() => {
        const idx = waiting.indexOf(socket);
        if (idx !== -1) waiting.splice(idx,1);
        socket.isWithAI = true;
        socket.room = socket.id;
        socket.join(socket.room);
        socket.emit('system', 'Yapay zekâ bağlandı.');
      }, 5000);
    }
  });

  socket.on('message', async text => {
    if (socket.isWithAI) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Sen arkadaşça sohbet eden yardımcı bir yapay zekâsın.' },
            { role: 'user', content: text }
          ]
        });
        const reply = completion.choices[0].message.content.trim();
        socket.emit('message', { nickname: 'AI', text: reply });
      } catch (err) {
        console.error('AI error', err);
        socket.emit('message', { nickname: 'AI', text: 'Bir hata oluştu.' });
      }
    } else if (socket.room) {
      socket.to(socket.room).emit('message', { nickname: socket.nickname, text });
    }
  });

  socket.on('disconnect', () => {
    if (timeout) clearTimeout(timeout);
    const idx = waiting.indexOf(socket);
    if (idx !== -1) waiting.splice(idx,1);
    if (socket.room && !socket.isWithAI) {
      socket.to(socket.room).emit('system', 'Sohbetten ayrıldı.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
