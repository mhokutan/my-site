"use strict";

/* ---- Backend bağlantıları ---- */
const WS_URL = "wss://chat-backend-xi60.onrender.com";
const API    = "https://chat-backend-xi60.onrender.com";

/* ---- State ---- */
let channels = JSON.parse(localStorage.getItem("channels")) || [
  "#genel","#teknoloji","#oyun","#spor","#film-dizi","#muzik","#egitim"
];
let currentChannel = localStorage.getItem("currentChannel") || "#genel";
let messagesByChannel = JSON.parse(localStorage.getItem("messagesByChannel")) || {};
let profile = JSON.parse(localStorage.getItem("profile")) || null;
let anonName = localStorage.getItem("anonName") || null;
let follows = JSON.parse(localStorage.getItem("follows")) || [];
let token = localStorage.getItem("token") || null;

/* ---- Elements ---- */
const channelListEl = document.getElementById("channelList");
const userListEl    = document.getElementById("userList");
const messagesEl    = document.getElementById("messages");
const topicEl       = document.getElementById("topic");
const typingArea    = document.getElementById("typingArea");
const form          = document.getElementById("form");
const input         = document.getElementById("input");

/* Modals */
const profileModal   = document.getElementById("profileModal");
const addChannelModal= document.getElementById("addChannelModal");
const hobbiesModal   = document.getElementById("hobbyModal");
const feedbackModal  = document.getElementById("feedbackModal");

/* Buttons */
const btnProfile     = document.getElementById("btnProfile");
const btnAddChannel  = document.getElementById("btnAddChannel");
const btnFeedback    = document.getElementById("btnFeedback");
const newChannelInput= document.getElementById("newChannelInput");

/* Profil alanları */
const countrySelect = document.getElementById("countrySelect");
const citySelect    = document.getElementById("citySelect");
const saveProfileBtn= document.getElementById("saveProfile");
const skipProfileBtn= document.getElementById("skipProfile");

/* ---- Helpers ---- */
function openModal(el){ el.classList.add("open"); }
function closeModal(el){ el.classList.remove("open"); }
function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion","Wolf"];
  const colors =["Blue","Red","Green","Black","White","Golden","Purple"];
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
  localStorage.setItem("follows", JSON.stringify(follows));
  if(token) localStorage.setItem("token", token);
}

/* ---- Profil ---- */
saveProfileBtn?.addEventListener("click", async ()=>{
  profile = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName : document.getElementById("lastName").value.trim(),
    country  : countrySelect.value,
    city     : citySelect.value
  };
  if(!anonName) anonName = randomAnonName();
  saveLocal();
  closeModal(profileModal);

  if(token){
    await fetch(API+"/profile/update",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ token, profile })
    });
  }
});
skipProfileBtn?.addEventListener("click", ()=>{
  profile = null;
  if(!anonName) anonName = randomAnonName();
  saveLocal(); closeModal(profileModal);
});

/* ---- Kanallar ---- */
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

/* ---- Users ---- */
function renderUsers(list = []){
  userListEl.innerHTML = "";
  const me = document.createElement("li");
  me.textContent = anonName || "Anonim";
  me.style.color = "#4fc3f7";
  userListEl.appendChild(me);

  list.forEach(u=>{
    if (u.display === anonName) return;
    const li = document.createElement("li");
    li.textContent = u.display;
    const btn = document.createElement("button");
    btn.textContent = follows.find(f=>f.uid===u.uid) ? "Takipten Çık" : "Takip";
    btn.onclick = (ev)=>{
      ev.stopPropagation();
      if(follows.find(f=>f.uid===u.uid)){
        unfollowByUid(u.uid);
      }else{
        followByUid(u.uid);
      }
    };
    li.appendChild(btn);
    userListEl.appendChild(li);
  });
}

/* ---- Messages ---- */
function renderMessages(ch){
  ensureChannelStore(ch);
  messagesEl.innerHTML = "";
  messagesByChannel[ch].forEach(m=>{
    const row = document.createElement("div");
    row.className = `message ${m.cls||""}`;
    row.innerHTML = `<span class="nick">${m.from}:</span> ${m.text}`;
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
    row.innerHTML = `<span class="nick">${from}:</span> ${text}`;
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
  ws.addEventListener("open", ()=> ws.send(JSON.stringify({ type:"join", channel: currentChannel, nick: anonName, token })));
  ws.addEventListener("message", (ev)=>{
    let msg; try { msg = JSON.parse(ev.data); } catch { return; }
    if (msg.type==="info") addInfo(msg.message);
    if (msg.type==="users") renderUsers(msg.users||[]);
    if (msg.type==="message") addMessage(currentChannel, msg.from, msg.text, msg.from==="AI"?"other":"other");
    if (msg.type==="typing") typingArea.innerHTML = `${msg.from} yazıyor...`;
  });
  ws.addEventListener("close", ()=> setTimeout(connectWS,1000));
  ws.addEventListener("error", ()=> ws.close());
}

/* ---- Kanal değiştir ---- */
function switchChannel(ch){
  currentChannel = ch;
  saveLocal();
  renderChannels(); renderMessages(ch);
  if (ws && ws.readyState===1) ws.send(JSON.stringify({ type:"join", channel: ch, nick: anonName, token }));
  else { try{ws.close();}catch{} connectWS(); }
  if ((messagesByChannel[ch]||[]).length===0) addInfo(`${ch} kanalına katıldın.`);
}

/* ---- Mesaj gönder ---- */
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage(currentChannel, anonName||"Ben", text, "me");
  input.value="";
  typingArea.innerHTML="";
  if(currentChannel==="#heponsigorta"){
    fetch(API+"/sponsor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})
    .then(r=>r.json()).then(d=>{ if(d.answer) addMessage(currentChannel,"HeponBot 🤖",d.answer); });
  }else{
    if(ws&&ws.readyState===1) ws.send(JSON.stringify({ type:"message", text }));
    else { addInfo("Bağlantı yok…"); connectWS(); }
  }
});

/* ---- Follow / Unfollow ---- */
async function followByUid(uid){
  if(!token){ alert("Takip için giriş gerekli"); return; }
  const r = await fetch(API+"/follow",{method:"POST",headers:{"Content-Type":"application/json"},body: JSON.stringify({ token, targetUid: uid })});
  const d = await r.json();
  if(d.success){ alert("Takip edildi"); }
}
async function unfollowByUid(uid){
  if(!token){ alert("Giriş gerekli"); return; }
  const r = await fetch(API+"/unfollow",{method:"POST",headers:{"Content-Type":"application/json"},body: JSON.stringify({ token, targetUid: uid })});
  const d = await r.json();
  if(d.success){ alert("Takipten çıkıldı"); }
}

/* ---- Feedback ---- */
document.getElementById("sendFeedback")?.addEventListener("click", async()=>{
  const txt=document.getElementById("feedbackText").value.trim();
  if(!txt) return;
  await fetch(API+"/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,text:txt})});
  alert("Teşekkürler! Öneriniz kaydedildi.");
  closeModal(feedbackModal);
});

/* ---- Boot ---- */
(function init(){
  if(!anonName) anonName=randomAnonName();
  channels.forEach(ensureChannelStore);
  renderChannels(); switchChannel(currentChannel);
  connectWS();
})();