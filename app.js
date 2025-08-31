let nickname = localStorage.getItem("nickname") || prompt("Rumuzunuzu girin:");
if (!nickname) nickname = "Misafir";

// Global değişkenler
let currentCategory = null;
const messagesEl = document.getElementById("messages");
const statusEl = document.getElementById("status");

// Mesaj ekleme
function addMessage(from, text, isBot=false) {
  const div = document.createElement("div");
  div.className = "message" + (from === nickname ? " me" : isBot ? " bot" : "");
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

// Basit demo bot yanıtları
function demoBotReply(category, userText) {
  const responses = {
    "Genel Sohbet": ["Merhaba! Günün nasıl geçti?", "Neler yapıyorsun?"],
    "Teknoloji": ["Son çıkan telefonları gördün mü?", "Yapay zekâ hakkında ne düşünüyorsun?"],
    "Oyun": ["En sevdiğin oyun hangisi?", "Şu ara ne oynuyorsun?"],
    "Spor": ["Hangi takımı tutuyorsun?", "Son maçları izledin mi?"],
    "Film & Dizi": ["Son izlediğin film hangisiydi?", "Bir dizi önerin var mı?"],
    "Müzik": ["Ne tarz müzik dinlersin?", "Favori sanatçın kim?"],
    "Eğitim & Öğrenme": ["Şu an hangi konuyu öğrenmeye çalışıyorsun?", "İyi kaynaklar önerebilir misin?"],
  };
  const pool = responses[category] || ["Hadi biraz sohbet edelim!"];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Kategori seçimi
document.querySelectorAll("#categories li").forEach((li) => {
  li.addEventListener("click", () => {
    currentCategory = li.dataset.cat;
    clearMessages();
    statusEl.textContent = `Kategori: ${currentCategory} (Bot ile)`;
    addInfo(`${currentCategory} sohbetine bağlandın.`);
  });
});

// Mesaj gönderme
const form = document.getElementById("form");
const input = document.getElementById("input");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentCategory) {
    alert("Lütfen önce kategori seçin.");
    return;
  }
  const text = input.value.trim();
  if (!text) return;
  addMessage(nickname, text);
  input.value = "";

  // Bot cevabı (gecikmeli)
  setTimeout(() => {
    const reply = demoBotReply(currentCategory, text);
    addMessage("Bot", reply, true);
  }, Math.random() * 1000 + 500);
});
