const ws = new WebSocket(`ws://${location.host}`);
let nickname = "";
while (!nickname) {
  nickname = prompt("Bir rumuz girin:");
}
let currentCategory = null;
const messagesEl = document.getElementById("messages");
const categoryEls = Array.from(document.querySelectorAll("#categories li"));

const pending = [];

function joinCategory(cat) {
  const payload = JSON.stringify({
    type: "join",
    category: cat,
    nickname,
  });
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    pending.push(payload);
  }
}

function addMessage(from, text) {
  const div = document.createElement("div");
  div.className = "message" + (from === nickname ? " me" : "");
  div.textContent = `${from}: ${text}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addInfo(text) {
  const div = document.createElement("div");
  div.className = "info";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function clearMessages() {
  messagesEl.innerHTML = "";
}

categoryEls.forEach((li) => {
  li.addEventListener("click", () => {
    currentCategory = li.dataset.cat;
    clearMessages();
    joinCategory(currentCategory);
  });
});

ws.addEventListener("open", () => {
  while (pending.length) ws.send(pending.shift());
  if (!currentCategory && categoryEls.length) {
    const random = categoryEls[Math.floor(Math.random() * categoryEls.length)];
    currentCategory = random.dataset.cat;
    clearMessages();
    joinCategory(currentCategory);
  }
});

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "info") {
    addInfo(msg.message);
  } else if (msg.type === "message") {
    addMessage(msg.from, msg.text);
  }
};

const form = document.getElementById("form");
const input = document.getElementById("input");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentCategory) return;
  const text = input.value.trim();
  if (!text) return;
  addMessage(nickname, text);
  ws.send(
    JSON.stringify({
      type: "message",
      text,
    })
  );
  input.value = "";
});
