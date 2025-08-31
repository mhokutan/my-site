"use strict";

const cities = {
  "Türkiye": ["İstanbul","Ankara","İzmir"],
  "ABD": ["New York","Los Angeles","Chicago"],
  "Almanya": ["Berlin","Münih","Hamburg"],
  "İngiltere": ["Londra","Manchester","Birmingham"]
};

let profile = JSON.parse(localStorage.getItem("profile")) || null;
let anonName = localStorage.getItem("anonName") || null;
let currentCategory = null;

const profileModal = document.getElementById("profileModal");
const categoryModal = document.getElementById("categoryModal");
const chatContainer = document.getElementById("chatContainer");

const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typing");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusEl = document.getElementById("status");
const userListEl = document.getElementById("userList");

function openModal(el){el.classList.add("open");}
function closeModal(el){el.classList.remove("open");}

function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion"];
  const colors=["Blue","Red","Green","Black","White","Golden"];
  return colors[Math.floor(Math.random()*colors.length)] + animals[Math.floor(Math.random()*animals.length)] + Math.floor(Math.random()*1000);
}

/* Ülke/Şehir */
document.getElementById("countrySelect").addEventListener("change", e=>{
  const c=e.target.value;
  const cityEl=document.getElementById("citySelect");
  cityEl.innerHTML='<option value="">Seçiniz</option>';
  if(c && cities[c]){
    cities[c].forEach(ct=>{
      const opt=document.createElement("option");
      opt.value=ct; opt.textContent=ct;
      cityEl.appendChild(opt);
    });
  }
});

/* Profil Kaydet */
document.getElementById("saveProfile").addEventListener("click", ()=>{
  profile={
    firstName:document.getElementById("firstName").value,
    lastName:document.getElementById("lastName").value,
    email:document.getElementById("email").value,
    country:document.getElementById("countrySelect").value,
    city:document.getElementById("citySelect").value
  };
  localStorage.setItem("profile",JSON.stringify(profile));
  if(!anonName){anonName=randomAnonName();localStorage.setItem("anonName",anonName);}
  closeModal(profileModal);
  openModal(categoryModal);
});

/* Anonim devam et */
document.getElementById("skipProfile").addEventListener("click", ()=>{
  profile=null;
  if(!anonName){anonName=randomAnonName();localStorage.setItem("anonName",anonName);}
  closeModal(profileModal);
  openModal(categoryModal);
});

/* Kategori seç */
document.getElementById("startChat").addEventListener("click", ()=>{
  currentCategory=document.getElementById("categorySelect").value;
  closeModal(categoryModal);
  chatContainer.style.display="flex";
  const loc=profile?`${profile.country}/${profile.city}`:"Anonim";
  statusEl.textContent=`${loc} - ${currentCategory}`;
  addInfo(`${currentCategory} sohbetine bağlandın.`);
  renderUserList();
});

function resetProfile(){
  localStorage.clear();
  location.reload();
}

/* Kullanıcı listesi */
function renderUserList(){
  userListEl.innerHTML="";
  const li=document.createElement("li");
  li.textContent=anonName||"Ben";
  userListEl.appendChild(li);
  const li2=document.createElement("li");
  li2.textContent="AI";
  userListEl.appendChild(li2);
}

/* Mesajlaşma */
function addMessage(from,text,cls=""){
  const div=document.createElement("div");
  div.className=`message ${cls}`;
  div.textContent=`${from}: ${text}`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop=messagesEl.scrollHeight;
}
function addInfo(text){
  const div=document.createElement("div");
  div.className="info";div.textContent=text;
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

/* Menü fonksiyonları */
function openProfile(){openModal(profileModal);}
function openCategory(){openModal(categoryModal);}

/* Başlat */
openModal(profileModal);
