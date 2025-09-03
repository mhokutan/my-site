"use strict";

/* ===================== Config ===================== */
const API = "https://chat-backend-xi60.onrender.com";
const WS_URL = "wss://chat-backend-xi60.onrender.com";

let token = localStorage.getItem("token");

// Global değişkenleri window'a ekle
window.API = API;
window.token = token;
let ws, currentChannel = "#genel";

// DOM elementleri
let btnLogin, btnProfile, btnLogout, btnLocation, btnSponsor, btnCreateChannel, btnDonate;
let authStatus, userName, userStatus, locationIndicator, currentLocation;
let messageInput, btnSend, messages, userList, channelList, sponsorList;
let loginModal, profileModal, locationModal, createChannelModal;
let nickname, firstName, lastName, gender, birth, country, city;

/* ===================== State ===================== */
let follows = JSON.parse(localStorage.getItem("follows") || "[]");
const bannedWords = ["küfür1","küfür2","badword"];

/* ===================== DOM Initialization ===================== */
function initDOM() {
  // Butonlar
  btnLogin = document.getElementById('btnLogin');
  btnProfile = document.getElementById('btnProfile');
  btnLogout = document.getElementById('btnLogout');
  btnLocation = document.getElementById('btnLocation');
  btnSponsor = document.getElementById('btnSponsor');
  btnCreateChannel = document.getElementById('btnCreateChannel');
  btnDonate = document.getElementById('btnDonate');
  
  // UI elementleri
  authStatus = document.getElementById('authStatus');
  userName = document.getElementById('userName');
  userStatus = document.getElementById('userStatus');
  locationIndicator = document.getElementById('locationIndicator');
  currentLocation = document.getElementById('currentLocation');
  
  // Chat elementleri
  messageInput = document.getElementById('messageInput');
  btnSend = document.getElementById('btnSend');
  messages = document.getElementById('messages');
  userList = document.getElementById('userList');
  channelList = document.getElementById('channelList');
  sponsorList = document.getElementById('sponsorList');
  
  // Modaller
  loginModal = document.getElementById('loginModal');
  profileModal = document.getElementById('profileModal');
  locationModal = document.getElementById('locationModal');
  createChannelModal = document.getElementById('createChannelModal');
  
  // Form elementleri
  nickname = document.getElementById('nickname');
  firstName = document.getElementById('firstName');
  lastName = document.getElementById('lastName');
  gender = document.getElementById('gender');
  birth = document.getElementById('birth');
  country = document.getElementById('country');
  city = document.getElementById('city');
  
  console.log('✅ DOM elementleri başlatıldı');
}

/* ===================== Helpers ===================== */
function cleanMessage(text){
  let safe=text;
  bannedWords.forEach(w=>{
    const re=new RegExp(w,"gi");
    safe=safe.replace(re,"***");
  });
  return safe;
}
function saveFollows(){
  localStorage.setItem("follows",JSON.stringify(follows));
  renderFollows();
}

/* ===================== Chat UI ===================== */
function addMessage(from,text){
  const time=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
  messages.innerHTML+=`<div><span class="time">[${time}]</span> <b>${from}:</b> ${text}</div>`;
  messages.scrollTop=messages.scrollHeight;
}
function addInfo(t){
  messages.innerHTML+=`<div class="info">${t}</div>`;
  messages.scrollTop=messages.scrollHeight;
}
function showTyping(name){
  typingArea.innerHTML=`<div class="typing">${name} yazıyor...</div>`;
  setTimeout(()=>{typingArea.innerHTML="";},1500);
}

/* ===================== Users & Follow ===================== */
function renderUsers(list){
  userList.innerHTML=""; userListMobile.innerHTML="";
  list.forEach(u=>{
    const li=document.createElement("li");
    li.innerHTML=`<span class="avatar">👤</span> ${u.display}`;
    const star=document.createElement("span");
    star.className="star"+(follows.find(f=>f.uid===u.uid)?" following":"");
    star.textContent="★";
    star.title="Takip et / bırak";
    star.onclick=(e)=>{e.stopPropagation();toggleFollow(u,star);};
    li.appendChild(star);
    li.onclick=()=>startDM(u);
    userList.appendChild(li);

    const mli=document.createElement("li");
    mli.innerHTML=`<span class="avatar">👤</span> ${u.display}`;
    const mstar=document.createElement("span");
    mstar.className=star.className; mstar.textContent="★"; mstar.title=star.title;
    mstar.onclick=(e)=>{e.stopPropagation();toggleFollow(u,mstar);};
    mli.appendChild(mstar);
    mli.onclick=()=>startDM(u);
    userListMobile.appendChild(mli);
  });
  renderFollows();
}
function renderFollows(){
  followList.innerHTML=""; followListMobile.innerHTML="";
  follows.forEach(u=>{
    const li=document.createElement("li");
    li.innerHTML=`<span class="avatar">👤</span> ${u.display}`;
    li.onclick=()=>startDM(u);
    followList.appendChild(li);

    const mli=document.createElement("li");
    mli.innerHTML=`<span class="avatar">👤</span> ${u.display}`;
    mli.onclick=()=>startDM(u);
    followListMobile.appendChild(mli);
  });
}
function toggleFollow(u,starEl){
  const exists=follows.find(f=>f.uid===u.uid);
  if(exists){follows=follows.filter(f=>f.uid!==u.uid);}
  else{follows.push(u);}
  saveFollows();
  if(starEl)starEl.classList.toggle("following");
}

/* ===================== WebSocket ===================== */
function connectWS(){
  ws=new WebSocket(WS_URL);
  ws.onopen=()=>sendJoin();
  ws.onmessage=e=>{
    const msg=JSON.parse(e.data);
    if(msg.type==="info") addInfo(msg.message);
    if(msg.type==="message") addMessage(msg.from,msg.text);
    if(msg.type==="users") renderUsers(msg.users);
    if(msg.type==="typing") showTyping(msg.from);
    if(msg.type==="dm-start") openDM(msg.room,msg.peer);
  };
  ws.onclose=()=>{};
}
function sendJoin(){
  ws.send(JSON.stringify({type:"join",channel:currentChannel,nick:"Kullanıcı",token}));
}

/* ===================== Message send ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('messageInput');
  const btnSend = document.getElementById('btnSend');
  
  if (messageInput && btnSend) {
    btnSend.onclick = () => {
      let text = messageInput.value.trim();
  if(!text) return;
      text = cleanMessage(text);
      addMessage("Ben", text);

  if(currentChannel==="#heponsigorta"){
    fetch(API+"/sponsor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})
    .then(r=>r.json()).then(data=>{
      if(data.answer) addMessage("HeponBot 🤖",data.answer);
    }).catch(()=>addMessage("HeponBot 🤖","Üzgünüm, şu an yanıt veremiyorum."));
  } else {
    if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({type:"message",text}));
    } else {
      console.log('⚠️ WebSocket bağlantısı yok, mesaj gönderilemiyor');
      addMessage("Sistem", "Bağlantı kuruluyor, lütfen bekleyin...");
    }
    
    // AI yanıtı için ayrı istek gönder - kanal ismine göre
    setTimeout(() => {
      const channelContext = currentChannel.replace('#', '');
      
      // Kanal türüne göre prompt oluştur
      let channelPrompt = '';
      if (channelContext === 'genel') {
        channelPrompt = 'Sen genel sohbet kanalındasın. Her konuda konuşabilirsin.';
      } else if (channelContext === 'spor') {
        channelPrompt = 'Sen spor kanalındasın. Sadece spor konularında konuş.';
      } else if (channelContext === 'teknoloji') {
        channelPrompt = 'Sen teknoloji kanalındasın. Sadece teknoloji konularında konuş.';
      } else if (channelContext === 'müzik') {
        channelPrompt = 'Sen müzik kanalındasın. Sadece müzik konularında konuş.';
      } else if (channelContext === 'film') {
        channelPrompt = 'Sen film kanalındasın. Sadece film/dizi konularında konuş.';
      } else if (channelContext === 'oyun') {
        channelPrompt = 'Sen oyun kanalındasın. Sadece oyun konularında konuş.';
      } else {
        // İlgi alanı kanalı
        channelPrompt = `Sen "${channelContext}" kanalındasın. Bu kanalın konusu: ${channelContext}. Sadece bu konuyla ilgili cevap ver.`;
      }
      
      fetch(API+"/sponsor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text: text, channelName: channelContext})})
      .then(r=>r.json()).then(data=>{
        if(data.answer && data.answer !== "Şu an yanıt veremiyorum" && data.answer !== "Yanıt yok") {
          addMessage("AI 🤖",data.answer);
        }
      }).catch((error)=>{
        console.error('AI yanıt hatası:', error);
        addMessage("AI 🤖", "Üzgünüm, şu an yanıt veremiyorum.");
      });
    }, 1000);
  }
      messageInput.value="";
};
    
    messageInput.addEventListener("input",()=>{
  if(ws&&ws.readyState===WebSocket.OPEN){
    ws.send(JSON.stringify({type:"typing"}));
      }
    });
  }
});

/* ===================== Channels ===================== */
function appendChannelItem(ul,name){
  const exists=[...ul.querySelectorAll("li")].some(li=>li.textContent===name);
  if(exists) return;
  const li=document.createElement("li");
  li.textContent=name;
  li.onclick=()=>{
    currentChannel=name;
    topic.textContent=name;
    messages.innerHTML="";
    ws.send(JSON.stringify({type:"join",channel:name,nick:"Kullanıcı",token}));
  };
  ul.appendChild(li);
}
function addChannel(name){
  if(!token){alert("Kanal eklemek için giriş yapın.");return;}
  if(!name.startsWith("#")) name="#"+name;
  currentChannel=name;
  topic.textContent=name;
  messages.innerHTML="";
  appendChannelItem(channelList,name);
  appendChannelItem(channelListMobile,name);
  ws.send(JSON.stringify({type:"join",channel:name,nick:"Kullanıcı",token}));
}

/* ===================== DM ===================== */
const dmWindows={};
function startDM(user){
  if(!ws||ws.readyState!==WebSocket.OPEN) return;
  ws.send(JSON.stringify({type:"dm",toUid:user.uid}));
}
function openDM(room,peer){
  // Eğer DM penceresi zaten açıksa, sadece odaklan
  if(dmWindows[room]) {
    dmWindows[room].style.display = 'block';
    dmWindows[room].classList.add('open');
    return;
  }
  
  const win=document.createElement("div");
  win.className="modal open";
  win.innerHTML=`
    <div class="modal-content" style="width:420px;max-height:90vh;overflow:auto">
      <button class="modal-close" onclick="closeDM('${room}')">✖</button>
      <h3>DM: ${peer.display}</h3>
      <div class="messages" id="msg-${room}" style="height:300px"></div>
      <form onsubmit="sendDM('${room}',this);return false;" class="inputbar">
        <input name="text" placeholder="Mesaj yaz..." maxlength="1000"/><button>Gönder</button>
      </form>
      <div class="muted">DM kayıtları tarayıcında saklanır ve silinmez.</div>
    </div>`;
  document.body.appendChild(win);
  dmWindows[room]=win;
}

function closeDM(room){
  if(dmWindows[room]) {
    dmWindows[room].classList.remove('open');
    dmWindows[room].style.display = 'none';
  }
}
function sendDM(room,formEl){
  const raw=(formEl.text.value||"").trim();
  const text=cleanMessage(raw);
  if(!text) return;
  const box=document.getElementById("msg-"+room);
  box.innerHTML+=`<div><b>Ben:</b> ${text}</div>`;
  ws.send(JSON.stringify({type:"message",text,channel:room}));
  formEl.text.value="";
}

/* ===================== WebSocket ===================== */
function connectWS() {
  try {
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('✅ WebSocket bağlantısı kuruldu');
      if (token) {
        ws.send(JSON.stringify({type:"auth",token}));
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('❌ WebSocket mesaj hatası:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('⚠️ WebSocket bağlantısı kapandı, yeniden bağlanılıyor...');
      setTimeout(connectWS, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket hatası:', error);
    };
  } catch (error) {
    console.error('❌ WebSocket bağlantı hatası:', error);
    setTimeout(connectWS, 5000);
  }
}

function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'message':
      addMessage(data.nick, data.text);
      break;
    case 'users':
      updateUserList(data.users);
      break;
    case 'typing':
      showTyping(data.nick);
      break;
    case 'ai':
      addMessage("AI", data.text);
      break;
  }
}

function addMessage(nick, text) {
  if (messages) {
    const div = document.createElement('div');
    div.innerHTML = `<b>${nick}:</b> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
}

function updateUserList(users) {
  if (userList) {
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.display || user.nick;
      li.onclick = () => startDM(user);
      userList.appendChild(li);
    });
  }
}

function showTyping(nick) {
  // Typing indicator göster
  console.log(`${nick} yazıyor...`);
}

/* ===================== Auth ===================== */
function initAuth() {
  if (btnLogin) {
    btnLogin.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  // Modal'ı tamamen yeniden oluştur
  const existingModal = document.getElementById('loginModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.className = 'modal open';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">✖</button>
      <h3>Giriş / Kayıt</h3>
      <input id="identifier" placeholder="Email veya Telefon" style="width: 100%; margin: 5px 0; padding: 8px;"/>
      <input id="password" type="password" placeholder="Şifre" style="width: 100%; margin: 5px 0; padding: 8px;"/>
      
      <!-- Beni Hatırla checkbox -->
      <div style="display: flex; align-items: center; margin: 10px 0;">
        <input type="checkbox" id="rememberMe" style="margin-right: 8px;">
        <label for="rememberMe">Beni Hatırla</label>
      </div>
      
      <div class="section">
        <button id="doLogin">Giriş</button>
        <button id="doRegister">Kayıt</button>
      </div>
      <div class="muted">Giriş yapmadan anonim sohbet edebilirsin; fakat DM, arkadaş ekleme ve kanal ekleme için giriş gerekir.</div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Yeni modal için event listener'ları ekle
  const newDoLogin = modal.querySelector('#doLogin');
  const newDoRegister = modal.querySelector('#doRegister');
  
  newDoLogin.onclick = doLogin.onclick;
  newDoRegister.onclick = doRegister.onclick;
  
  // Kaydedilmiş giriş bilgilerini yükle
  setTimeout(() => {
    loadSavedCredentials();
  }, 100);
  
  return false;
};
  }
}

// Kaydedilmiş giriş bilgilerini yükle
function loadSavedCredentials() {
  try {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      if (credentials.rememberMe && credentials.identifier) {
        // Giriş modalı açıldığında email'i doldur
        setTimeout(() => {
          const identifierInput = document.getElementById('identifier');
          const rememberMeCheckbox = document.getElementById('rememberMe');
          
          if (identifierInput) {
            identifierInput.value = credentials.identifier;
          }
          if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
          }
          
          console.log('✅ Kaydedilmiş giriş bilgileri yüklendi');
        }, 100);
      }
    }
  } catch (error) {
    console.error('Kaydedilmiş giriş bilgileri yüklenemedi:', error);
  }
}

// Giriş modalındaki input alanları için event listener
document.addEventListener('DOMContentLoaded', () => {
  // Kaydedilmiş giriş bilgilerini yükle
  loadSavedCredentials();
  
  const identifierInput = document.getElementById('identifier');
  const passwordInput = document.getElementById('password');
  
  if (identifierInput) {
    identifierInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
    
    identifierInput.addEventListener('focus', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
    
    passwordInput.addEventListener('focus', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
  }
});

// Login fonksiyonu
async function doLogin() {
  try{
    const identifier=document.getElementById("identifier").value.trim();
    const password=document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe")?.checked || false;
    
    console.log('🔐 Giriş denemesi:', {identifier, password: '***'});
    
    const res=await fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
    const data=await res.json();
    
    console.log('🔐 Giriş response:', {status: res.status, data});
    
    if(!res.ok||!data.success) throw new Error(data?.error||("HTTP "+res.status));

    token=data.token;
    localStorage.setItem("token",token);
    window.token = token; // Global token'ı güncelle
    
    // Beni Hatırla seçiliyse giriş bilgilerini kaydet
    if (rememberMe) {
      localStorage.setItem("savedCredentials", JSON.stringify({
        identifier: identifier,
        rememberMe: true
      }));
      console.log('✅ Giriş bilgileri kaydedildi');
    } else {
      localStorage.removeItem("savedCredentials");
    }
    
    authStatus.textContent=identifier;
    btnLogin.style.display="none"; btnProfile.style.display="inline-block"; btnLogout.style.display="inline-block";
    loginModal.classList.remove("open");
    document.getElementById("addChannelBox").style.display="block";
    document.getElementById("addChannelBoxMobile").style.display="block";
    ws&&ws.close(); connectWS();
    
    // Modal'ı kapat
    closeLoginModal();
    
    // İlgi alanları modalını aç
    setTimeout(() => {
      const hobbyModal = document.getElementById('hobbyModal');
      if (hobbyModal) {
        hobbyModal.classList.add('open');
      }
    }, 500);
    
    // Kendi kanallarımı yükle
    loadMyChannels();
  }catch(err){ alert("Giriş hatası: "+err.message); }
}

// Register fonksiyonu
async function doRegister() {
  try{
    const identifier=document.getElementById("identifier").value.trim();
    const password=document.getElementById("password").value;
    
    console.log('📝 Kayıt denemesi:', {identifier, password: '***'});
    
    const res=await fetch(API+"/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
    const data=await res.json();
    
    console.log('📝 Kayıt response:', {status: res.status, data});
    
    if(!res.ok||!data.success) {
      const errorMsg = data?.error === "Var" ? "Bu e-posta adresi zaten kayıtlı" : (data?.error || ("HTTP "+res.status));
      throw new Error(errorMsg);
    }
    alert("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
    closeLoginModal();
  }catch(err){ 
    console.error('📝 Kayıt hatası:', err);
    alert("Kayıt hatası: "+err.message); 
  }
}

// Global olarak erişilebilir yap
window.doLogin = doLogin;
window.doRegister = doRegister;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.saveProfile = saveProfile;

// Logout fonksiyonu
function doLogout() {
  localStorage.removeItem("token");
  token = null;
  location.reload();
}

/* ===================== Modal Fonksiyonları ===================== */
function openLoginModal() {
  document.getElementById('loginModal').classList.add('open');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
}

/* ===================== Lokasyon ===================== */
function initLocation() {
  if (btnLocation) {
    btnLocation.onclick = () => {
      if (locationModal) {
  locationModal.classList.add("open");
      }
};
  }
}

// Lokasyon kaydetme fonksiyonu
function saveLocation() {
  const countryInput = document.getElementById('countryInput').value;
  const cityInput = document.getElementById('cityInput').value;
  
  // Ülke kodunu çıkar (🇹🇷 Türkiye -> TR)
  const countryCode = countryInput.split(' ')[1] || countryInput;
  const countryName = countryInput.replace(/🇹🇷|🇺🇸|🇫🇷|🇩🇪|🇪🇸|🇬🇧|🇮🇹|🇷🇺|🇨🇳|🇯🇵|🇰🇷|🇮🇳|🇧🇷|🇨🇦|🇦🇺|🇳🇱|🇧🇪|🇨🇭|🇦🇹|🇸🇪|🇳🇴|🇩🇰|🇫🇮|🇵🇱|🇨🇿|🇭🇺|🇷🇴|🇧🇬|🇬🇷|🇵🇹|🇮🇪|🇳🇿|🇿🇦|🇲🇽|🇦🇷|🇨🇱|🇨🇴|🇵🇪|🇻🇪|🇺🇾/g, '').trim();
  
  if (!countryInput || !cityInput) {
    alert("Lütfen ülke ve şehir seçin.");
    return;
  }
  
  // Lokasyon bilgilerini kaydet
  const locationData = {
    country: countryName,
    countryCode: countryCode,
    city: cityInput
  };
  
  localStorage.setItem('userLocation', JSON.stringify(locationData));
  
  // Dil değiştir
  const languageMap = {
    'US': 'US', 'CA': 'US', 'GB': 'US', 'AU': 'US', 'NZ': 'US',
    'TR': 'TR',
    'FR': 'FR', 'BE': 'FR', 'CH': 'FR',
    'DE': 'DE', 'AT': 'DE', 'LI': 'DE',
    'ES': 'ES', 'MX': 'ES', 'AR': 'ES', 'CL': 'ES', 'CO': 'ES', 'PE': 'ES', 'VE': 'ES', 'UY': 'ES'
  };
  
  const detectedLanguage = languageMap[countryCode] || 'TR';
  if (window.onLocationChange) {
    window.onLocationChange(detectedLanguage);
  }
  
  alert(`📍 Lokasyon güncellendi: ${cityInput}, ${countryName}`);
  locationModal.classList.remove("open");
}

/* ===================== Profil ===================== */
function initProfile() {
  if (btnProfile) {
    btnProfile.onclick = () => {
      if (profileModal) {
        profileModal.classList.add("open");
        
        // Lokasyon bilgilerini otomatik doldur
        const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
        if (userLocation.country) {
          const countryField = document.getElementById('country');
          if (countryField) countryField.value = userLocation.country;
        }
        if (userLocation.city) {
          const cityField = document.getElementById('city');
          if (cityField) cityField.value = userLocation.city;
        }
        if (userLocation.state) {
          const stateField = document.getElementById('state');
          if (stateField) stateField.value = userLocation.state;
        }
        
        console.log('📍 Profil lokasyon bilgileri dolduruldu:', userLocation);
      }
    };
  }
}

// Profil kaydetme fonksiyonu
async function saveProfile() {
  const profile={
    nickname: nickname.value,
    firstName:firstName.value,lastName:lastName.value,
    gender:gender.value,birth:birth.value,country:country.value,city:city.value
  };
  
  // Nickname kontrolü
  if (!profile.nickname || profile.nickname.length < 3) {
    alert("Nickname en az 3 karakter olmalı.");
    return;
  }
  
  const res=await fetch(API+"/profile/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,profile})});
  const data=await res.json();
  if(data.success){ 
    alert("Profil güncellendi"); 
    profileModal.classList.remove("open");
    // Auth status'u nickname ile güncelle
    authStatus.textContent = profile.nickname;
  } else {
    alert("Hata: " + (data.error || "Profil güncellenemedi"));
  }
};

/* ===================== Kanal Oluşturma ===================== */
function initChannelCreation() {
  if (btnCreateChannel) {
    btnCreateChannel.onclick = () => {
      if (createChannelModal) {
  createChannelModal.classList.add("open");
      } else {
        console.log('⚠️ createChannelModal bulunamadı');
      }
    };
  }
}

// Kanal oluşturma modal'ını kapat
function closeCreateChannelModal() {
  if (createChannelModal) {
    createChannelModal.classList.remove("open");
  }
}

// Kanal oluştur
async function createChannel() {
  const name = document.getElementById('channelNameInput').value.trim();
  const description = document.getElementById('channelDescriptionInput').value.trim();
  const type = document.getElementById('channelTypeSelect').value;
  const password = document.getElementById('channelPasswordInput').value;
  
  if (!name) {
    alert('Kanal adı gerekli!');
    return;
  }
  
  try {
    const channelData = {
      name: name,
      description: description,
      type: type,
      password: type === 'private' ? password : null
    };
    
    console.log('📺 Kanal oluşturuluyor:', channelData);
    
    // Backend'e gönder
    const response = await fetch(`${API}/channels/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.token,
        ...channelData
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Modal'ı kapat
      closeCreateChannelModal();
      
      // Form'u temizle
      document.getElementById('channelNameInput').value = '';
      document.getElementById('channelDescriptionInput').value = '';
      document.getElementById('channelTypeSelect').value = 'public';
      document.getElementById('channelPasswordInput').value = '';
      
      // Kanalları yeniden yükle
      loadChannels();
      
      alert('Kanal başarıyla oluşturuldu!');
    } else {
      alert('Hata: ' + (data.error || 'Kanal oluşturulamadı'));
    }
    
  } catch (error) {
    console.error('❌ Kanal oluşturma hatası:', error);
    alert('Kanal oluşturulurken hata oluştu!');
  }
}

// Popüler kanalları yükle
function loadPopularChannels() {
  const popularChannels = [
    { name: 'genel', description: 'Genel sohbet kanalı', users: 156, type: 'public' },
    { name: 'teknoloji', description: 'Teknoloji ve yazılım', users: 89, type: 'public' },
    { name: 'spor', description: 'Spor haberleri ve tartışmaları', users: 67, type: 'public' },
    { name: 'müzik', description: 'Müzik paylaşımları', users: 45, type: 'public' },
    { name: 'oyun', description: 'Oyun sohbetleri', users: 123, type: 'public' },
    { name: 'film', description: 'Film ve dizi tartışmaları', users: 78, type: 'public' },
    { name: 'sanat', description: 'Sanat ve tasarım', users: 34, type: 'public' },
    { name: 'bilim', description: 'Bilim ve araştırma', users: 56, type: 'public' }
  ];
  
  // Kullanıcı sayısına göre sırala
  popularChannels.sort((a, b) => b.users - a.users);
  
  if (channelList) {
    channelList.innerHTML = '';
    popularChannels.forEach(channel => {
      const li = document.createElement('li');
      li.className = 'channel-item';
      li.innerHTML = `
        <div class="channel-info">
          <span class="channel-name">#${channel.name}</span>
          <span class="channel-users">👥 ${channel.users}</span>
        </div>
        <div class="channel-description">${channel.description}</div>
      `;
      li.onclick = () => switchChannel(`#${channel.name}`);
      channelList.appendChild(li);
    });
  }
  
  console.log('📺 Popüler kanallar yüklendi:', popularChannels.length);
}

// Sponsor kanalları yükle
function loadSponsorChannels() {
  const sponsorChannels = [
    { name: 'heponsigorta', description: 'Hepon Sigorta - Resmi Kanal', users: 234, type: 'sponsor', price: 'Premium' },
    { name: 'technews', description: 'TechNews - Teknoloji Haberleri', users: 189, type: 'sponsor', price: 'Gold' },
    { name: 'cryptotalk', description: 'Crypto Talk - Kripto Para', users: 145, type: 'sponsor', price: 'Silver' },
    { name: 'fitnesspro', description: 'Fitness Pro - Sağlık ve Spor', users: 98, type: 'sponsor', price: 'Bronze' },
    { name: 'foodie', description: 'Foodie - Yemek Tarifleri', users: 167, type: 'sponsor', price: 'Gold' }
  ];
  
  // Kullanıcı sayısına göre sırala
  sponsorChannels.sort((a, b) => b.users - a.users);
  
  if (sponsorList) {
    sponsorList.innerHTML = '';
    sponsorChannels.forEach(channel => {
      const li = document.createElement('li');
      li.className = 'channel-item sponsor';
      li.innerHTML = `
        <div class="channel-info">
          <span class="channel-name">💰 #${channel.name}</span>
          <span class="channel-users">👥 ${channel.users}</span>
          <span class="sponsor-badge">${channel.price}</span>
        </div>
        <div class="channel-description">${channel.description}</div>
      `;
      li.onclick = () => switchChannel(`#${channel.name}`);
      sponsorList.appendChild(li);
    });
  }
  
  console.log('💰 Sponsor kanallar yüklendi:', sponsorChannels.length);
}

// Kanal değiştir
function switchChannel(channelName) {
  currentChannel = channelName;
  
  // Kanal başlığını güncelle
  const channelHeader = document.getElementById('currentChannel');
  if (channelHeader) {
    channelHeader.textContent = channelName;
  }
  
  // Mesajları temizle
  if (messages) {
    messages.innerHTML = `
      <div class="info">🚀 ${channelName} kanalına hoş geldiniz!</div>
      <div class="info">💬 Sohbete katılmak için mesaj yazın...</div>
    `;
  }
  
  console.log('📺 Kanal değiştirildi:', channelName);
}

// Kanalları yükle
function loadChannels() {
  loadPopularChannels();
  loadSponsorChannels();
}

// Rastgele nickname oluştur
function generateRandomNickname() {
  const adjectives = ['Cool', 'Smart', 'Fast', 'Bright', 'Happy', 'Lucky', 'Brave', 'Wise', 'Kind', 'Funny'];
  const nouns = ['Tiger', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Lion', 'Dragon', 'Phoenix', 'Falcon', 'Panther'];
  const numbers = Math.floor(Math.random() * 999) + 1;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}`;
}

// Profil modal fonksiyonları
function openProfileModal() {
  if (profileModal) {
    profileModal.classList.add("open");
    initProfileModal();
  }
}

function initProfileModal() {
  // Rastgele nickname oluştur
  const randomNickname = generateRandomNickname();
  
  // İlgi alanları event listener'larını ekle
  document.querySelectorAll('.hobby-item-large').forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('selected');
      updateSelectedHobbies();
    });
  });
  
  // Kişisel bilgiler bölümünü gizle
  const personalInfoSection = document.getElementById('personalInfoSection');
  if (personalInfoSection) {
    personalInfoSection.style.display = 'none';
  }
  
  console.log('🎯 Profil modal başlatıldı, rastgele nickname:', randomNickname);
}

function updateSelectedHobbies() {
  const selectedHobbies = Array.from(document.querySelectorAll('.hobby-item-large.selected'))
    .map(item => item.dataset.hobby);
  
  // En az 3 ilgi alanı seçildiyse kişisel bilgiler bölümünü göster
  const personalInfoSection = document.getElementById('personalInfoSection');
  if (personalInfoSection) {
    if (selectedHobbies.length >= 3) {
      personalInfoSection.style.display = 'block';
    } else {
      personalInfoSection.style.display = 'none';
    }
  }
  
  console.log('🎯 Seçilen ilgi alanları:', selectedHobbies);
}

function closeProfileModal() {
  if (profileModal) {
    profileModal.classList.remove("open");
  }
}

function openHobbyModal() {
  const hobbyModal = document.getElementById('hobbyModal');
  if (hobbyModal) {
    hobbyModal.classList.add("open");
    loadHobbyData();
  }
}

function closeHobbyModal() {
  const hobbyModal = document.getElementById('hobbyModal');
  if (hobbyModal) {
    hobbyModal.classList.remove("open");
  }
}

// Profil verilerini yükle
async function loadProfileData() {
  try {
    // Backend'den profil verilerini al
    const response = await fetch(`${API}/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: window.token })
    });
    
    const data = await response.json();
    
    if (data.success) {
      const profile = data.profile || {};
      const hobbies = data.hobbies || [];
      
      // Form alanlarını doldur
      if (nickname) nickname.value = profile.nickname || '';
      if (firstName) firstName.value = profile.firstName || '';
      if (lastName) lastName.value = profile.lastName || '';
      if (gender) gender.value = profile.gender || '';
      if (birth) birth.value = profile.birth || '';
      if (country) country.value = profile.country || '';
      if (city) city.value = profile.city || '';
      
      // İlgi alanlarını localStorage'a kaydet
      localStorage.setItem('userHobbies', JSON.stringify(hobbies));
      
      console.log('👤 Profil verileri yüklendi:', profile);
    } else {
      // Fallback: localStorage'dan yükle
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      if (nickname) nickname.value = profile.nickname || '';
      if (firstName) firstName.value = profile.firstName || '';
      if (lastName) lastName.value = profile.lastName || '';
      if (gender) gender.value = profile.gender || '';
      if (birth) birth.value = profile.birth || '';
      if (country) country.value = profile.country || '';
      if (city) city.value = profile.city || '';
    }
  } catch (error) {
    console.error('❌ Profil yükleme hatası:', error);
    // Fallback: localStorage'dan yükle
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    if (nickname) nickname.value = profile.nickname || '';
    if (firstName) firstName.value = profile.firstName || '';
    if (lastName) lastName.value = profile.lastName || '';
    if (gender) gender.value = profile.gender || '';
    if (birth) birth.value = profile.birth || '';
    if (country) country.value = profile.country || '';
    if (city) city.value = profile.city || '';
  }
}

// İlgi alanları verilerini yükle
function loadHobbyData() {
  const hobbies = JSON.parse(localStorage.getItem('userHobbies') || '[]');
  
  document.querySelectorAll('.hobby-checkbox').forEach(checkbox => {
    checkbox.checked = hobbies.includes(checkbox.value);
  });
}

// İlgi alanlarını kaydet
async function saveHobbies() {
  const selectedHobbies = Array.from(document.querySelectorAll('.hobby-checkbox:checked'))
    .map(checkbox => checkbox.value);
  
  try {
    const response = await fetch(`${API}/hobbies/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.token,
        hobbies: selectedHobbies
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('userHobbies', JSON.stringify(selectedHobbies));
      closeHobbyModal();
      loadInterestBasedChannels();
      alert('İlgi alanlarınız kaydedildi!');
    } else {
      alert('Hata: ' + (data.error || 'İlgi alanları kaydedilemedi'));
    }
  } catch (error) {
    console.error('❌ İlgi alanları kaydetme hatası:', error);
    // Fallback: localStorage'a kaydet
    localStorage.setItem('userHobbies', JSON.stringify(selectedHobbies));
    closeHobbyModal();
    loadInterestBasedChannels();
    alert('İlgi alanlarınız kaydedildi! (Offline)');
  }
}

// İlgi alanlarına göre kanalları yükle
async function loadInterestBasedChannels() {
  const userHobbies = JSON.parse(localStorage.getItem('userHobbies') || '[]');
  
  try {
    // Backend'den kanalları al
    const response = await fetch(`${API}/channels/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.token,
        interests: userHobbies
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.channels) {
      // Backend'den gelen kanalları göster
      if (channelList) {
        channelList.innerHTML = '';
        data.channels.forEach(channel => {
          const li = document.createElement('li');
          li.className = 'channel-item';
          li.innerHTML = `
            <div class="channel-info">
              <span class="channel-name">#${channel.name}</span>
              <span class="channel-users">👥 ${channel.users}</span>
            </div>
            <div class="channel-description">${channel.description}</div>
          `;
          li.onclick = () => switchChannel(`#${channel.name}`);
          channelList.appendChild(li);
        });
      }
      console.log('🎯 Backend\'den kanallar yüklendi:', data.channels.length);
    } else {
      // Fallback: localStorage'dan yükle
      loadPopularChannels();
    }
  } catch (error) {
    console.error('❌ Kanal yükleme hatası:', error);
    // Fallback: localStorage'dan yükle
    loadPopularChannels();
  }
}

// Profil kaydetme fonksiyonu
async function saveProfile() {
  const selectedHobbies = Array.from(document.querySelectorAll('.hobby-item-large.selected'))
    .map(item => item.dataset.hobby);
  
  if (selectedHobbies.length === 0) {
    alert('En az bir ilgi alanı seçmelisiniz!');
    return;
  }
  
  const randomNickname = generateRandomNickname();
  
  const profileData = {
    nickname: randomNickname,
    firstName: firstName?.value || '',
    lastName: lastName?.value || '',
    gender: gender?.value || '',
    birth: birth?.value || '',
    country: country?.value || '',
    city: city?.value || ''
  };
  
  console.log('👤 Profil kaydediliyor:', profileData);
  console.log('🎯 İlgi alanları:', selectedHobbies);
  
  try {
    // Profil kaydet
    const profileResponse = await fetch(`${API}/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.token,
        profile: profileData
      })
    });
    
    const profileData_result = await profileResponse.json();
    
    // İlgi alanlarını kaydet
    const hobbiesResponse = await fetch(`${API}/hobbies/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.token,
        hobbies: selectedHobbies
      })
    });
    
    const hobbiesData = await hobbiesResponse.json();
    
    if (profileData_result.success && hobbiesData.success) {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      localStorage.setItem('userHobbies', JSON.stringify(selectedHobbies));
      localStorage.setItem('userNickname', randomNickname);
      
      closeProfileModal();
      
      // Kanalları yeniden yükle
      loadInterestBasedChannels();
      
      alert(`Profil oluşturuldu! Nickname'iniz: ${randomNickname}`);
    } else {
      alert('Hata: ' + (profileData_result.error || hobbiesData.error || 'Profil kaydedilemedi'));
    }
  } catch (error) {
    console.error('❌ Profil kaydetme hatası:', error);
    // Fallback: localStorage'a kaydet
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    localStorage.setItem('userHobbies', JSON.stringify(selectedHobbies));
    localStorage.setItem('userNickname', randomNickname);
    
    closeProfileModal();
    loadInterestBasedChannels();
    
    alert(`Profil oluşturuldu! (Offline) Nickname'iniz: ${randomNickname}`);
  }
}

// Global fonksiyonlar
window.closeCreateChannelModal = closeCreateChannelModal;
window.createChannel = createChannel;
window.loadChannels = loadChannels;
window.switchChannel = switchChannel;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.openHobbyModal = openHobbyModal;
window.closeHobbyModal = closeHobbyModal;
window.saveHobbies = saveHobbies;
window.saveProfile = saveProfile;

// Kanal türü değiştiğinde şifre alanını göster/gizle
document.addEventListener('change', (e) => {
  if (e.target.name === 'channelType') {
    const passwordSection = document.getElementById('passwordSection');
    if (e.target.value === 'private') {
      passwordSection.style.display = 'block';
    } else {
      passwordSection.style.display = 'none';
    }
  }
});

// Eski createChannelBtn kodu kaldırıldı - yeni sistem kullanılıyor

// Kendi kanallarımı yükle
async function loadMyChannels() {
  try {
    const res = await fetch(API + "/channels/my", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    
    const data = await res.json();
    if (data.success) {
      renderMyChannels(data.channels);
    }
  } catch (error) {
    console.error("Kendi kanallarım yüklenemedi:", error);
  }
}

// Kendi kanallarımı render et
function renderMyChannels(channels) {
  const myChannelsList = document.getElementById('myChannelsList');
  if (!myChannelsList) return;
  
  myChannelsList.innerHTML = '';
  
  channels.forEach(channel => {
    const li = document.createElement('li');
    const icon = channel.isPrivate ? '🔒' : '🌐';
    li.innerHTML = `${icon} ${channel.name}`;
    li.onclick = () => joinChannel(channel.name);
    myChannelsList.appendChild(li);
  });
}

/* ===================== Sponsor Kanal ===================== */
function joinSponsor(){
  currentChannel="#heponsigorta";
  topic.textContent="#heponsigorta";
  messages.innerHTML="";
  addInfo("Hepon Sigorta’ya hoş geldiniz. Daha fazla bilgi: www.heponsigorta.com");
}

/* ===================== Hobi / İlgi Alanları ===================== */
const ALL_HOBBIES=["Futbol","Basketbol","Satranç","Müzik","Film","Dizi","Anime","Yemek","Yazılım","Yapay Zekâ"];
const HOBBY_TO_CHANNELS={ "Futbol":["#futbol","#spor"], "Basketbol":["#basketbol"], "Müzik":["#müzik","#sohbet"], "Film":["#film","#sohbet"], "Yapay Zekâ":["#yapayzeka","#teknoloji"] };
const hobbyPicked=new Set(JSON.parse(localStorage.getItem("hobbies")||"[]"));

// Hobi sistemi HTML'deki yeni sistemle entegre edildi
btnHobbies.onclick=()=>{
  const hobbyModal = document.getElementById('hobbyModal');
  if(hobbyModal) hobbyModal.classList.add("open");
};

// İlgi alanları kaydetme fonksiyonu
window.saveHobbies = function() {
  // HTML'deki yeni sistemden seçilen hobileri al
  const selectedHobbies = [];
  const hobbyCheckboxes = document.querySelectorAll('#hobbyModal input[type="checkbox"]:checked');
  
  hobbyCheckboxes.forEach(checkbox => {
    selectedHobbies.push(checkbox.value);
  });
  
  console.log('Seçilen ilgi alanları:', selectedHobbies);
  localStorage.setItem('hobbies', JSON.stringify(selectedHobbies));
  
  // Modal'ı kapat
  const hobbyModal = document.getElementById('hobbyModal');
  if(hobbyModal) hobbyModal.classList.remove("open");
  
  alert(`İlgi alanları kaydedildi: ${selectedHobbies.join(', ')}`);
  
  // Hobby picked set'ini güncelle
  hobbyPicked.clear();
  selectedHobbies.forEach(hobby => hobbyPicked.add(hobby));
  
  // Sayfayı yenile ki yeni öneriler yüklensin
  setTimeout(() => {
    location.reload();
  }, 1000);
};

// Save hobbies butonuna event listener ekle
document.addEventListener('DOMContentLoaded', () => {
  const saveHobbiesBtn = document.getElementById('saveHobbies');
  if (saveHobbiesBtn) {
    saveHobbiesBtn.onclick = window.saveHobbies;
  }
});

/* ===================== Feedback ===================== */
btnFeedback.onclick=()=>feedbackModal.classList.add("open");
sendFeedback.onclick=async()=>{
  const text=document.getElementById("feedbackText").value.trim();
  if(!text) return;
  
  // Backend'e gönder
  await fetch(API+"/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,text})});
  
  // Bana da bildirim gönder
  try {
    await fetch('https://api.telegram.org/bot7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '123456789',
        text: `🚀 Yeni Öneri:\n\n${text}\n\n👤 Kullanıcı: ${token ? 'Giriş yapmış' : 'Anonim'}\n🌍 Lokasyon: ${localStorage.getItem('userLocation') ? JSON.parse(localStorage.getItem('userLocation')).countryName : 'Bilinmiyor'}\n⏰ Tarih: ${new Date().toLocaleString('tr-TR')}`
      })
    });
  } catch (error) {
    console.error('Telegram bildirimi gönderilemedi:', error);
  }
  
  alert("Teşekkürler! Öneriniz kaydedildi ve geliştiriciye bildirim gönderildi.");
  feedbackModal.classList.remove("open");
};

/* ===================== Donate Butonu ===================== */
function openDonateModal() {
  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3>☕ Kahve İkram Et</h3>
        <button onclick="this.closest('.modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">×</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: 20px;">
        <p>Bu projeyi beğendiyseniz, bir kahve ikram ederek destekleyebilirsiniz! ☕</p>
        <!-- BuyMeACoffee Widget -->
        <div id="buymeacoffee-widget" style="margin: 20px 0;">
          <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="mhokutan" data-color="#FFDD00" data-emoji=""  data-font="Cookie" data-text="Buy me a coffee" data-outline-color="#000000" data-font-color="#000000" data-coffee-color="#ffffff" ></script>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
          <h4>💝 Teşekkürler!</h4>
          <p style="color: #666; margin: 10px 0;">Destekleriniz projenin gelişmesine yardımcı oluyor.</p>
          <p style="color: #888; font-size: 12px;">PayPal, kredi kartı ve diğer ödeme yöntemleri kabul edilir.</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Donate butonlarına event listener ekle
document.addEventListener('DOMContentLoaded', () => {
  const btnDonate = document.getElementById('btnDonate');
  const btnDonateMobile = document.getElementById('btnDonateMobile');
  
  if (btnDonate) {
    btnDonate.onclick = openDonateModal;
  }
  
  if (btnDonateMobile) {
    btnDonateMobile.onclick = openDonateModal;
  }
});

/* ===================== Kanal Ekleme ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const btnAddChannel = document.getElementById("btnAddChannel");
  const btnAddChannelMobile = document.getElementById("btnAddChannelMobile");
  
  if (btnAddChannel) {
    btnAddChannel.onclick = () => {
      const name = document.getElementById("newChannel").value.trim();
      if (!name) return;
      addChannel(name);
      document.getElementById("newChannel").value = "";
    };
  }
  
  if (btnAddChannelMobile) {
    btnAddChannelMobile.onclick = () => {
      const name = document.getElementById("newChannelMobile").value.trim();
      if (!name) return;
      addChannel(name);
      document.getElementById("newChannelMobile").value = "";
    };
  }
});

/* ===================== Lokasyon Bazlı Kanal Sistemi ===================== */

// Kanal listesini lokasyona göre güncelle
function updateChannelList(locationChannels) {
  console.log('🔄 Kanal listesi güncelleniyor:', locationChannels);
  
  // Mevcut kanal listelerini temizle
  const channelList = document.getElementById('channelList');
  const channelListMobile = document.getElementById('channelListMobile');
  
  if (channelList) {
    channelList.innerHTML = '';
  }
  if (channelListMobile) {
    channelListMobile.innerHTML = '';
  }
  
  // Lokasyon bazlı kanalları ekle
  locationChannels.forEach(channelName => {
    addChannelToList(channelName, channelList);
    addChannelToList(channelName, channelListMobile);
  });
  
  // Varsayılan kanalları da ekle
  const defaultChannels = ['#genel', '#sohbet'];
  defaultChannels.forEach(channelName => {
    if (!locationChannels.includes(channelName)) {
      addChannelToList(channelName, channelList);
      addChannelToList(channelName, channelListMobile);
    }
  });
}

// Kanalı listeye ekle
function addChannelToList(channelName, container) {
  if (!container) return;
  
  const li = document.createElement('li');
  li.className = 'channel-item';
  li.innerHTML = `<span class="channel-name">${channelName}</span>`;
  li.onclick = () => joinChannel(channelName);
  
  // Lokasyon bazlı kanalları özel renkle işaretle
  const locationChannels = JSON.parse(localStorage.getItem('locationBasedChannels') || '[]');
  if (locationChannels.includes(channelName)) {
    li.classList.add('location-based');
    li.innerHTML = `<span class="channel-name">📍 ${channelName}</span>`;
  }
  
  container.appendChild(li);
}

// Kanal listesini yeniden yükle
function reloadChannelList() {
  const locationChannels = JSON.parse(localStorage.getItem('locationBasedChannels') || '[]');
  if (locationChannels.length > 0) {
    updateChannelList(locationChannels);
  }
}

// Global fonksiyon olarak ekle
window.updateChannelList = updateChannelList;
window.reloadChannelList = reloadChannelList;

/* ===================== Donate Modal ===================== */
function openDonateModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>☕ Kahve İkram Et</h2>
      <p>Destekleriniz için teşekkürler! 🙏</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://www.buymeacoffee.com/mhokutan" target="_blank">
          <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;">
        </a>
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">
        Bu bağışlar site geliştirmesi için kullanılacak.
      </p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Modal dışına tıklayınca kapat
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
  
  // ESC tuşu ile kapat
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

// Donate butonları için event listener
document.addEventListener('DOMContentLoaded', () => {
  const btnDonate = document.getElementById('btnDonate');
  const btnDonateMobile = document.getElementById('btnDonateMobile');
  
  if (btnDonate) {
    btnDonate.onclick = openDonateModal;
  }
  
  if (btnDonateMobile) {
    btnDonateMobile.onclick = openDonateModal;
  }
});

/* ===================== Mesaj Fonksiyonları ===================== */
function addMessage(user, text, timestamp) {
  const messages = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="message-user">${user}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-text">${cleanMessage(text)}</div>
  `;
  
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

function updateUserList(users) {
  const userList = document.getElementById('userList');
  if (userList) {
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      userList.appendChild(li);
    });
  }
}

function showTyping(user) {
  const typingArea = document.getElementById('typingArea');
  if (typingArea) {
    typingArea.textContent = `${user} yazıyor...`;
    setTimeout(() => {
      typingArea.textContent = '';
    }, 3000);
  }
}

/* ===================== WebSocket ===================== */
function connectWS() {
  if (ws) {
    ws.close();
  }
  
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    console.log('🔌 WebSocket bağlantısı kuruldu');
    if (token) {
      ws.send(JSON.stringify({type: "auth", token}));
    }
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "message") {
      addMessage(data.user, data.text, data.timestamp);
    } else if (data.type === "userList") {
      updateUserList(data.users);
    } else if (data.type === "typing") {
      showTyping(data.user);
    }
  };
  
  ws.onclose = () => {
    console.log('🔌 WebSocket bağlantısı kapandı');
    // 3 saniye sonra yeniden bağlan
    setTimeout(connectWS, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('🔌 WebSocket hatası:', error);
  };
}

/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App başlatılıyor...');
  
  // DOM elementlerini başlat
  initDOM();
  
  // Kanal oluşturma sistemini başlat
  initChannelCreation();
  
  // Event listener'ları ekle
  if (btnSend) {
    btnSend.onclick = () => {
      const text = messageInput.value.trim();
      if (!text) return;
      
      messageInput.value = '';
      
      if (currentChannel === "#heponsigorta") {
        fetch(API + "/sponsor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        })
        .then(r => r.json())
        .then(data => {
          if (data.answer) addMessage("HeponBot 🤖", data.answer);
        })
        .catch(() => addMessage("HeponBot 🤖", "Üzgünüm, şu an yanıt veremiyorum."));
      } else {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "message", text }));
        } else {
          console.log('⚠️ WebSocket bağlantısı yok, mesaj gönderilemiyor');
          addMessage("Sistem", "Bağlantı kuruluyor, lütfen bekleyin...");
        }
      }
    };
  }
  
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnSend.click();
      }
    });
  }
  
  // Auth durumunu kontrol et
  if (token && authStatus) {
    authStatus.textContent = "Giriş yapıldı";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnProfile) btnProfile.style.display = "inline-block";
    if (btnLogout) btnLogout.style.display = "inline-block";
  }
  
  // Auth sistemini başlat
  initAuth();
  
    // Lokasyon sistemini başlat
  initLocation();
  
  // Profil sistemini başlat
  initProfile();
  
  // WebSocket bağlantısını başlat
  connectWS();
  
  // Kanalları yükle
  loadChannels();
  
  console.log('✅ App başlatıldı');
});