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

const genderEl    = document.getElementById("gender");
const firstEl     = document.getElementById("firstName");
const lastEl      = document.getElementById("lastName");
const emailEl     = document.getElementById("email");
const phoneEl     = document.getElementById("phone");
const countryEl   = document.getElementById("countrySelect");
const cityEl      = document.getElementById("citySelect");
const birthEl     = document.getElementById("birthDate");

const saveProfileBtn   = document.getElementById("saveProfile");
const startChatBtn     = document.getElementById("startChat");
const resetProfileBtn  = document.getElementById("resetProfileBtn");

const statusEl   = document.getElementById("status");
const messagesEl = document.getElementById("messages");
const typingEl   = document.getElementById("typing");
const form       = document.getElementById("form");
const input      = document.getElementById("input");
const anonNameEl = document.getElementById("anonName");

/* ---------- Yardımcılar ---------- */
function openModal(el){ el.classList.add("open"); document.body.classList.add("noscroll"); }
function closeModal(el){
  el.classList.remove("open");
  // başka açık modal yoksa scroll serbest
  if(!document.querySelector(".modal.open")) document.body.classList.remove("noscroll");
}
function isProfileComplete(p){
  if(!p) return false;
  // zorunlu alanlar
  return p.gender && p.firstName && p.lastName && p.email && p.country && p.city && p.birthDate;
}
function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion"];
  const colors=["Blue","Red","Green","Black","White","Golden"];
  return colors[Math.floor(Math.random()*colors.length)] + animals[Math.floor(Math.random()*animals.length)] + Math.floor(Math.random()*1000);
}

/* ---------- Ülke/Şehir dinamiği ---------- */
countryEl.addEventListener("change", e=>{
  const c = e.target.value;
  cityEl.innerHTML = '<option value="">Seçiniz</option>';
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
    gender:genderEl.value.trim(),
    firstName:firstEl.value.trim(),
    lastName:lastEl.value.trim(),
    email:emailEl.value.trim(),
    phone:phoneEl.value.trim(),
    country:countryEl.value.trim(),
    city:cityEl.value.trim(),
    birthDate:birthEl.value
  };
  if(!isProfileComplete(data)){
    alert("Lütfen tüm zorunlu alanları doldurun (cinsiyet, isim, soyisim, email, ülke, şehir, doğum tarihi).");
    return;
  }
  profile = data;
  localStorage.setItem("profile",JSON.stringify(data));
  if(!anonName){
    anonName = randomAnonName();
    localStorage.setItem("anonName", anonName);
  }
  // Profil bitti -> sadece profil modalı kapanır, sonra kategori modalı açılır.
  closeModal(profileModal);
  openModal(categoryModal);
});

/* ---------- Kategori Başlat ---------- */
startChatBtn.addEventListener("click", ()=>{
  currentCategory = document.getElementById("categorySelect").value;
  if(!currentCategory){ alert("Lütfen kategori seçin."); return; }

  // Sırayla: kategori modal kapanır, chat açılır.
  closeModal(categoryModal);
  chatContainer.style.display="flex";

  anonNameEl.textContent = "Takma Ad: " + anonName;
  statusEl.textContent   = `${profile.country}/${profile.city} - ${currentCategory}`;
  addInfo(`${currentCategory} sohbetine bağlandın.`);
});

/* ---------- Profil sıfırla ---------- */
resetProfileBtn.addEventListener("click", ()=>{
  localStorage.removeItem("profile");
  localStorage.removeItem("anonName");
  profile = null; anonName = null; currentCategory = null;
  messagesEl.innerHTML = "";
  chatContainer.style.display="none";
  // yalnızca profil modalını aç
  openModal(profileModal);
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

/* OpenAI backend (senin Render servisin) */
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
    console.error(err);
  }
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  if(!currentCategory){ alert("Önce kategori seçin."); return; }
  const text=input.value.trim();
  if(!text) return;
  addMessage(anonName || "Ben", text, "me");
  input.value="";
  botReplyWithAI(currentCategory,text);
});

/* ---------- Başlangıç akışı (tek modal kuralı) ---------- */
function initFlow(){
  // Başta tüm modallar kapalı
  closeModal(profileModal);
  closeModal(categoryModal);

  if(!isProfileComplete(profile)){
    openModal(profileModal);             // 1) önce profil
    return;
  }
  // Profil tamamsa kategori
  openModal(categoryModal);              // 2) sonra kategori
}

initFlow();
