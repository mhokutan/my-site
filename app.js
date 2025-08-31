"use strict";

/* ---------- Ülke/Şehir verisi ---------- */
const cities = {
  "Türkiye": ["İstanbul","Ankara","İzmir"],
  "ABD": ["New York","Los Angeles","Chicago"],
  "Almanya": ["Berlin","Münih","Hamburg"],
  "İngiltere": ["Londra","Manchester","Birmingham"],
  "Fransa": ["Paris","Lyon","Marsilya"]
};

/* ---------- State ---------- */
let profile = JSON.parse(localStorage.getItem("profile")) || null;
let anonName = localStorage.getItem("anonName") || null;
let currentCategory = null;

/* ---------- Elemanlar ---------- */
const profileModal   = document.getElementById("profileModal");
const categoryModal  = document.getElementById("categoryModal");
const chatContainer  = document.getElementById("chatContainer");

const countryEl   = document.getElementById("countrySelect");
const cityEl      = document.getElementById("citySelect");
const saveProfileBtn   = document.getElementById("saveProfile");
const startChatBtn     = document.getElementById("startChat");
const resetProfileBtn  = document.getElementById("resetProfileBtn");

const statusEl   = document.getElementById("status");
const messagesEl = document.getElementById("messages");
const typingEl   = document.getElementById("typing");
const form       = document.getElementById("form");
const input      = document.getElementById("input");
const anonNameEl = document.getElementById("anonName");

/* ---------- Modal yardımcı ---------- */
function openModal(el){ el.classList.add("open"); document.body.classList.add("noscroll"); }
function closeModal(el){
  el.classList.remove("open");
  if(!document.querySelector(".modal.open")) document.body.classList.remove("noscroll");
}
function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion"];
  const colors=["Blue","Red","Green","Black","White","Golden"];
  return colors[Math.floor(Math.random()*colors.length)] + animals[Math.floor(Math.random()*animals.length)] + Math.floor(Math.random()*1000);
}

/* ---------- Ülke/Şehir ---------- */
countryEl.addEventListener("change", e=>{
  const c=e.target.value;
  cityEl.innerHTML='<option value="">Seçiniz</option>';
  if(c && cities[c]){
    cities[c].forEach(ct=>{
      const opt=document.createElement("option");
      opt.value=ct; opt.textContent=ct;
      cityEl.appendChild(opt);
    });
  }
});

/* ---------- Profil Kaydet ---------- */
saveProfileBtn.addEventListener("click", ()=>{
  const data={
    gender:document.getElementById("gender").value,
    firstName:document.getElementById("firstName").value,
    lastName:document.getElementById("lastName").value,
    email:document.getElementById("email").value,
    phone:document.getElementById("phone").value,
    country:countryEl.value,
    city:cityEl.value,
    birthDate:document.getElementById("birthDate").value
  };
  if(!data.gender || !data.firstName || !data.lastName || !data.email || !data.country || !data.city || !data.birthDate){
    alert("Lütfen tüm alanları doldurun");
    return;
  }
  profile=data;
  localStorage.setItem("profile",JSON.stringify(data));
  if(!anonName){
    anonName=randomAnonName();
    localStorage.setItem("anonName",anonName);
  }
  closeModal(profileModal);
  openModal(categoryModal);
});

/* ---------- Kategori Başlat ---------- */
startChatBtn.addEventListener("click", ()=>{
  currentCategory=document.getElementById("categorySelect").value;
  if(!currentCategory){ alert("Lütfen kategori seçin."); return; }
  closeModal(categoryModal);
  chatContainer.style.display="flex";
  anonNameEl.textContent="Takma Ad: "+anonName;
  statusEl.textContent=`${profile.country}/${profile.city} - ${currentCategory}`;
  addInfo(`${currentCategory} sohbetine bağlandın.`);
});

/* ---------- Profil sıfırla ---------- */
resetProfileBtn.addEventListener("click", ()=>{
  localStorage.clear();
  location.reload();
});

/* ---------- Mesajlaşma ---------- */
function addMessage(from,text,cls=""){
  const div=document.createElement("div");
  div.className=`message ${cls}`.trim();
  div.textContent=`${from}: ${text}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop=messagesEl.scrollHeight;
}
function addInfo(text){
  const div=document.createElement("div");
  div.className="info"; div.textContent=text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop=messagesEl.scrollHeight;
}

/* AI fallback */
async function botReplyWithAI(category,userText){
  typingEl.hidden=false;
  try{
    const res=await fetch("https://chat-backend-xi60.onrender.com/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({category,message:userText})
    });
    const data=await res.json();
    typingEl.hidden=true;
    addMessage("AI",data.reply,"bot");
  }catch(err){
    typingEl.hidden=true;
    addMessage("AI","⚠️ Sunucuya bağlanılamadı.","bot");
  }
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  if(!currentCategory) return;
  const text=input.value.trim();
  if(!text) return;
  addMessage(anonName,text,"me");
  input.value="";
  botReplyWithAI(currentCategory,text);
});

/* ---------- Akış başlat ---------- */
if(!profile) openModal(profileModal);
else openModal(categoryModal);
