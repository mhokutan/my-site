"use strict";

/* ===================== Config ===================== */
const API = "https://chat-backend-xi60.onrender.com";
const WS_URL = "wss://chat-backend-xi60.onrender.com";

let token = localStorage.getItem("token");
let ws, currentChannel = "#genel";

/* ===================== State ===================== */
let follows = JSON.parse(localStorage.getItem("follows") || "[]");
const bannedWords = ["küfür1","küfür2","badword"];

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
form.onsubmit=e=>{
  e.preventDefault();
  let text=input.value.trim();
  if(!text) return;
  text=cleanMessage(text);
  addMessage("Ben",text);

  if(currentChannel==="#heponsigorta"){
    fetch(API+"/sponsor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})
    .then(r=>r.json()).then(data=>{
      if(data.answer) addMessage("HeponBot 🤖",data.answer);
    }).catch(()=>addMessage("HeponBot 🤖","Üzgünüm, şu an yanıt veremiyorum."));
  } else {
    ws.send(JSON.stringify({type:"message",text}));
  }
  input.value="";
};
input.addEventListener("input",()=>{
  if(ws&&ws.readyState===WebSocket.OPEN){
    ws.send(JSON.stringify({type:"typing"}));
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
  if(dmWindows[room]) return;
  const win=document.createElement("div");
  win.className="modal open";
  win.innerHTML=`
    <div class="modal-content" style="width:420px;max-height:90vh;overflow:auto">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">✖</button>
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
function sendDM(room,formEl){
  const raw=(formEl.text.value||"").trim();
  const text=cleanMessage(raw);
  if(!text) return;
  const box=document.getElementById("msg-"+room);
  box.innerHTML+=`<div><b>Ben:</b> ${text}</div>`;
  ws.send(JSON.stringify({type:"message",text,channel:room}));
  formEl.text.value="";
}

/* ===================== Auth ===================== */
btnLogin.onclick=()=>loginModal.classList.add("open");

doLogin.onclick=async()=>{
  try{
    const identifier=document.getElementById("identifier").value.trim();
    const password=document.getElementById("password").value;
    const res=await fetch(API+"/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
    const data=await res.json();
    if(!res.ok||!data.success) throw new Error(data?.error||("HTTP "+res.status));

    token=data.token;
    localStorage.setItem("token",token);
    authStatus.textContent=identifier;
    btnLogin.style.display="none"; btnProfile.style.display="inline-block"; btnLogout.style.display="inline-block";
    loginModal.classList.remove("open");
    document.getElementById("addChannelBox").style.display="block";
    document.getElementById("addChannelBoxMobile").style.display="block";
    ws&&ws.close(); connectWS();
  }catch(err){ alert("Giriş hatası: "+err.message); }
};

doRegister.onclick=async()=>{
  try{
    const identifier=document.getElementById("identifier").value.trim();
    const password=document.getElementById("password").value;
    const res=await fetch(API+"/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier,password})});
    const data=await res.json();
    if(!res.ok||!data.success) throw new Error(data?.error||("HTTP "+res.status));
    alert("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
  }catch(err){ alert("Kayıt hatası: "+err.message); }
};

btnLogout.onclick=()=>{
  localStorage.removeItem("token");
  token=null;
  location.reload();
};

/* ===================== Profil ===================== */
btnProfile.onclick=()=> profileModal.classList.add("open");
saveProfile.onclick=async()=>{
  const profile={
    firstName:firstName.value,lastName:lastName.value,
    gender:gender.value,birth:birth.value,country:country.value,city:city.value
  };
  const res=await fetch(API+"/profile/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,profile})});
  const data=await res.json();
  if(data.success){ alert("Profil güncellendi"); profileModal.classList.remove("open"); }
};

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
  await fetch(API+"/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,text})});
  alert("Teşekkürler! Öneriniz kaydedildi.");
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

/* ===================== Init ===================== */
if(token){ authStatus.textContent="Giriş yapıldı"; btnLogin.style.display="none"; btnProfile.style.display="inline-block"; btnLogout.style.display="inline-block"; }
connectWS();