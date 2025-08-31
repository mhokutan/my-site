"use strict";

const cities = {
  "Türkiye": ["İstanbul","Ankara","İzmir"],
  "ABD": ["New York","Los Angeles","Chicago"],
  "Almanya": ["Berlin","Münih","Hamburg"],
  "İngiltere": ["Londra","Manchester","Birmingham"],
  "Fransa": ["Paris","Lyon","Marsilya"]
};

let profile = JSON.parse(localStorage.getItem("profile")) || null;
let anonName = localStorage.getItem("anonName") || null;
let currentCategory = null;

const profileModal = document.getElementById("profileModal");
const categoryModal = document.getElementById("categoryModal");
const chatContainer = document.getElementById("chatContainer");

function randomAnonName(){
  const animals=["Tiger","Fox","Panda","Eagle","Shark","Lion"];
  const colors=["Blue","Red","Green","Black","White","Golden"];
  return colors[Math.floor(Math.random()*colors.length)] + animals[Math.floor(Math.random()*animals.length)] + Math.floor(Math.random()*1000);
}

function showProfileModal(){ profileModal.style.display="flex"; }
function hideProfileModal(){ profileModal.style.display="none"; }
function showCategoryModal(){ categoryModal.style.display="flex"; }
function hideCategoryModal(){ categoryModal.style.display="none"; }

document.getElementById("countrySelect").addEventListener("change", e=>{
  const c=e.target.value;
  const citySelect=document.getElementById("citySelect");
  citySelect.innerHTML='<option value="">Seçiniz</option>';
  if(c && cities[c]){
    cities[c].forEach(ct=>{
      const opt=document.createElement("option");
      opt.value=ct; opt.textContent=ct;
      citySelect.appendChild(opt);
    });
  }
});

document.getElementById("saveProfile").addEventListener("click", ()=>{
  const data={
    gender:document.getElementById("gender").value,
    firstName:document.getElementById("firstName").value,
    lastName:document.getElementById("lastName").value,
    email:document.getElementById("email").value,
    phone:document.getElementById("phone").value,
    country:document.getElementById("countrySelect").value,
    city:document.getElementById("citySelect").value,
    birthDate:document.getElementById("birthDate").value
  };
  profile=data;
  localStorage.setItem("profile",JSON.stringify(data));
  if(!anonName){
    anonName=randomAnonName();
    localStorage.setItem("anonName",anonName);
  }
  hideProfileModal();
  showCategoryModal();
});

document.getElementById("startChat").addEventListener("click", ()=>{
  currentCategory=document.getElementById("categorySelect").value;
  hideCategoryModal();
  document.getElementById("chatContainer").style.display="flex";
  document.getElementById("anonName").textContent="Takma Ad: "+anonName;
  document.getElementById("status").textContent=`${profile.country}/${profile.city} - ${currentCategory}`;
  addInfo(`${currentCategory} sohbetine bağlandın.`);
});

function resetProfile(){
  localStorage.clear();
  location.reload();
}

/* ------------------ Chat ------------------ */
const messagesEl=document.getElementById("messages");
const typingEl=document.getElementById("typing");
const form=document.getElementById("form");
const input=document.getElementById("input");

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
  // şimdilik hep AI ile (ileride kullanıcı eşleştirmesi eklenecek)
  botReplyWithAI(currentCategory,text);
});

/* ------------------ Başlat ------------------ */
if(!profile) showProfileModal();
else if(!currentCategory) showCategoryModal();
