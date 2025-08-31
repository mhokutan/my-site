"use strict";

/* ====== Basit “IRC istemcisi” davranışı (frontend) ======
   - Kanallar listesi (solda), kullanıcı listesi (sağda)
   - Mesajlar ortada, alt bara yazılır
   - Profil opsiyonel (localStorage), anonim nick zorunlu
   - Kanallar arası geçiş (mesaj geçmişi kanal bazlı tutulur)
   - Eşleşme yoksa AI fallback (Render backend → OpenAI)
========================================================== */

const BACKEND_URL = "https://chat-backend-xi60.onrender.com/chat";

/* ---- State ---- */
let channels = JSON.parse(localStorage.getItem("channels")) || [
  "#genel","#teknoloji","#oyun","#spor","#film-dizi","#muzik","#egitim"
];
let currentChannel = localStorage.getItem("currentChannel") || "#genel";
let messagesByChannel = JSON.parse(localStorage.getItem("messagesByChannel")) || {};
let profile = JSON.parse(localStorage.getItem("profile")) || null;
let anonName = localStorage.getItem("anonName") || null;

/* ---- Elements ---- */
const channelListEl = document.getElementById("channelList");
const userListEl = document.getElementById("userList");
const messagesEl = document.getElementById("messages");
const topicEl = document.getElementById("topic");
const typingEl = document.getElementById("typing");
const form = document.getElementById("form");
const input = document.getElementById("input");

/* Modals & Menubar */
const profileModal = document.getElementById("profileModal");
const addChannelModal = document.getElementById("addChannelModal");
const btnProfile = document.getElementById("btnProfile");
const btnAddChannel = document.getElementById("btnAddChannel");
const btnClear = document.getElementById("btnClear");
const newChannelInput = document.getElementById("newChannelInput");
const confirmAddChannel = document.getElementById("confirmAddChannel");
const cancelAddChannel = document.getElementById("cancelAddChannel");

/* Profil form alanları */
const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");
const saveProfileBtn = document.getElementById("saveProfile");
const skipProfileBtn = document.getElementById("skipProfile");

/* ---- Yardımcılar ---- */
function openModal(el){ el.classList.add("open"); }
function closeModal(el){ el.classList.remove("open"); }

function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion","Hawk","Wolf","Falcon","Bear"];
  const colors =["Blue","Red","Green","Black","White","Golden","Cyan","Purple"];
  return colors[Math.floor(Math.random()*colors.length)]
        + animals[Math.floor(Math.random()*animals.length)]
        + Math.floor(Math.random()*1000);
}
function saveLocal(){
  localStorage.setItem("channels", JSON.stringify(channels));
  localStorage.setItem("currentChannel", currentChannel);
  localStorage.setItem("messagesByChannel", JSON.stringify(messagesByChannel));
  if(profile) localStorage.setItem("profile", JSON.stringify(profile));
  if(anonName) localStorage.setItem("anonName", anonName);
}
function ensureChannelStore(ch){
  if(!messagesByChannel[ch]) messagesByChannel[ch] = [];
}

/* ---- Ülke/Şehir dinamiği ---- */
const citiesByCountry = {
  "Türkiye": ["İstanbul","Ankara","İzmir"],
  "ABD": ["New York","Los Angeles","Chicago"],
  "Almanya": ["Berlin","Münih","Hamburg"],
  "İngiltere": ["Londra","Manchester","Birmingham"],
  "Fransa": ["Paris","Lyon","Marsilya"]
};
countrySelect?.addEventListener("change", e=>{
  const c=e.target.value;
  citySelect.innerHTML = '<option value="">Seçiniz</option>';
  if(c && citiesByCountry[c]){
    citiesByCountry[c].forEach(ct=>{
      const opt=document.createElement("option");
      opt.value=ct; opt.textContent=ct;
      citySelect.appendChild(opt);
    });
  }
});

/* ---- Profil işlemleri ---- */
saveProfileBtn?.addEventListener("click", ()=>{
  profile = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName:  document.getElementById("lastName").value.trim(),
    email:     document.getElementById("email").value.trim(),
    country:   countrySelect.value,
    city:      citySelect.value
  };
  if(!anonName){ anonName = randomAnonName(); }
  saveLocal();
  closeModal(profileModal);
});
skipProfileBtn?.addEventListener("click", ()=>{
  profile = null;
  if(!anonName){ anonName = randomAnonName(); }
  saveLocal();
  closeModal(profileModal);
});

/* ---- Menubar aksiyonları ---- */
btnProfile.addEventListener("click", ()=> openModal(profileModal));
btnAddChannel.addEventListener("click", ()=>{
  newChannelInput.value = "#";
  openModal(addChannelModal);
});
btnClear.addEventListener("click", ()=>{
  localStorage.clear();
  // sadece kritik state reset
  channels = ["#genel","#teknoloji","#oyun","#spor","#film-dizi","#muzik","#egitim"];
  currentChannel = "#genel";
  messagesByChannel = {};
  profile = null; anonName = null;
  renderChannels(); switchChannel("#genel"); renderUsers();
  // profil modala davet
  openModal(profileModal);
});

/* ---- Kanal ekleme ---- */
confirmAddChannel.addEventListener("click", ()=>{
  let ch = newChannelInput.value.trim();
  if(!ch) return;
  if(!ch.startsWith("#")) ch = "#"+ch;
  if(!channels.includes(ch)){
    channels.push(ch);
    ensureChannelStore(ch);
    saveLocal();
    renderChannels();
  }
  closeModal(addChannelModal);
});
cancelAddChannel.addEventListener("click", ()=> closeModal(addChannelModal));

/* ---- Renderers ---- */
function renderChannels(){
  channelListEl.innerHTML = "";
  channels.forEach(ch=>{
    const li = document.createElement("li");
    li.textContent = ch;
    if(ch === currentChannel) li.classList.add("active");
    li.addEventListener("click", ()=> switchChannel(ch));
    channelListEl.appendChild(li);
  });
}
function renderUsers(){
  userListEl.innerHTML = "";
  const me = document.createElement("li");
  me.textContent = anonName || "Anonim";
  me.style.color = "#4fc3f7";
  userListEl.appendChild(me);

  const ai = document.createElement("li");
  ai.textContent = "AI";
  ai.style.color = "#a5d6a7";
  userListEl.appendChild(ai);
}
function renderMessages(ch){
  ensureChannelStore(ch);
  messagesEl.innerHTML = "";
  messagesByChannel[ch].forEach(m=>{
    const row = document.createElement("div");
    row.className = `message ${m.cls||""}`;
    const nick = document.createElement("span");
    nick.className = "nick";
    nick.textContent = m.from + ":";
    row.appendChild(nick);
    row.appendChild(document.createTextNode(" " + m.text));
    messagesEl.appendChild(row);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function addInfo(text){
  const div = document.createElement("div");
  div.className = "info";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function addMessage(ch, from, text, cls){
  ensureChannelStore(ch);
  messagesByChannel[ch].push({from,text,cls});
  // sadece aktif kanalsa ekrana bas
  if(ch === currentChannel){
    const row = document.createElement("div");
    row.className = `message ${cls||""}`;
    const nick = document.createElement("span");
    nick.className = "nick";
    nick.textContent = from + ":";
    row.appendChild(nick);
    row.appendChild(document.createTextNode(" " + text));
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  saveLocal();
}

/* ---- Kanal değiştirme ---- */
function prettifyCategory(ch){ return ch.replace(/^#/, "").replace(/-/g," "); }
function switchChannel(ch){
  currentChannel = ch;
  saveLocal();
  // başlık
  const loc = profile ? `${profile.country||"?"}/${profile.city||"?"}` : "Anonim";
  topicEl.textContent = `${ch} — ${loc}`;
  // sol listede aktif
  renderChannels();
  // mesajlar
  renderMessages(ch);
  // kullanıcılar (şimdilik ben + AI)
  renderUsers();
  // hoş geldin
  if(messagesByChannel[ch]?.length === 0){
    addInfo(`${ch} kanalına katıldın.`);
  }
}

/* ---- AI fallback ---- */
async function botReplyWithAI(category, userText){
  typingEl.hidden = false;
  try{
    const res = await fetch(BACKEND_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ category, message: userText })
    });
    const data = await res.json();
    typingEl.hidden = true;
    addMessage(currentChannel, "AI", data.reply || "…", "other");
  }catch(e){
    typingEl.hidden = true;
    addMessage(currentChannel, "AI", "⚠️ Sunucuya bağlanılamadı.", "other");
  }
}

/* ---- Mesaj gönderme ---- */
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text || !currentChannel) return;
  addMessage(currentChannel, anonName||"Ben", text, "me");
  input.value = "";
  // Şimdilik her kanalda AI fallback
  botReplyWithAI(prettifyCategory(currentChannel), text);
});

/* ---- İlk açılış ---- */
(function init(){
  if(!anonName){ anonName = randomAnonName(); saveLocal(); }
  channels.forEach(ensureChannelStore);
  renderChannels();
  switchChannel(currentChannel);
  renderUsers();
  // kullanıcıya profil modalını nazikçe göster (opsiyonel)
  openModal(profileModal);
})();
