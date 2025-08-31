"use strict";

/* ------------------ Profil / modal ------------------ */
let nickname = localStorage.getItem("nickname") || "";
const modal = document.getElementById("modal");
const nicknameInput = document.getElementById("nicknameInput");
const saveProfile = document.getElementById("saveProfile");

function closeModal() { modal.style.display = "none"; }
function openModal() { modal.style.display = "flex"; setTimeout(() => nicknameInput?.focus(), 0); }

if (!nickname) openModal(); else closeModal();

saveProfile?.addEventListener("click", () => {
  const value = nicknameInput.value.trim();
  if (!value) return;
  nickname = value;
  localStorage.setItem("nickname", nickname);
  closeModal();
});

/* ------------------ Elemanlar & durum ------------------ */
let currentCategory = null;
const messagesEl = document.getElementById("messages");
const statusEl = document.getElementById("status");
const typingEl = document.getElementById("typing");
const form = document.getElementById("form");
const input = document.getElementById("input");

function addMessage(from, text, cls="") {
  const div = document.createElement("div");
  div.className = `message ${cls}`.trim();
  div.textContent = `${from}: ${text}`;
  messagesEl.appendChild(div);
  const nearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 40;
  if (nearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
}
function addInfo(text) {
  const div = document.createElement("div");
  div.className = "info";
  div.textContent = text;
  messagesEl.appendChild(div);
  const nearBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 40;
  if (nearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
}
function clearMessages(){ messagesEl.innerHTML = ""; }

/* ------------------ OpenAI Backend ------------------ */
async function botReplyWithAI(category, userText) {
  typingEl.hidden = false;
  try {
    const res = await fetch("https://chat-backend-xi60.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, message: userText })
    });
    const data = await res.json();
    typingEl.hidden = true;
    addMessage("AI", data.reply, "bot");
  } catch (err) {
    typingEl.hidden = true;
    addMessage("AI", "Üzgünüm, cevap alınamadı.", "bot");
  }
}

/* ------------------ Kategori seçimi ------------------ */
document.querySelectorAll("#categories li").forEach(li => {
  li.addEventListener("click", () => {
    if (!nickname) { openModal(); return; }
    document.querySelectorAll("#categories li").forEach(el => el.classList.remove("active"));
    li.classList.add("active");

    currentCategory = li.dataset.cat;
    clearMessages();
    statusEl.textContent = `Kategori: ${currentCategory}`;
    addInfo(`${currentCategory} sohbetine bağlandın.`);
  });
});

/* ------------------ Mesaj gönderme ------------------ */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentCategory) { alert("Lütfen önce kategori seçin."); return; }
  const text = input.value.trim();
  if (!text) return;
  addMessage(nickname || "Ben", text, "me");
  input.value = "";
  botReplyWithAI(currentCategory, text);
});
