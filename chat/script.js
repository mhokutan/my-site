const socket = io();

const login = document.getElementById('login');
const chat = document.getElementById('chat');
const nicknameInput = document.getElementById('nickname');
const joinBtn = document.getElementById('joinBtn');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

joinBtn.addEventListener('click', () => {
  const nick = nicknameInput.value.trim();
  if (!nick) return;
  socket.emit('join', nick);
  login.classList.add('hidden');
  chat.classList.remove('hidden');
});

function send() {
  const text = msgInput.value.trim();
  if (text === '') return;
  socket.emit('message', text);
  addMessage('Ben', text);
  msgInput.value = '';
}

sendBtn.addEventListener('click', send);
msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') send();
});

function addMessage(nick, text) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${nick}:</strong> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

socket.on('message', data => {
  addMessage(data.nickname, data.text);
});

socket.on('system', msg => {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
