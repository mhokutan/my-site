require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const OpenAI = require('openai');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static(__dirname));

const waiting = {}; // kategori -> bekleyen socketler
const banned = ['küfür', 'hakaret'];

function filter(text) {
  let res = text;
  banned.forEach(w => {
    const re = new RegExp(w, 'gi');
    res = res.replace(re, '***');
  });
  return res;
}

io.on('connection', socket => {
  let timeout;

  socket.on('join', ({ nickname, category }) => {
    socket.nickname = nickname || 'Anon';
    socket.category = category || 'genel';
    const list = waiting[socket.category] || (waiting[socket.category] = []);
    if (list.length > 0) {
      const peer = list.shift();
      const room = `${socket.id}#${peer.id}`;
      socket.join(room);
      peer.join(room);
      socket.room = room;
      peer.room = room;
      io.to(room).emit('system', `${socket.nickname} ve ${peer.nickname} bağlandı (${socket.category}).`);
    } else {
      list.push(socket);
      timeout = setTimeout(() => {
        const idx = list.indexOf(socket);
        if (idx !== -1) list.splice(idx, 1);
        socket.isWithAI = true;
        socket.room = socket.id;
        socket.join(socket.room);
        socket.emit('system', 'Yapay zekâ bağlandı.');
      }, 5000);
    }
  });

  socket.on('typing', () => {
    if (socket.room && !socket.isWithAI) {
      socket.to(socket.room).emit('typing', socket.nickname);
    }
  });

  socket.on('message', async msg => {
    msg.text = filter(msg.text);
    if (socket.isWithAI) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `Sen ${socket.category} hakkında doğal ve samimi sohbet eden bir asistansın.` },
            { role: 'user', content: msg.text }
          ]
        });
        const reply = completion.choices[0].message.content.trim();
        socket.emit('message', { id: Date.now().toString(36), nickname: 'AI', text: reply });
      } catch (err) {
        console.error('AI error', err);
        socket.emit('system', 'AI hata verdi.');
      }
    } else if (socket.room) {
      io.to(socket.room).emit('message', { ...msg, nickname: socket.nickname });
      if (msg.ephemeral) {
        setTimeout(() => io.to(socket.room).emit('deleteMessage', { id: msg.id }), 30000);
      }
    }
  });

  socket.on('delivered', id => {
    if (socket.room) socket.to(socket.room).emit('delivered', id);
  });

  socket.on('read', id => {
    if (socket.room) socket.to(socket.room).emit('read', id);
  });

  socket.on('editMessage', data => {
    if (socket.room) socket.to(socket.room).emit('editMessage', data);
  });

  socket.on('deleteMessage', data => {
    if (socket.room) socket.to(socket.room).emit('deleteMessage', data);
  });

  socket.on('reaction', data => {
    if (socket.room) socket.to(socket.room).emit('reaction', data);
  });

  const polls = new Map();
  socket.on('poll', poll => {
    polls.set(poll.id, { question: poll.question, options: poll.options, votes: new Array(poll.options.length).fill(0) });
    io.to(socket.room).emit('poll', { ...poll, votes: new Array(poll.options.length).fill(0) });
  });

  socket.on('vote', ({ id, option }) => {
    const poll = polls.get(id);
    if (!poll) return;
    poll.votes[option] = (poll.votes[option] || 0) + 1;
    io.to(socket.room).emit('pollUpdate', { id, options: poll.options, votes: poll.votes });
  });

  socket.on('rps', choice => {
    const opts = ['taş', 'kağıt', 'makas'];
    const ai = opts[Math.floor(Math.random() * 3)];
    let result = '';
    if (choice === ai) result = 'Berabere';
    else if ((choice === 'taş' && ai === 'makas') || (choice === 'kağıt' && ai === 'taş') || (choice === 'makas' && ai === 'kağıt'))
      result = 'Kazandın';
    else result = 'Kaybettin';
    socket.emit('rpsResult', `AI ${ai} seçti, ${result}.`);
  });

  socket.on('disconnect', () => {
    if (timeout) clearTimeout(timeout);
    const list = waiting[socket.category] || [];
    const idx = list.indexOf(socket);
    if (idx !== -1) list.splice(idx, 1);
    if (socket.room && !socket.isWithAI) {
      socket.to(socket.room).emit('system', 'Sohbetten ayrıldı.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
