"use strict";

/* ------------------ Profil / modal ------------------ */
let nickname = localStorage.getItem("nickname") || "";
const modal = document.getElementById("modal");
const nicknameInput = document.getElementById("nicknameInput");
const saveProfile = document.getElementById("saveProfile");

function closeModal() {
  modal.style.display = "none";
}
function openModal() {
  modal.style.display = "flex";
  setTimeout(() => nicknameInput?.focus(), 0);
}
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
  // auto-scroll (kullanıcı en aşağıdaysa)
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

/* ------------------ Demo Bot ------------------ */
const BOT_DELAY_MIN = 600, BOT_DELAY_MAX = 1200;
let botMsgCount = 0, botTimerEnd = null;

const RESPONSES = {
  "Genel Sohbet": [
    "Merhaba! Günün nasıl geçiyor?",
    "Hobilerin neler?",
    "Bugün ilginç bir şey oldu mu?"
  ],
  "Teknoloji": [
    "Son zamanlarda denediğin güzel bir uygulama var mı?",
    "Yapay zekâ araçlarına ilgin var mı?",
    "Hangi telefonu kullanıyorsun, memnun musun?"
  ],
  "Oyun": [
    "Şu ara ne oynuyorsun?",
    "Roguelike/indie oyunları seviyor musun?",
    "En sevdiğin platform nedir?"
  ],
  "Spor": [
    "Hangi takımı tutuyorsun?",
    "Son maçları izledin mi?",
    "Düzenli spor yapar mısın?"
  ],
  "Film & Dizi": [
    "Son izlediğin film hangisiydi, önerir misin?",
    "Dizi türünde favorin nedir?",
    "Sinema mı, dijital platform mu?"
  ],
  "Müzik": [
    "Ne tarz müzik dinlersin?",
    "Favori sanatçın kim?",
    "Son keşfettiğin şarkı nedir?"
  ],
  "Eğitim & Öğrenme": [
    "Şu an hangi konuda kendini geliştiriyorsun?",
    "Favori öğrenme kaynağın nedir?",
    "Günlük çalışma rutinin var mı?"
  ]
};

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randomDelay(){ return Math.floor(Math.random()*(BOT_DELAY_MAX-BOT_DELAY_MIN))+BOT_DELAY_MIN; }

function botReply(userText) {
  if (!currentCategory) return;
  const pool = RESPONSES[currentCategory] || ["Devam edelim!"];
  // basit anahtar kelime süsü
  const kw = (userText||"").toLowerCase();
  let extra = "";
  if (kw.includes("öner")) extra = " Bir öneri de istersen söyleyebilirim.";
  if (kw.includes("hangi")) extra = " Sen ne önerirsin?";
  const text = pick(pool) + extra;

  typingEl.hidden = false;
  setTimeout(() => {
    typingEl.hidden = true;
    addMessage("Bot", text, "bot");
    botMsgCount++;
    // 25 mesaj veya 3 dakika sınırı
    if (botMsgCount >= 25 || (botTimerEnd && Date.now() > botTimerEnd)) {
      addInfo("Süper sohbetti! İstersen yeni bir kategori seçerek devam edebilirsin.");
    }
  }, randomDelay());
}

/* ------------------ Kategori seçimi ------------------ */
document.querySelectorAll("#categories li").forEach(li => {
  li.addEventListener("click", () => {
    if (!nickname) { openModal(); return; }
    // aktif sınıf
    document.querySelectorAll("#categories li").forEach(el => el.classList.remove("active"));
    li.classList.add("active");

    currentCategory = li.dataset.cat;
    clearMessages();
    botMsgCount = 0;
    botTimerEnd = Date.now() + 3*60*1000; // 3 dakika
    statusEl.textContent = `Kategori: ${currentCategory} (Demo bot)`;
    addInfo(`${currentCategory} sohbetine bağlandın.`);
    // kategoriyi açar açmaz kısa karşılama
    typingEl.hidden = false;
    setTimeout(() => {
      typingEl.hidden = true;
      addMessage("Bot", "Merhaba! Küçük bir sohbet yapalım mı?", "bot");
    }, 500);
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
  botReply(text);
});
