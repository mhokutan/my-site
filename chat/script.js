const socket = io();

const login = document.getElementById('login');
const chat = document.getElementById('chat');
const nicknameInput = document.getElementById('nickname');
const categorySelect = document.getElementById('category');
const joinBtn = document.getElementById('joinBtn');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const typingEl = document.getElementById('typing');
const ephemeralCheck = document.getElementById('ephemeral');

const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const reactBtn = document.getElementById('reactBtn');
const pollBtn = document.getElementById('pollBtn');
const rpsBtn = document.getElementById('rpsBtn');

const themeSelect = document.getElementById('themeSelect');
const bgPicker = document.getElementById('bgPicker');

// load preferences
window.addEventListener('load', () => {
  const t = localStorage.getItem('theme') || 'light';
  themeSelect.value = t;
  document.body.classList.toggle('dark', t === 'dark');
  const bg = localStorage.getItem('bg');
  if (bg) {
    bgPicker.value = bg;
    document.body.style.backgroundColor = bg;
  }
});

themeSelect.addEventListener('change', e => {
  const val = e.target.value;
  document.body.classList.toggle('dark', val === 'dark');
  localStorage.setItem('theme', val);
});

bgPicker.addEventListener('change', e => {
  const val = e.target.value;
  document.body.style.backgroundColor = val;
  localStorage.setItem('bg', val);
});

joinBtn.addEventListener('click', () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;
  socket.emit('join', { nickname: nick, category: categorySelect.value });
  login.classList.add('hidden');
  chat.classList.remove('hidden');
});

function uniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function addMessage(msg) {
  const div = document.createElement('div');
  div.className = 'msg ' + (msg.nickname === 'Ben' ? 'self' : 'peer');
  div.dataset.id = msg.id;
  div.innerHTML = `<span class="text">${msg.text}</span> <span class="meta" id="meta-${msg.id}"></span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function send() {
  const text = msgInput.value.trim();
  if (text === '') return;
  const msg = { id: uniqueId(), text, ephemeral: ephemeralCheck.checked };
  socket.emit('message', msg);
  addMessage({ ...msg, nickname: 'Ben' });
  msgInput.value = '';
}

sendBtn.addEventListener('click', send);
msgInput.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });

msgInput.addEventListener('input', () => {
  socket.emit('typing');
});

socket.on('typing', nick => {
  typingEl.textContent = nick ? `${nick} yazıyor...` : '';
  if (nick) {
    setTimeout(() => { typingEl.textContent = ''; }, 1000);
  }
});

socket.on('message', msg => {
  addMessage(msg);
  socket.emit('delivered', msg.id);
  setTimeout(() => socket.emit('read', msg.id), 100);
});

socket.on('delivered', id => {
  const meta = document.getElementById('meta-' + id);
  if (meta) meta.textContent = '✓';
});

socket.on('read', id => {
  const meta = document.getElementById('meta-' + id);
  if (meta) meta.textContent = '✓✓';
});

editBtn.addEventListener('click', () => {
  const last = Array.from(messages.querySelectorAll('.self')).pop();
  if (!last) return;
  const id = last.dataset.id;
  const newText = prompt('Yeni mesaj', last.querySelector('.text').textContent);
  if (!newText) return;
  last.querySelector('.text').textContent = newText;
  socket.emit('editMessage', { id, text: newText });
});

deleteBtn.addEventListener('click', () => {
  const last = Array.from(messages.querySelectorAll('.self')).pop();
  if (!last) return;
  const id = last.dataset.id;
  last.remove();
  socket.emit('deleteMessage', { id });
});

reactBtn.addEventListener('click', () => {
  const last = Array.from(messages.querySelectorAll('.peer')).pop();
  if (!last) return;
  const id = last.dataset.id;
  let span = last.querySelector('.reactions');
  if (!span) {
    span = document.createElement('span');
    span.className = 'reactions';
    last.appendChild(span);
  }
  span.textContent += '👍';
  socket.emit('reaction', { id, emoji: '👍' });
});

pollBtn.addEventListener('click', () => {
  const question = prompt('Soru?');
  if (!question) return;
  const opts = prompt('Seçenekleri virgülle ayırın').split(',').map(s => s.trim()).filter(Boolean);
  if (opts.length < 2) return;
  const id = uniqueId();
  socket.emit('poll', { id, question, options: opts });
});

function renderPoll(poll) {
  const div = document.createElement('div');
  div.className = 'poll';
  div.dataset.id = poll.id;
  const q = document.createElement('div');
  q.textContent = poll.question;
  div.appendChild(q);
  poll.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${opt} (${poll.votes[i]})`;
    btn.addEventListener('click', () => socket.emit('vote', { id: poll.id, option: i }));
    div.appendChild(btn);
  });
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

socket.on('poll', poll => {
  if (!poll.votes) poll.votes = new Array(poll.options.length).fill(0);
  renderPoll(poll);
});

socket.on('pollUpdate', poll => {
  const div = messages.querySelector(`.poll[data-id="${poll.id}"]`);
  if (!div) return;
  const buttons = div.querySelectorAll('button');
  buttons.forEach((btn, i) => {
    btn.textContent = `${poll.options[i]} (${poll.votes[i]})`;
  });
});

rpsBtn.addEventListener('click', () => {
  const choice = prompt('Taş, Kağıt, Makas?').toLowerCase();
  if (!choice) return;
  socket.emit('rps', choice);
});

socket.on('rpsResult', msg => addSystem(msg));

function addSystem(text) {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

socket.on('system', addSystem);

socket.on('editMessage', data => {
  const el = messages.querySelector(`[data-id="${data.id}"] .text`);
  if (el) el.textContent = data.text;
});

socket.on('deleteMessage', data => {
  const el = messages.querySelector(`[data-id="${data.id}"]`);
  if (el) el.remove();
});

socket.on('reaction', data => {
  const el = messages.querySelector(`[data-id="${data.id}"]`);
  if (!el) return;
  let span = el.querySelector('.reactions');
  if (!span) {
    span = document.createElement('span');
    span.className = 'reactions';
    el.appendChild(span);
  }
  span.textContent += data.emoji;
});
