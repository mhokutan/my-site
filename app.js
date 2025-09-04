console.log('App loaded');

// API ve WebSocket
const API = "https://chat-backend-xi60.onrender.com";
const WS_URL = "wss://chat-backend-xi60.onrender.com";
let ws, currentChannel = "#genel";
let token = localStorage.getItem("token");

// WebSocket bağlantısı
function connectWS() {
  ws = new WebSocket(WS_URL);
  ws.onopen = () => console.log('✅ WebSocket bağlantısı kuruldu');
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "message") addMessage(data.user || data.nick, data.text);
  };
  ws.onclose = () => setTimeout(connectWS, 3000);
  ws.onerror = (error) => console.error('❌ WebSocket hatası:', error);
}

// Mesaj ekleme
function addMessage(user, text) {
  const messages = document.getElementById('messages');
  if (messages) {
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    div.innerHTML = `<span class="time">[${time}]</span> <b>${user}:</b> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
}

// Kanal değiştirme
function switchChannel(channelName) {
  currentChannel = channelName;
  const channelHeader = document.getElementById('currentChannel');
  if (channelHeader) channelHeader.textContent = channelName;
  const messages = document.getElementById('messages');
  if (messages) messages.innerHTML = `<div class="info">🚀 ${channelName} kanalına hoş geldiniz!</div>`;
  console.log('📺 Kanal değiştirildi:', channelName);
}

// Kanalları yükle
function loadChannels() {
  const generalChannels = document.getElementById('generalChannels');
  const interestChannels = document.getElementById('interestChannels');
  const sponsorChannels = document.getElementById('sponsorChannels');
  
  // Genel kanallar
  if (generalChannels) {
    generalChannels.innerHTML = '';
    const channels = ['#genel', '#teknoloji', '#spor', '#müzik', '#oyun', '#film', '#kitap', '#sanat'];
    channels.forEach(channel => {
      const div = document.createElement('div');
      div.className = 'channel-item';
      div.textContent = channel;
      div.onclick = () => switchChannel(channel);
      generalChannels.appendChild(div);
    });
  }
  
  // İlgi alanı kanalları
  if (interestChannels) {
    interestChannels.innerHTML = '';
    const interestChannelsList = ['#yapayzeka', '#programlama', '#tasarim', '#fotograf', '#seyahat', '#yemek', '#fitness', '#anime'];
    interestChannelsList.forEach(channel => {
      const div = document.createElement('div');
      div.className = 'channel-item';
      div.textContent = channel;
      div.onclick = () => switchChannel(channel);
      interestChannels.appendChild(div);
    });
  }
  
  // Sponsor kanallar
  if (sponsorChannels) {
    sponsorChannels.innerHTML = '';
    const sponsorChannelsList = ['#heponsigorta', '#technews', '#cryptotalk', '#fitnesspro', '#foodie'];
    sponsorChannelsList.forEach(channel => {
      const div = document.createElement('div');
      div.className = 'channel-item sponsor';
      div.textContent = '💰 ' + channel;
      div.onclick = () => switchChannel(channel);
      sponsorChannels.appendChild(div);
    });
  }
}

// Giriş fonksiyonu
async function doLogin() {
  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;
  
  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({identifier, password})
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data?.error || ("HTTP " + res.status));
    }
    
    token = data.token;
    localStorage.setItem("token", token);
    
    const authStatus = document.getElementById('authStatus');
    if (authStatus) authStatus.textContent = identifier;
    
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove("open");
    
    ws && ws.close();
    connectWS();
    
    alert("Giriş başarılı!");
  } catch (err) {
    alert("Giriş hatası: " + err.message);
  }
}

// Kayıt fonksiyonu
async function doRegister() {
  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;
  
  try {
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({identifier, password})
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      const errorMsg = data?.error === "Var" ? "Bu e-posta adresi zaten kayıtlı" : (data?.error || ("HTTP " + res.status));
      throw new Error(errorMsg);
    }
    
    alert("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
  } catch (err) {
    alert("Kayıt hatası: " + err.message);
  }
}

// Çıkış fonksiyonu
function doLogout() {
  localStorage.removeItem("token");
  token = null;
  location.reload();
}

// Giriş modalı açma
function openLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.classList.add("open");
}

// Giriş modalı kapatma
function closeLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) loginModal.classList.remove("open");
}

// Profil modalı açma
function openProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) profileModal.classList.add("open");
}

// Profil modalı kapatma
function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) profileModal.classList.remove("open");
}

// Lokasyon modalı açma
function openLocationModal() {
  const locationModal = document.getElementById('locationModal');
  if (locationModal) locationModal.classList.add("open");
}

// Lokasyon modalı kapatma
function closeLocationModal() {
  const locationModal = document.getElementById('locationModal');
  if (locationModal) locationModal.classList.remove("open");
}

// Kanal oluşturma modalı açma
function openCreateChannelModal() {
  const createChannelModal = document.getElementById('createChannelModal');
  if (createChannelModal) createChannelModal.classList.add("open");
}

// Kanal oluşturma modalı kapatma
function closeCreateChannelModal() {
  const createChannelModal = document.getElementById('createChannelModal');
  if (createChannelModal) createChannelModal.classList.remove("open");
}

// Rastgele nickname oluştur
function generateRandomNickname() {
  const adjectives = ['Cool', 'Smart', 'Fast', 'Bright', 'Happy', 'Lucky', 'Brave', 'Wise', 'Kind', 'Funny'];
  const nouns = ['Tiger', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Lion', 'Dragon', 'Phoenix', 'Falcon', 'Panther'];
  const numbers = Math.floor(Math.random() * 999) + 1;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  const nickname = `${adjective}${noun}${numbers}`;
  
  const nicknameInput = document.getElementById('userNickname');
  if (nicknameInput) {
    nicknameInput.value = nickname;
  }
  
  return nickname;
}

// Lokasyon seçme
function selectLocation(countryCode, countryName, cityName) {
  const locationData = {
    country: countryName,
    countryCode: countryCode,
    city: cityName
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
  
  alert(`📍 Lokasyon güncellendi: ${cityName}, ${countryName}`);
  closeLocationModal();
}

// Otomatik lokasyon algılama
function autoDetectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Basit lokasyon algılama - gerçek uygulamada API kullanılır
        selectLocation('TR', 'Turkey', 'Istanbul');
      },
      (error) => {
        console.error('Geolocation hatası:', error);
        selectLocation('TR', 'Turkey', 'Istanbul');
      }
    );
  } else {
    selectLocation('TR', 'Turkey', 'Istanbul');
  }
}

// Lokasyon atlama
function skipLocation() {
  closeLocationModal();
}

// İlgi alanları güncelleme
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

// Global fonksiyonlar
window.doLogin = doLogin;
window.doRegister = doRegister;
window.doLogout = doLogout;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.openCreateChannelModal = openCreateChannelModal;
window.closeCreateChannelModal = closeCreateChannelModal;
window.generateRandomNickname = generateRandomNickname;
window.selectLocation = selectLocation;
window.autoDetectLocation = autoDetectLocation;
window.skipLocation = skipLocation;
window.switchChannel = switchChannel;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App başlatılıyor...');
  
  // Event listener'ları ekle
  const btnLogin = document.getElementById('btnLogin');
  const btnProfile = document.getElementById('btnProfile');
  const btnLogout = document.getElementById('btnLogout');
  const btnLocation = document.getElementById('btnLocation');
  const btnSend = document.getElementById('btnSend');
  const messageInput = document.getElementById('messageInput');
  
  if (btnLogin) btnLogin.onclick = openLoginModal;
  if (btnProfile) btnProfile.onclick = openProfileModal;
  if (btnLogout) btnLogout.onclick = doLogout;
  if (btnLocation) btnLocation.onclick = openLocationModal;
  
  if (btnSend) {
    btnSend.onclick = () => {
      const text = messageInput.value.trim();
      if (!text) return;
      
      messageInput.value = '';
      
      // AI yanıtı için
      if (currentChannel === "#heponsigorta") {
        fetch(API + "/sponsor", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({text})
        })
        .then(r => r.json())
        .then(data => {
          if (data.answer) addMessage("HeponBot 🤖", data.answer);
        })
        .catch(() => addMessage("HeponBot 🤖", "Üzgünüm, şu an yanıt veremiyorum."));
      } else {
        // Normal mesaj gönder
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({type: "message", text}));
        } else {
          console.log('⚠️ WebSocket bağlantısı yok, mesaj gönderilemiyor');
          addMessage("Sistem", "Bağlantı kuruluyor, lütfen bekleyin...");
        }
        
        // AI yanıtı için ayrı istek
        setTimeout(() => {
          const channelContext = currentChannel.replace('#', '');
          
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
            channelPrompt = `Sen "${channelContext}" kanalındasın. Bu kanalın konusu: ${channelContext}. Sadece bu konuyla ilgili cevap ver.`;
          }
          
          fetch(API + "/sponsor", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({text: text, channelName: channelContext})
          })
          .then(r => r.json())
          .then(data => {
            if (data.answer && data.answer !== "Şu an yanıt veremiyorum" && data.answer !== "Yanıt yok") {
              addMessage("AI 🤖", data.answer);
            }
          })
          .catch((error) => {
            console.error('AI yanıt hatası:', error);
            addMessage("AI 🤖", "Üzgünüm, şu an yanıt veremiyorum.");
          });
        }, 1000);
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
  if (token) {
    const authStatus = document.getElementById('authStatus');
    if (authStatus) authStatus.textContent = "Giriş yapıldı";
    if (btnLogin) btnLogin.style.display = "none";
    if (btnProfile) btnProfile.style.display = "inline-block";
    if (btnLogout) btnLogout.style.display = "inline-block";
  }
  
  // WebSocket bağlantısını başlat
  connectWS();
  
  // Kanalları yükle
  loadChannels();
  
  // Rastgele nickname oluştur
  generateRandomNickname();
  
  // İlgi alanları event listener'larını ekle
  document.querySelectorAll('.hobby-item-large').forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('selected');
      updateSelectedHobbies();
    });
  });
  
  console.log('✅ App başlatıldı');
});
