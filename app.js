"use strict";

/* ---- WS backend adresi ---- */
const WS_URL = "wss://chat-backend-xi60.onrender.com";

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
const userListEl    = document.getElementById("userList");
const messagesEl    = document.getElementById("messages");
const topicEl       = document.getElementById("topic");
const typingEl      = document.getElementById("typing");
const form          = document.getElementById("form");
const input         = document.getElementById("input");

/* Modals & controls */
const profileModal      = document.getElementById("profileModal");
const addChannelModal   = document.getElementById("addChannelModal");
const btnProfile        = document.getElementById("btnProfile");
const btnAddChannel     = document.getElementById("btnAddChannel");
const btnClear          = document.getElementById("btnClear");
const newChannelInput   = document.getElementById("newChannelInput");
const confirmAddChannel = document.getElementById("confirmAddChannel");
const cancelAddChannel  = document.getElementById("cancelAddChannel");

/* Profil alanları */
const countrySelect = document.getElementById("countrySelect");
const citySelect    = document.getElementById("citySelect");
const saveProfileBtn= document.getElementById("saveProfile");
const skipProfileBtn= document.getElementById("skipProfile");

/* ---- Helpers ---- */
function openModal(el){ el.classList.add("open"); }
function closeModal(el){ el.classList.remove("open"); }
function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion","Hawk","Wolf","Falcon","Bear"];
  const colors =["Blue","Red","Green","Black","White","Golden","Cyan","Purple"];
  return colors[Math.floor(Math.random()*colors.length)]
       + animals[Math.floor(Math.random()*animals.length)]
       + Math.floor(Math.random()*1000);
}
function ensureChannelStore(ch){ if(!messagesByChannel[ch]) messagesByChannel[ch] = []; }
function saveLocal(){
  localStorage.setItem("channels", JSON.stringify(channels));
  localStorage.setItem("currentChannel", currentChannel);
  localStorage.setItem("messagesByChannel", JSON.stringify(messagesByChannel));
  if(profile) localStorage.setItem("profile", JSON.stringify(profile));
  if(anonName) localStorage.setItem("anonName", anonName);
}

/* ---- Country/City ---- */
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

/* ---- Profil ---- */
saveProfileBtn?.addEventListener("click", ()=>{
  profile = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName : document.getElementById("lastName").value.trim(),
    email    : document.getElementById("email").value.trim(),
    country  : countrySelect.value,
    city     : citySelect.value
  };
  if(!anonName) anonName = randomAnonName();
  saveLocal(); closeModal(profileModal);
});
skipProfileBtn?.addEventListener("click", ()=>{
  profile = null;
  if(!anonName) anonName = randomAnonName();
  saveLocal(); closeModal(profileModal);
});

/* ---- Menubar ---- */
btnProfile.addEventListener("click", ()=> openModal(profileModal));
btnAddChannel.addEventListener("click", ()=> { newChannelInput.value="#"; openModal(addChannelModal); });
btnClear.addEventListener("click", ()=>{
  localStorage.clear();
  channels = ["#genel","#teknoloji","#oyun","#spor","#film-dizi","#muzik","#egitim"];
  currentChannel = "#genel";
  messagesByChannel = {};
  profile = null; anonName = null;
  if (ws?.readyState === 1) ws.close();
  anonName = randomAnonName(); saveLocal();
  renderChannels(); switchChannel("#genel"); renderUsers();
  openModal(profileModal);
});
confirmAddChannel.addEventListener("click", ()=>{
  let ch = newChannelInput.value.trim();
  if(!ch) return;
  if(!ch.startsWith("#")) ch = "#"+ch;
  if(!channels.includes(ch)){ channels.push(ch); ensureChannelStore(ch); saveLocal(); renderChannels(); }
  closeModal(addChannelModal);
});
cancelAddChannel.addEventListener("click", ()=> closeModal(addChannelModal));

/* ---- UI Renderers ---- */
function renderChannels(){
  channelListEl.innerHTML = "";
  channels.forEach(ch=>{
    const li = document.createElement("li");
    li.textContent = ch;
    if (ch === currentChannel) li.classList.add("active");
    li.addEventListener("click", ()=> switchChannel(ch));
    channelListEl.appendChild(li);
  });
}
function renderUsers(list = []){
  userListEl.innerHTML = "";
  const me = document.createElement("li");
  me.textContent = anonName || "Anonim";
  me.style.color = "#4fc3f7";
  userListEl.appendChild(me);
  // server'dan gelen liste (ben hariç) + AI (oda boşsa server AI gönderir)
  list.filter(n => n !== undefined && n !== null).forEach(n=>{
    if (n === anonName) return;
    const li = document.createElement("li");
    li.textContent = n;
    li.style.color = "#a5d6a7";
    userListEl.appendChild(li);
  });
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
function addMessage(ch, from, text, cls){
  ensureChannelStore(ch);
  messagesByChannel[ch].push({from,text,cls});
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
function addInfo(text){
  const div = document.createElement("div");
  div.className = "info";
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ---- WebSocket ---- */
let ws;
function connectWS(){
  if (!anonName) anonName = randomAnonName();
  ws = new WebSocket(WS_URL);

  ws.addEventListener("open", ()=>{
    // aktif kanala katıl
    ws.send(JSON.stringify({ type:"join", channel: currentChannel, nick: anonName }));
  });

  ws.addEventListener("message", (ev)=>{
    let msg; try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.type === "info") {
      addInfo(msg.message);
    } else if (msg.type === "users") {
      renderUsers(msg.users || []);
    } else if (msg.type === "message") {
      // partnerden veya AI'den
      addMessage(currentChannel, msg.from, msg.text, msg.from === "AI" ? "other" : "other");
    }
  });

  // otomatik tekrar bağlan
  ws.addEventListener("close", ()=>{
    setTimeout(connectWS, 1000);
  });
  ws.addEventListener("error", ()=> ws.close());
}

/* ---- Kanal değiştir ---- */
function switchChannel(ch){
  currentChannel = ch;
  saveLocal();
  renderChannels();
  renderMessages(ch);
  const loc = profile ? `${profile.country||"Anonim"}/${profile.city||"—"}` : "Anonim";
  topicEl.textContent = `${ch} — ${loc}`;

  // WS açıkken başka kanala geçiş -> join gönder
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type:"join", channel: currentChannel, nick: anonName }));
  } else {
    // bağlantı yoksa yeniden bağlan
    try { ws.close(); } catch {}
    connectWS();
  }

  if ((messagesByChannel[ch] || []).length === 0) addInfo(`${ch} kanalına katıldın.`);
}

/* ---- Mesaj gönder ---- */
form.addEventListener("submit", (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage(currentChannel, anonName || "Ben", text, "me");
  input.value = "";
  typingEl.hidden = true;

  // WS üzerinden gönder; server oda boşsa AI fallback yapar
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type:"message", text }));
  } else {
    addInfo("Bağlantı yok. Tekrar bağlanılıyor…");
    connectWS();
  }
});

/* ---- Başlat ---- */
(function init(){
  if(!anonName){ anonName = (localStorage.getItem("anonName")) || null; }
  if(!anonName){ anonName = randomAnonName(); saveLocal(); }
  channels.forEach(ensureChannelStore);
  renderChannels(); switchChannel(currentChannel);
  connectWS();

  // nazikçe profil modali göster (opsiyonel)
  openModal(profileModal);
})();
async function followByUid(uid){
  if(!token){ alert("Takip etmek için giriş gerekir."); return; }
  const r = await fetch(API+"/follow",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ token, targetUid: uid })
  });
  const d = await r.json();
  if(d.success){ updateFollowCountsUI(d.following, d.followers); }
  else alert(d.error||"Takip edilemedi");
}

async function unfollowByUid(uid){
  if(!token){ alert("Giriş gerekli"); return; }
  const r = await fetch(API+"/unfollow",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ token, targetUid: uid })
  });
  const d = await r.json();
  if(d.success){ updateFollowCountsUI(d.following, d.followers); }
  else alert(d.error||"İşlem olmadı");
}

function updateFollowCountsUI(following, followers){
  // örn: menüde küçük bir text
  // document.getElementById("counts").textContent = `Takip: ${following} • Takipçi: ${followers}`;
}
