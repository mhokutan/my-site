// One-Time Chat - Frontend only (HTML/CSS/JS) with Firebase (queue) + PeerJS (WebRTC P2P)
/*
  ÖNEMLİ NOT
  -----------
  Bu proje yalnızca istemci tarafı teknolojilerle (HTML/CSS/JavaScript) çalışır.
  - Eşleştirme için: Firebase Realtime Database (ücretsiz Spark plan yeterli)
  - P2P mesajlaşma için: PeerJS (WebRTC DataChannel)

  KURULUM ADIMLARI
  1) https://console.firebase.google.com üzerinden bir proje oluştur.
  2) "Realtime Database" ekle -> "Start in test mode" (deneme için). Üretimde kuralları sıkılaştır.
  3) Aşağıdaki firebaseConfig'i kendi değerlerinle doldur.
  4) Dosyaları GitHub Pages'e koy: index.html, styles.css, app.js
*/

// ---- 1) Firebase: kendi config'inle değiştir ----
const firebaseConfig = {
  apiKey: "AIzaSyBs13s5PAZ3gdXlCMa_5qjrTwRrWFOB1Zs",
  authDomain: "my-site-63b90.firebaseapp.com",
  databaseURL: "https://my-site-63b90-default-rtdb.firebaseio.com",
  projectId: "my-site-63b90",
  storageBucket: "my-site-63b90.firebasestorage.app",
  messagingSenderId: "657406402623",
  appId: "1:657406402623:web:fea255e5a92663ffa4588a",
  measurementId: "G-D7NNBGKNB3"
};


// ---- 2) Uygulama Durumu ----
let appState = {
  peer: null,
  myId: null,
  conn: null,
  waiting: false,
  matchedWith: null,
  nickname: null,
  queueRef: null,
  db: null,
  ai: false,
  aiHistory: [],
  matchTimeout: null,
};

// ---- 3) Yardımcılar ----
const $ = (sel) => document.querySelector(sel);
const statusEl = $("#status");
const startBtn = $("#startBtn");
const nextBtn = $("#nextBtn");
const endBtn = $("#endBtn");
const sendForm = $("#sendForm");
const sendBtn = $("#sendBtn");
const msgInput = $("#messageInput");
const chatCard = $("#chatCard");
const messagesEl = $("#messages");
const roomChip = $("#roomChip");
const peerInfo = $("#peerInfo");
const themeToggle = $("#themeToggle");
const likeBtn = $("#likeBtn");
const dislikeBtn = $("#dislikeBtn");
const changeBtn = $("#changeBtn");
const skipBtn = $("#skipBtn");
const addFriendBtn = $("#addFriendBtn");
const profileBtn = $("#profileBtn");
let nextBtnTimer = null;

function setStatus(t) {
  statusEl.textContent = t;
}
function addMsg(text, who = "sys") {
  const div = document.createElement("div");
  div.className = `message ${who}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function setConnectedUI(connected) {
  sendBtn.disabled = !connected;
  endBtn.disabled = !connected && !appState.waiting;
  nextBtn.disabled = !connected && !appState.waiting;
  likeBtn.disabled = !connected;
  dislikeBtn.disabled = !connected;
  changeBtn.disabled = !connected;
  skipBtn.disabled = !connected;
  addFriendBtn.disabled = true;
  addFriendBtn.classList.add("hidden");
  chatCard.classList.toggle("hidden", !connected && !appState.waiting);
}
function sanitize(text) {
  return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}

function scheduleNextButton() {
  nextBtn.classList.add("hidden");
  nextBtn.disabled = true;
  if (nextBtnTimer) clearTimeout(nextBtnTimer);
  nextBtnTimer = setTimeout(() => {
    nextBtn.classList.remove("hidden");
    nextBtn.disabled = false;
  }, 30000);
}

// Tema
(function initTheme(){
  const key = "otc-theme";
  const saved = localStorage.getItem(key);
  if (saved === "light") document.body.classList.add("light");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem(key, document.body.classList.contains("light") ? "light" : "dark");
  });
})();

// ---- 4) Başlat ----
startBtn.addEventListener("click", async () => {
  if (appState.myId) {
    attemptMatch();
    return;
  }

  appState.nickname = ($("#nickname").value || "").trim().slice(0, 20) || null;
  setStatus("Başlatılıyor...");
  initFirebase();
  initPeer();

  // 🔥 Giriş kartını gizle
  document.querySelector(".intro").classList.add("hidden");
  // Sohbet kartını göster
  chatCard.classList.remove("hidden");
});


endBtn.addEventListener("click", async () => {
  endCurrent();
});

nextBtn.addEventListener("click", async () => {
  endCurrent(true);
  attemptMatch();
});

sendForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!appState.conn && !appState.ai) return;
  const text = sanitize(msgInput.value.trim());
  if (!text) return;
  addMsg(text, "me");
  msgInput.value = "";
  if (appState.conn) {
    appState.conn.send({ type: "msg", text, name: appState.nickname });
  } else if (appState.ai) {
    aiSend(text);
  }
});

likeBtn.addEventListener("click", () => {
  addMsg("Sistem: Kullanıcıyı beğendiniz.", "sys");
  addFriendBtn.classList.remove("hidden");
  addFriendBtn.disabled = false;
});

dislikeBtn.addEventListener("click", () => {
  addMsg("Sistem: Kullanıcıyı beğenmediniz.", "sys");
  endCurrent(true);
  attemptMatch();
});

changeBtn.addEventListener("click", () => {
  addMsg("Sistem: Değiştir butonuna basıldı.", "sys");
  endCurrent(true);
  attemptMatch();
});

addFriendBtn.addEventListener("click", () => {
  addMsg("Sistem: Kullanıcı arkadaş olarak eklendi.", "sys");
  addFriendBtn.classList.add("hidden");
  addFriendBtn.disabled = true;
});

skipBtn.addEventListener("click", () => {
  addMsg("Sistem: Geç butonuna basıldı.", "sys");
});

profileBtn.addEventListener("click", () => {
  window.location.href = "profile.html";
});

// ---- 5) Firebase & PeerJS Kurulum ----
function initFirebase() {
  const app = firebase.initializeApp(firebaseConfig);
  appState.db = firebase.database();
  appState.queueRef = appState.db.ref("queue"); // tek-slotluk basit kuyruk
  appState.db.ref("queue").onDisconnect().remove();
}

function initPeer() {
  appState.peer = new Peer(undefined, { debug: 1 });

  appState.peer.on("open", (id) => {
    appState.myId = id;
    setStatus("Hazır. Eşleştiriliyor...");
    addMsg("Sistem: Bağlantı açık. Eşleşme bekleniyor.", "sys");
    peerInfo.textContent = `Ben: ${id}`;
    attemptMatch();
  });

  appState.peer.on("connection", (conn) => {
    // Karşı taraf beni bağladı -> gelen bağlantıyı kabul et
    bindConnection(conn, /*initiator*/ false);
  });

  appState.peer.on("error", (err) => {
    console.error(err);
    setStatus("Peer hata: " + err.type);
  });
}

// ---- 6) Eşleştirme Mantığı ----
// Basit tek-kuyruk: queue null ise ID'ni yazıp bekle, doluysa al ve sıfırla.
function attemptMatch() {
  if (!appState.queueRef || !appState.myId) return;
  appState.matchedWith = null;
  appState.waiting = true;
  setStatus("Eşleştiriliyor...");

  if (appState.matchTimeout) clearTimeout(appState.matchTimeout);
  appState.matchTimeout = setTimeout(() => {
    if (appState.waiting) {
      connectToAI();
    }
  }, 5000);

  let matchedWith = null;
  appState.queueRef
    .transaction((current) => {
      if (!current) {
        // sıra boş -> kendimi koyayım ve bekleyeyim
        return appState.myId;
      } else if (current !== appState.myId) {
        // biri bekliyor -> onu alıyorum, kuyruğu boşaltıyorum
        matchedWith = current;
        return null;
      } else {
        // zaten ben bekliyorum, dokunma
        return;
      }
    })
    .then((result) => {
      const { committed, snapshot } = result;
      if (matchedWith) {
        // Ben arayanım -> karşıya bağlan
        appState.waiting = false;
        if (appState.matchTimeout) clearTimeout(appState.matchTimeout);
        connectToPeer(matchedWith);
      } else {
        // Kuyruğa yerleştim ve beklemedeyim
        setStatus("Eşleşme bekleniyor...");
        roomChip.textContent = "Beklemede...";
        setConnectedUI(false);
        chatCard.classList.remove("hidden");
        addMsg("Sistem: Eşleşme arıyorum. Pencereyi kapatma.", "sys");
        // Karşıdan bağlantı gelmesini bekle (peer.on('connection') tetiklenecek).
      }
    })
    .catch((e) => {
      console.error(e);
      setStatus("Eşleştirme hatası.");
    });
}

function connectToPeer(otherId) {
  setStatus("Eş bulundu, bağlanılıyor...");
  roomChip.textContent = "Bağlanıyor...";

  const conn = appState.peer.connect(otherId, { reliable: true });
  bindConnection(conn, /*initiator*/ true);
}

function connectToAI() {
  appState.waiting = false;
  appState.ai = true;
  if (appState.matchTimeout) clearTimeout(appState.matchTimeout);
  if (appState.queueRef && appState.myId) {
    appState.queueRef.transaction((current) => {
      return current === appState.myId ? null : current;
    });
  }
  setStatus("Yapay zekayla sohbet ediyorsunuz.");
  roomChip.textContent = "AI";
  peerInfo.textContent = "OpenAI";
  setConnectedUI(true);
  scheduleNextButton();
  addMsg("Sistem: Yapay zeka bağlandı.", "sys");
}

function aiSend(text) {
  appState.aiHistory.push({ role: "user", content: text });
  fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: appState.aiHistory }),
  })
    .then((res) => res.json())
    .then((data) => {
      const reply = data.reply?.trim();
      if (reply) {
        appState.aiHistory.push({ role: "assistant", content: reply });
        addMsg(reply, "them");
      } else {
        addMsg("Sistem: Yapay zekadan yanıt alınamadı.", "sys");
      }
    })
    .catch((err) => {
      console.error(err);
      addMsg("Sistem: Yapay zeka hatası.", "sys");
    });
}

function bindConnection(conn, initiator) {
  appState.conn = conn;
  appState.matchedWith = conn.peer;
  appState.waiting = false;
  if (appState.matchTimeout) clearTimeout(appState.matchTimeout);

  conn.on("open", () => {
    setStatus("Bağlandı! İyi sohbetler 🎉");
    roomChip.textContent = "Bağlı";
    peerInfo.textContent = `Karşı: ${conn.peer}`;

    setConnectedUI(true);
    scheduleNextButton();
    addMsg("Sistem: Karşı taraf bağlandı.", "sys");

    // Selam mesajı (gönüllü)
    if (appState.nickname) {
      conn.send({ type: "hello", name: appState.nickname });
    }
  });

  conn.on("data", (data) => {
    if (!data || typeof data !== "object") return;
    if (data.type === "msg") {
      addMsg(String(data.text).slice(0, 500), "them");
    } else if (data.type === "hello") {
      addMsg(`Sistem: Karşı taraf takma adı → ${String(data.name).slice(0,20)}`, "sys");
    }
  });

  conn.on("close", () => {
    addMsg("Sistem: Karşı taraf sohbeti bitirdi.", "sys");
    setStatus("Bağlantı kapandı.");
    setConnectedUI(false);
    roomChip.textContent = "Bağlı değil";
  });

  conn.on("error", (err) => {
    console.error("Conn error", err);
    setStatus("Bağlantı hatası.");
    setConnectedUI(false);
  });
}

// ---- 7) Bitir / Sıradaki ----
function endCurrent(skipQueueCleanup = false) {
  if (appState.matchTimeout) clearTimeout(appState.matchTimeout);
  if (nextBtnTimer) clearTimeout(nextBtnTimer);
  nextBtn.classList.add("hidden");
  nextBtn.disabled = true;
  if (appState.ai) {
    appState.ai = false;
    appState.aiHistory = [];
  }
  try {
    if (appState.conn && appState.conn.open) {
      appState.conn.close();
    }
  } catch (e) {}
  appState.conn = null;
  appState.matchedWith = null;
  roomChip.textContent = "Bağlı değil";
  setConnectedUI(false);

  // Kuyrukta bekliyorsam sil
  if (!skipQueueCleanup && appState.queueRef && appState.myId) {
    appState.queueRef.transaction((current) => {
      return current === appState.myId ? null : current;
    });
  }

  setStatus("Sohbet kapatıldı.");
  addMsg("Sistem: Sohbet sonlandırıldı.", "sys");
}

// Küçük UX iyileştirmeleri
msgInput.addEventListener("input", () => {
  sendBtn.disabled = !msgInput.value.trim() || (!appState.conn && !appState.ai);
});
