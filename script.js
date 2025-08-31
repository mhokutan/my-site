const ws = new WebSocket(`ws://${location.host}`);

let nickname = localStorage.getItem("nickname") || "";
const nicknameInput = document.getElementById("nickname");
const saveProfile = document.getElementById("saveProfile");
if (nickname) nicknameInput.value = nickname;
saveProfile.addEventListener("click", () => {
  const value = nicknameInput.value.trim();
  if (!value) return;
  nickname = value;
  localStorage.setItem("nickname", nickname);
  alert("Profil kaydedildi");
});

let currentCategory = null;
const messagesEl = document.getElementById("messages");
const categoryEls = Array.from(document.querySelectorAll("#categories li"));

const pending = [];

function joinCategory(cat) {
  const payload = JSON.stringify({
    type: "join",
    category: cat,
    nickname,
  });
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(payload);
  } else {
    pending.push(payload);
  }
}

function addMessage(from, text) {
  const div = document.createElement("div");
  div.className = "message" + (from === nickname ? " me" : "");
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

// ✅ Conflict çözümü: attachCategory fonksiyonu tanımlı ve her li için çağrılıyor
function attachCategory(li) {
  li.addEventListener("click", () => {
    if (!nickname) {
      alert("Lütfen önce profilinizi kaydedin.");
      return;
    }
    currentCategory = li.dataset.cat;
    clearMessages();
    joinCategory(currentCategory);
  });
}
categoryEls.forEach(attachCategory);

const categoriesEl = document.getElementById("categories");
const customCategoryInput = document.getElementById("customCategory");
const addCategoryBtn = document.getElementById("addCategory");
const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");

const cities = {
  Türkiye: ["İstanbul", "Ankara", "İzmir"],
  USA: ["New York", "Los Angeles", "Chicago"],
  Almanya: ["Berlin", "Münih", "Hamburg"],
  İngiltere: ["Londra", "Manchester", "Birmingham"],
  Fransa: ["Paris", "Lyon", "Marsilya"],
  Hollanda: ["Amsterdam", "Rotterdam", "Lahey"],
};

countrySelect.addEventListener("change", () => {
  const country = countrySelect.value;
  citySelect.innerHTML = '<option value="">Şehir Seç</option>';
  if (country && cities[country]) {
    cities[country].forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }
});

addCategoryBtn.addEventListener("click", () => {
  let cat = customCategoryInput.value.trim();
  if (!cat && countrySelect.value && citySelect.value) {
    cat = `#${countrySelect.value}-${citySelect.value}`;
  } else if (cat && !cat.startsWith("#")) {
    cat = `#${cat}`;
  }
  if (!cat) return;
  const li = document.createElement("li");
  li.dataset.cat = cat;
  li.textContent = cat;
  attachCategory(li);
  categoriesEl.appendChild(li);
  customCategoryInput.value = "";
});

ws.addEventListener("open", () => {
  while (pending.length) ws.send(pending.shift());
  if (!currentCategory && categoryEls.length) {
    const random = categoryEls[Math.floor(Math.random() * categoryEls.length)];
    currentCategory = random.dataset.cat;
    clearMessages();
    joinCategory(currentCategory);
  }
});

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "info") {
    addInfo(msg.message);
  } else if (msg.type
