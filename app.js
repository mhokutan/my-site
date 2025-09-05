console.log('App loaded');

// API ve WebSocket
const API = "https://chat-backend-xi60.onrender.com";
const WS_URL = "wss://chat-backend-xi60.onrender.com";
let ws, currentChannel = "#genel";
let token = localStorage.getItem("token");

// Temel modal fonksiyonları
function openLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.classList.add('open');
  }
}

function closeLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.classList.remove('open');
  }
}

function openLocationModal() {
  const locationModal = document.getElementById('locationModal');
  if (locationModal) {
    locationModal.classList.add('open');
  }
}

function closeLocationModal() {
  const locationModal = document.getElementById('locationModal');
  if (locationModal) {
    locationModal.classList.remove('open');
  }
}

function doLogout() {
  localStorage.removeItem("token");
  token = null;
  location.reload();
}

// WebSocket bağlantısı
function connectWS() {
  try {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      console.log('✅ WebSocket bağlantısı kuruldu');
      updateConnectionStatus('connected');
    };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") addMessage(data.user || data.nick, data.text);
        else if (data.type === "typing") showTypingIndicator(data.user);
        else if (data.type === "user_joined") updateOnlineUsers(data.user);
        else if (data.type === "user_left") removeOnlineUser(data.user);
        else if (data.type === "dm-message") handleDMMessage(data);
        else if (data.type === "dm-error") handleDMError(data);
      } catch (error) {
        console.error('❌ Mesaj parse hatası:', error);
      }
    };
    ws.onclose = () => {
      console.log('⚠️ WebSocket bağlantısı kesildi, yeniden bağlanılıyor...');
      updateConnectionStatus('disconnected');
      setTimeout(connectWS, 3000);
    };
    ws.onerror = (error) => {
      console.error('❌ WebSocket hatası:', error);
      updateConnectionStatus('error');
    };
  } catch (error) {
    console.error('❌ WebSocket bağlantı hatası:', error);
    updateConnectionStatus('error');
  }
}

// Bağlantı durumu güncelleme
function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connectionStatus');
  if (statusElement) {
    const statusMap = {
      'connected': '🟢 Bağlı',
      'disconnected': '🟡 Bağlantı kesildi',
      'error': '🔴 Bağlantı hatası'
    };
    statusElement.textContent = statusMap[status] || '❓ Bilinmeyen';
  }
}

// Mesaj ekleme
function addMessage(user, text) {
  const messages = document.getElementById('messages');
  if (messages) {
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    div.className = 'message';
    div.innerHTML = `
      <span class="time">[${time}]</span> 
      <span class="username">${user}:</span> 
      <span class="message-text">${text}</span>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
}

// Mesaj gönderme
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  // Mesajı UI'ya ekle
  addMessage('You', message);
  
  // WebSocket ile mesaj gönder
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'message',
      text: message,
      channel: currentChannel
    }));
  }
  
  // Input'u temizle
  messageInput.value = '';
}

// Typing indicator göster
function showTypingIndicator(user) {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.innerHTML = `<span>${user} yazıyor...</span>`;
    typingIndicator.style.display = 'block';
    
    // 3 saniye sonra gizle
    setTimeout(() => {
      typingIndicator.style.display = 'none';
    }, 3000);
  }
}

// Online kullanıcıları güncelle
function updateOnlineUsers(user) {
  const onlineUsers = document.getElementById('onlineUsers');
  if (onlineUsers) {
    // Kullanıcı zaten var mı kontrol et
    const existingUser = onlineUsers.querySelector(`[data-user="${user}"]`);
    if (!existingUser) {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.dataset.user = user;
      div.innerHTML = `
        <div class="user-avatar">👤</div>
        <div class="user-info">
          <div class="user-name">${user}</div>
          <div class="user-activity">#${currentChannel.replace('#', '')} kanalında</div>
        </div>
        <div class="user-status online"></div>
      `;
      onlineUsers.appendChild(div);
    }
  }
}

// Online kullanıcıyı kaldır
function removeOnlineUser(user) {
  const onlineUsers = document.getElementById('onlineUsers');
  if (onlineUsers) {
    const userElement = onlineUsers.querySelector(`[data-user="${user}"]`);
    if (userElement) {
      userElement.remove();
    }
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
  
  // Sponsor kanallar - ülkeye göre
  if (sponsorChannels) {
    sponsorChannels.innerHTML = '';
    const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
    const countryCode = userLocation.countryCode || 'TR';
    const countrySponsors = getCountrySpecificSponsors(countryCode);
    
    countrySponsors.forEach(sponsor => {
      const div = document.createElement('div');
      div.className = 'channel-item sponsor';
      div.innerHTML = `
        <div class="sponsor-info">
          <div class="sponsor-name">💰 ${sponsor.name}</div>
          <div class="sponsor-company">${sponsor.company}</div>
        </div>
      `;
      div.onclick = () => switchChannel(sponsor.name);
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

// Kanal oluşturma
async function createChannel() {
  const channelName = document.getElementById('channelName').value;
  const channelType = document.querySelector('input[name="channelType"]:checked').value;
  const channelPassword = document.getElementById('channelPassword').value;

  if (!channelName) {
    alert('Lütfen kanal adı girin!');
    return;
  }
  
  console.log('Kanal oluşturuluyor:', { channelName, channelType, channelPassword });
  
  try {
    const response = await fetch(API + '/channels/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        name: channelName,
        type: channelType,
        password: channelPassword
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.joined) {
        alert('Bu kanal zaten mevcut! Mevcut kanala katıldınız.');
      } else {
        alert('Kanal başarıyla oluşturuldu!');
      }
      
      // Yeni kanalı listeye ekle
      addChannelToList(channelName, channelType);
      
      // Modal'ı kapat
      closeCreateChannelModal();
      
      // Form'u temizle
      document.getElementById('createChannelForm').reset();
      
      // Oluşturulan kanala otomatik katıl
      if (data.channel) {
        switchChannel(data.channel.name);
      }
    } else {
      alert('Kanal oluşturma hatası: ' + data.error);
    }
  } catch (error) {
    console.error('Kanal oluşturma hatası:', error);
    alert('Kanal oluşturulurken hata oluştu.');
  }
}

// Kanalı listeye ekle
function addChannelToList(channelName, channelType) {
  let targetList;
  
  if (channelType === 'public') {
    targetList = document.getElementById('generalChannels');
  } else {
    targetList = document.getElementById('interestChannels');
  }
  
  if (targetList) {
    const div = document.createElement('div');
    div.className = 'channel-item';
    div.textContent = channelName;
    div.onclick = () => switchChannel(channelName);
    targetList.appendChild(div);
    
    console.log(`📢 Kanal eklendi: ${channelName} -> ${channelType}`);
  }
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

// Ülke seçme (şehir seçimi için)
function selectCountry(countryCode, countryName) {
  const countryInfo = getCountryInfo(countryCode);
  if (!countryInfo || !countryInfo.cities) {
    // Şehir listesi yoksa direkt başkenti seç
    selectLocation(countryCode, countryName, countryInfo.capital);
    return;
  }
  
  // Şehir seçimi modalını göster
  showCitySelectionModal(countryCode, countryName, countryInfo.cities);
}

// Şehir seçimi modalını göster
function showCitySelectionModal(countryCode, countryName, cities) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${countryName} - Şehir Seçin</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="city-search">
          <input type="text" id="citySearch" placeholder="Şehir ara..." onkeyup="filterCities()">
        </div>
        <div class="city-options" id="cityOptions">
          ${cities.map(city => `
            <button class="city-btn" onclick="selectLocation('${countryCode}', '${countryName}', '${city}')">
              ${city}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('open');
}

// Şehir arama
function filterCities() {
  const searchTerm = document.getElementById('citySearch').value.toLowerCase();
  const cityButtons = document.querySelectorAll('.city-btn');
  
  cityButtons.forEach(button => {
    const cityName = button.textContent.toLowerCase();
    if (cityName.includes(searchTerm)) {
      button.style.display = 'block';
    } else {
      button.style.display = 'none';
    }
  });
}

// Lokasyon seçme (final)
function selectLocation(countryCode, countryName, cityName) {
  const locationData = {
    country: countryName,
    countryCode: countryCode,
    city: cityName
  };
  
  localStorage.setItem('userLocation', JSON.stringify(locationData));
  
  // Dil değiştir - country-data.js'den dil bilgisini al
  const countryInfo = getCountryInfo(countryCode);
  const detectedLanguage = countryInfo ? countryInfo.language : 'US';
  
  // Dil değiştirme fonksiyonunu çağır
  if (window.onLocationChange) {
    window.onLocationChange(detectedLanguage);
  } else if (window.changeLanguage) {
    window.changeLanguage(detectedLanguage);
  }
  
  // Sayfayı yenile ki dil değişikliği tam olarak uygulansın
  setTimeout(() => {
    location.reload();
  }, 1000);
  
  // Kanalları yeniden yükle (sponsor kanallar güncellensin)
  loadChannels();
  
  console.log(`🌍 Lokasyon değişti: ${countryCode} -> ${detectedLanguage}`);
  
  alert(`📍 Lokasyon güncellendi: ${cityName}, ${countryName}`);
  closeLocationModal();
  
  // Şehir seçimi modalını kapat
  const cityModal = document.querySelector('.modal');
  if (cityModal) cityModal.remove();
}

// Dinamik ülke butonları oluştur
function generateCountryButtons() {
  const locationOptions = document.querySelector('.location-options');
  if (!locationOptions) return;
  
  // Mevcut butonları temizle
  locationOptions.innerHTML = '';
  
  // Bölgelere göre ülkeleri grupla
  const regions = ['Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];
  
  regions.forEach(region => {
    const countries = getCountriesByRegion(region);
    if (countries.length === 0) return;
    
    // Bölge başlığı
    const regionTitle = document.createElement('h4');
    regionTitle.textContent = getRegionName(region);
    regionTitle.className = 'region-title';
    locationOptions.appendChild(regionTitle);
    
    // Bölgeye ait ülkeler
    countries.slice(0, 8).forEach(country => { // Her bölgeden max 8 ülke
      const button = document.createElement('button');
      button.className = 'location-btn';
      button.innerHTML = `${getCountryFlag(country.code)} ${country.name} - ${country.capital}`;
      button.onclick = () => selectCountry(country.code, country.name);
      locationOptions.appendChild(button);
    });
    
    // Daha fazla butonu
    if (countries.length > 8) {
      const moreButton = document.createElement('button');
      moreButton.className = 'location-btn more-btn';
      moreButton.innerHTML = `➕ ${countries.length - 8} ülke daha...`;
      moreButton.onclick = () => showAllCountries(region);
      locationOptions.appendChild(moreButton);
    }
  });
}

// Bölge adını al
function getRegionName(region) {
  const regionNames = {
    'Europe': '🇪🇺 Avrupa',
    'North America': '🇺🇸 Kuzey Amerika',
    'South America': '🇦🇷 Güney Amerika',
    'Asia': '🌏 Asya',
    'Africa': '🌍 Afrika',
    'Oceania': '🌊 Okyanusya'
  };
  return regionNames[region] || region;
}

// Ülke bayrağı emoji'si al
function getCountryFlag(countryCode) {
  const flagMap = {
    'TR': '🇹🇷', 'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸',
    'IT': '🇮🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴',
    'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬',
    'GR': '🇬🇷', 'HR': '🇭🇷', 'SI': '🇸🇮', 'SK': '🇸🇰', 'LT': '🇱🇹', 'LV': '🇱🇻', 'EE': '🇪🇪',
    'IE': '🇮🇪', 'PT': '🇵🇹', 'LU': '🇱🇺', 'MT': '🇲🇹', 'CY': '🇨🇾', 'IS': '🇮🇸', 'LI': '🇱🇮',
    'MC': '🇲🇨', 'SM': '🇸🇲', 'VA': '🇻🇦', 'AD': '🇦🇩', 'AR': '🇦🇷', 'BR': '🇧🇷', 'CL': '🇨🇱',
    'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴', 'EC': '🇪🇨',
    'GY': '🇬🇾', 'SR': '🇸🇷', 'GF': '🇬🇫', 'FK': '🇫🇰', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳',
    'IN': '🇮🇳', 'ID': '🇮🇩', 'TH': '🇹🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'SG': '🇸🇬', 'PH': '🇵🇭',
    'TW': '🇹🇼', 'HK': '🇭🇰', 'MO': '🇲🇴', 'MN': '🇲🇳', 'KZ': '🇰🇿', 'UZ': '🇺🇿', 'KG': '🇰🇬',
    'TJ': '🇹🇯', 'TM': '🇹🇲', 'AF': '🇦🇫', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'MV': '🇲🇻',
    'NP': '🇳🇵', 'BT': '🇧🇹', 'MM': '🇲🇲', 'LA': '🇱🇦', 'KH': '🇰🇭', 'BN': '🇧🇳', 'TL': '🇹🇱',
    'AU': '🇦🇺', 'NZ': '🇳🇿', 'FJ': '🇫🇯', 'PG': '🇵🇬', 'SB': '🇸🇧', 'VU': '🇻🇺', 'NC': '🇳🇨',
    'PF': '🇵🇫', 'WS': '🇼🇸', 'TO': '🇹🇴', 'KI': '🇰🇮', 'TV': '🇹🇻', 'NR': '🇳🇷', 'PW': '🇵🇼',
    'FM': '🇫🇲', 'MH': '🇲🇭', 'MP': '🇲🇵', 'GU': '🇬🇺', 'AS': '🇦🇸', 'CK': '🇨🇰', 'NU': '🇳🇺',
    'TK': '🇹🇰', 'PN': '🇵🇳', 'NF': '🇳🇫', 'WF': '🇼🇫', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'EG': '🇪🇬',
    'KE': '🇰🇪', 'ET': '🇪🇹', 'GH': '🇬🇭', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿', 'LY': '🇱🇾',
    'SD': '🇸🇩', 'SS': '🇸🇸', 'UG': '🇺🇬', 'TZ': '🇹🇿', 'RW': '🇷🇼', 'BI': '🇧🇮', 'MW': '🇲🇼',
    'ZM': '🇿🇲', 'ZW': '🇿🇼', 'BW': '🇧🇼', 'NA': '🇳🇦', 'SZ': '🇸🇿', 'LS': '🇱🇸', 'MG': '🇲🇬',
    'MU': '🇲🇺', 'SC': '🇸🇨', 'KM': '🇰🇲', 'DJ': '🇩🇯', 'SO': '🇸🇴', 'ER': '🇪🇷', 'CF': '🇨🇫',
    'TD': '🇹🇩', 'CM': '🇨🇲', 'GQ': '🇬🇶', 'GA': '🇬🇦', 'CG': '🇨🇬', 'CD': '🇨🇩', 'AO': '🇦🇴',
    'ST': '🇸🇹', 'CV': '🇨🇻', 'GW': '🇬🇼', 'GN': '🇬🇳', 'SL': '🇸🇱', 'LR': '🇱🇷', 'CI': '🇨🇮',
    'GH': '🇬🇭', 'TG': '🇹🇬', 'BJ': '🇧🇯', 'NE': '🇳🇪', 'BF': '🇧🇫', 'ML': '🇲🇱', 'SN': '🇸🇳',
    'GM': '🇬🇲', 'GM': '🇬🇲', 'GM': '🇬🇲'
  };
  return flagMap[countryCode] || '🏳️';
}

// Tüm ülkeleri göster
function showAllCountries(region) {
  const countries = getCountriesByRegion(region);
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${getRegionName(region)} - Tüm Ülkeler</h2>
        <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="location-options">
          ${countries.map(country => `
            <button class="location-btn" onclick="selectCountry('${country.code}', '${country.name}')">
              ${getCountryFlag(country.code)} ${country.name} - ${country.capital}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('open');
}

// Otomatik lokasyon algılama
function autoDetectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // GPS koordinatlarından ülke belirleme
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Basit koordinat kontrolü (gerçek uygulamada API kullanılmalı)
        if (lat >= 25 && lat <= 49 && lon >= -125 && lon <= -66) {
          // Amerika koordinatları
          selectLocation('US', 'United States', 'New York');
        } else if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) {
          // Türkiye koordinatları
          selectLocation('TR', 'Turkey', 'Istanbul');
        } else if (lat >= 47 && lat <= 55 && lon >= 6 && lon <= 15) {
          // Almanya koordinatları
          selectLocation('DE', 'Germany', 'Berlin');
        } else {
          // Varsayılan olarak Amerika
          selectLocation('US', 'United States', 'New York');
        }
      },
      (error) => {
        console.error('Geolocation hatası:', error);
        // Varsayılan olarak Amerika
        selectLocation('US', 'United States', 'New York');
      }
    );
  } else {
    // Varsayılan olarak Amerika
    selectLocation('US', 'United States', 'New York');
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
  
  // Sayaç güncelle
  const hobbyCount = document.getElementById('hobbyCount');
  if (hobbyCount) {
    hobbyCount.textContent = `(${selectedHobbies.length}/10)`;
  }
  
  // En az 3 ilgi alanı seçildiyse kişisel bilgiler bölümünü göster
  const personalInfoSection = document.getElementById('personalInfoSection');
  if (personalInfoSection) {
    if (selectedHobbies.length >= 3) {
      personalInfoSection.style.display = 'block';
    } else {
      personalInfoSection.style.display = 'none';
    }
  }
  
  // Popüler kanalları güncelle
  updatePopularChannels(selectedHobbies);
  
  console.log('🎯 Seçilen ilgi alanları:', selectedHobbies);
}

// Popüler kanalları güncelle
function updatePopularChannels(selectedHobbies) {
  const interestChannels = document.getElementById('interestChannels');
  if (!interestChannels) return;

  // Eğer hiç ilgi alanı seçilmemişse, boş bırak
  if (!selectedHobbies || selectedHobbies.length === 0) {
    interestChannels.innerHTML = '<div class="empty-channels">🎯 İlgi alanlarınızı seçin, size özel kanallar gelsin!</div>';
    return;
  }

  // İlgi alanlarına göre popüler kanalları oluştur
  const popularChannels = generatePopularChannels(selectedHobbies);
  
  // Mevcut kanalları temizle
  interestChannels.innerHTML = '';
  
  // Popüler kanalları ekle
  popularChannels.forEach(channel => {
    const div = document.createElement('div');
    div.className = 'channel-item popular';
    div.innerHTML = `
      <div class="channel-name">${channel.name}</div>
      <div class="channel-stats">
        <span class="member-count">👥 ${channel.members}</span>
        <span class="activity-level">🔥 ${channel.activity}</span>
      </div>
    `;
    div.onclick = () => switchChannel(channel.name);
    interestChannels.appendChild(div);
  });
  
  console.log('🔥 Popüler kanallar güncellendi:', popularChannels);
}

// Ülkeye göre sponsor kanalları
function getCountrySpecificSponsors(countryCode) {
  const sponsors = {
    'TR': [
      { name: '#heponsigorta', company: 'Hepon Sigorta', description: 'Sigorta ve finansal hizmetler' },
      { name: '#turkcell', company: 'Turkcell', description: 'Telekomünikasyon' },
      { name: '#sahibinden', company: 'Sahibinden', description: 'Emlak ve araç' }
    ],
    'AR': [
      { name: '#mercadolibre', company: 'MercadoLibre', description: 'E-ticaret platformu' },
      { name: '#despegar', company: 'Despegar', description: 'Seyahat ve turizm' },
      { name: '#globant', company: 'Globant', description: 'Yazılım geliştirme' }
    ],
    'JP': [
      { name: '#sony', company: 'Sony', description: 'Elektronik ve eğlence' },
      { name: '#toyota', company: 'Toyota', description: 'Otomotiv' },
      { name: '#nintendo', company: 'Nintendo', description: 'Oyun konsolları' }
    ],
    'KR': [
      { name: '#samsung', company: 'Samsung', description: 'Elektronik ve teknoloji' },
      { name: '#hyundai', company: 'Hyundai', description: 'Otomotiv' },
      { name: '#naver', company: 'Naver', description: 'İnternet servisleri' }
    ],
    'CN': [
      { name: '#alibaba', company: 'Alibaba', description: 'E-ticaret' },
      { name: '#tencent', company: 'Tencent', description: 'Teknoloji ve oyun' },
      { name: '#baidu', company: 'Baidu', description: 'Arama motoru' }
    ],
    'US': [
      { name: '#google', company: 'Google', description: 'Teknoloji ve arama' },
      { name: '#apple', company: 'Apple', description: 'Elektronik ve yazılım' },
      { name: '#microsoft', company: 'Microsoft', description: 'Yazılım ve bulut' }
    ],
    'DE': [
      { name: '#sap', company: 'SAP', description: 'Kurumsal yazılım' },
      { name: '#siemens', company: 'Siemens', description: 'Endüstriyel teknoloji' },
      { name: '#bmw', company: 'BMW', description: 'Otomotiv' }
    ],
    'FR': [
      { name: '#lvmh', company: 'LVMH', description: 'Lüks ürünler' },
      { name: '#total', company: 'Total', description: 'Enerji' },
      { name: '#orange', company: 'Orange', description: 'Telekomünikasyon' }
    ],
    'ES': [
      { name: '#iberdrola', company: 'Iberdrola', description: 'Enerji' },
      { name: '#santander', company: 'Santander', description: 'Bankacılık' },
      { name: '#inditex', company: 'Inditex', description: 'Moda ve tekstil' }
    ],
    // Afrika ülkeleri için sponsor kanallar
    'ZA': [
      { name: '#sasol', company: 'Sasol', description: 'Enerji ve kimya' },
      { name: '#mtn', company: 'MTN', description: 'Telekomünikasyon' },
      { name: '#shoprite', company: 'Shoprite', description: 'Perakende' }
    ],
    'NG': [
      { name: '#dangote', company: 'Dangote Group', description: 'Çimento ve gıda' },
      { name: '#mtn', company: 'MTN Nigeria', description: 'Telekomünikasyon' },
      { name: '#access', company: 'Access Bank', description: 'Bankacılık' }
    ],
    'EG': [
      { name: '#orascom', company: 'Orascom', description: 'Telekomünikasyon' },
      { name: '#cib', company: 'CIB Bank', description: 'Bankacılık' },
      { name: '#elaraby', company: 'El Araby Group', description: 'Elektronik' }
    ],
    'KE': [
      { name: '#safaricom', company: 'Safaricom', description: 'Telekomünikasyon' },
      { name: '#equity', company: 'Equity Bank', description: 'Bankacılık' },
      { name: '#kcb', company: 'KCB Group', description: 'Bankacılık' }
    ],
    'MA': [
      { name: '#attijariwafa', company: 'Attijariwafa Bank', description: 'Bankacılık' },
      { name: '#maroc', company: 'Maroc Telecom', description: 'Telekomünikasyon' },
      { name: '#oncf', company: 'ONCF', description: 'Ulaştırma' }
    ],
    'GH': [
      { name: '#mtn', company: 'MTN Ghana', description: 'Telekomünikasyon' },
      { name: '#ecobank', company: 'Ecobank', description: 'Bankacılık' },
      { name: '#goldfields', company: 'Gold Fields', description: 'Madencilik' }
    ],
    'ET': [
      { name: '#ethio', company: 'Ethio Telecom', description: 'Telekomünikasyon' },
      { name: '#cbe', company: 'Commercial Bank of Ethiopia', description: 'Bankacılık' },
      { name: '#ethiopian', company: 'Ethiopian Airlines', description: 'Havacılık' }
    ],
    'TZ': [
      { name: '#vodacom', company: 'Vodacom Tanzania', description: 'Telekomünikasyon' },
      { name: '#crdb', company: 'CRDB Bank', description: 'Bankacılık' },
      { name: '#tbl', company: 'Tanzania Breweries', description: 'İçecek' }
    ],
    'UG': [
      { name: '#mtn', company: 'MTN Uganda', description: 'Telekomünikasyon' },
      { name: '#centenary', company: 'Centenary Bank', description: 'Bankacılık' },
      { name: '#uganda', company: 'Uganda Airlines', description: 'Havacılık' }
    ],
    'RW': [
      { name: '#mtn', company: 'MTN Rwanda', description: 'Telekomünikasyon' },
      { name: '#bk', company: 'Bank of Kigali', description: 'Bankacılık' },
      { name: '#rwandair', company: 'RwandAir', description: 'Havacılık' }
    ],
    'BW': [
      { name: '#mascom', company: 'Mascom', description: 'Telekomünikasyon' },
      { name: '#fnb', company: 'First National Bank', description: 'Bankacılık' },
      { name: '#debswana', company: 'Debswana', description: 'Madencilik' }
    ],
    'NA': [
      { name: '#mnt', company: 'MTC Namibia', description: 'Telekomünikasyon' },
      { name: '#fnb', company: 'First National Bank', description: 'Bankacılık' },
      { name: '#namdeb', company: 'Namdeb', description: 'Madencilik' }
    ],
    'ZM': [
      { name: '#mtn', company: 'MTN Zambia', description: 'Telekomünikasyon' },
      { name: '#zanaco', company: 'Zanaco', description: 'Bankacılık' },
      { name: '#zccm', company: 'ZCCM-IH', description: 'Madencilik' }
    ],
    'ZW': [
      { name: '#econet', company: 'Econet Wireless', description: 'Telekomünikasyon' },
      { name: '#cbz', company: 'CBZ Bank', description: 'Bankacılık' },
      { name: '#innscor', company: 'Innscor Africa', description: 'Gıda' }
    ],
    'AO': [
      { name: '#unitel', company: 'Unitel', description: 'Telekomünikasyon' },
      { name: '#bca', company: 'Banco BCA', description: 'Bankacılık' },
      { name: '#sonangol', company: 'Sonangol', description: 'Enerji' }
    ],
    'MZ': [
      { name: '#mcel', company: 'MCel', description: 'Telekomünikasyon' },
      { name: '#bci', company: 'BCI Bank', description: 'Bankacılık' },
      { name: '#cahora', company: 'Cahora Bassa', description: 'Enerji' }
    ],
    'MG': [
      { name: '#telma', company: 'Telma', description: 'Telekomünikasyon' },
      { name: '#bfv', company: 'Bank of Africa', description: 'Bankacılık' },
      { name: '#air', company: 'Air Madagascar', description: 'Havacılık' }
    ],
    'MU': [
      { name: '#emtel', company: 'Emtel', description: 'Telekomünikasyon' },
      { name: '#mcb', company: 'MCB Bank', description: 'Bankacılık' },
      { name: '#air', company: 'Air Mauritius', description: 'Havacılık' }
    ],
    'SC': [
      { name: '#cable', company: 'Cable & Wireless', description: 'Telekomünikasyon' },
      { name: '#nouvobanq', company: 'Nouvobanq', description: 'Bankacılık' },
      { name: '#seychelles', company: 'Seychelles Airlines', description: 'Havacılık' }
    ],
    'CM': [
      { name: '#mtn', company: 'MTN Cameroon', description: 'Telekomünikasyon' },
      { name: '#afriland', company: 'Afriland First Bank', description: 'Bankacılık' },
      { name: '#camair', company: 'Camair-Co', description: 'Havacılık' }
    ],
    'CI': [
      { name: '#mtn', company: 'MTN Côte d\'Ivoire', description: 'Telekomünikasyon' },
      { name: '#sgbci', company: 'SGBCI', description: 'Bankacılık' },
      { name: '#air', company: 'Air Côte d\'Ivoire', description: 'Havacılık' }
    ],
    'SN': [
      { name: '#orange', company: 'Orange Senegal', description: 'Telekomünikasyon' },
      { name: '#sgbs', company: 'SGBS', description: 'Bankacılık' },
      { name: '#air', company: 'Air Senegal', description: 'Havacılık' }
    ],
    'ML': [
      { name: '#orange', company: 'Orange Mali', description: 'Telekomünikasyon' },
      { name: '#bmsa', company: 'BM-SA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Mali', description: 'Havacılık' }
    ],
    'BF': [
      { name: '#orange', company: 'Orange Burkina Faso', description: 'Telekomünikasyon' },
      { name: '#coris', company: 'Coris Bank', description: 'Bankacılık' },
      { name: '#air', company: 'Air Burkina', description: 'Havacılık' }
    ],
    'NE': [
      { name: '#moov', company: 'Moov Niger', description: 'Telekomünikasyon' },
      { name: '#bni', company: 'BNI', description: 'Bankacılık' },
      { name: '#air', company: 'Air Niger', description: 'Havacılık' }
    ],
    'TD': [
      { name: '#tigo', company: 'Tigo Chad', description: 'Telekomünikasyon' },
      { name: '#sgbc', company: 'SGBC', description: 'Bankacılık' },
      { name: '#air', company: 'Air Chad', description: 'Havacılık' }
    ],
    'CF': [
      { name: '#orange', company: 'Orange RCA', description: 'Telekomünikasyon' },
      { name: '#bca', company: 'BCA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Centrafrique', description: 'Havacılık' }
    ],
    'CD': [
      { name: '#vodacom', company: 'Vodacom DRC', description: 'Telekomünikasyon' },
      { name: '#rawbank', company: 'Rawbank', description: 'Bankacılık' },
      { name: '#congo', company: 'Congo Airways', description: 'Havacılık' }
    ],
    'CG': [
      { name: '#airtel', company: 'Airtel Congo', description: 'Telekomünikasyon' },
      { name: '#bic', company: 'BIC', description: 'Bankacılık' },
      { name: '#air', company: 'Air Congo', description: 'Havacılık' }
    ],
    'GA': [
      { name: '#airtel', company: 'Airtel Gabon', description: 'Telekomünikasyon' },
      { name: '#bicig', company: 'BICIG', description: 'Bankacılık' },
      { name: '#air', company: 'Air Gabon', description: 'Havacılık' }
    ],
    'GQ': [
      { name: '#getesa', company: 'GETESA', description: 'Telekomünikasyon' },
      { name: '#bange', company: 'BANGE', description: 'Bankacılık' },
      { name: '#ceiba', company: 'Ceiba Intercontinental', description: 'Havacılık' }
    ],
    'ST': [
      { name: '#cst', company: 'CST', description: 'Telekomünikasyon' },
      { name: '#bca', company: 'BCA', description: 'Bankacılık' },
      { name: '#air', company: 'Air São Tomé', description: 'Havacılık' }
    ],
    'CV': [
      { name: '#cvmovel', company: 'CVMóvel', description: 'Telekomünikasyon' },
      { name: '#bca', company: 'BCA', description: 'Bankacılık' },
      { name: '#tacv', company: 'TACV', description: 'Havacılık' }
    ],
    'GW': [
      { name: '#orange', company: 'Orange Guinée-Bissau', description: 'Telekomünikasyon' },
      { name: '#bca', company: 'BCA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Guinée-Bissau', description: 'Havacılık' }
    ],
    'GN': [
      { name: '#orange', company: 'Orange Guinée', description: 'Telekomünikasyon' },
      { name: '#bicigui', company: 'BICIGUI', description: 'Bankacılık' },
      { name: '#air', company: 'Air Guinée', description: 'Havacılık' }
    ],
    'SL': [
      { name: '#orange', company: 'Orange Sierra Leone', description: 'Telekomünikasyon' },
      { name: '#sierra', company: 'Sierra Leone Commercial Bank', description: 'Bankacılık' },
      { name: '#air', company: 'Air Sierra Leone', description: 'Havacılık' }
    ],
    'LR': [
      { name: '#orange', company: 'Orange Liberia', description: 'Telekomünikasyon' },
      { name: '#lbd', company: 'Liberian Bank for Development', description: 'Bankacılık' },
      { name: '#air', company: 'Air Liberia', description: 'Havacılık' }
    ],
    'TG': [
      { name: '#moov', company: 'Moov Togo', description: 'Telekomünikasyon' },
      { name: '#btc', company: 'BTC', description: 'Bankacılık' },
      { name: '#air', company: 'Air Togo', description: 'Havacılık' }
    ],
    'BJ': [
      { name: '#moov', company: 'Moov Bénin', description: 'Telekomünikasyon' },
      { name: '#boa', company: 'BOA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Bénin', description: 'Havacılık' }
    ],
    'DZ': [
      { name: '#mobilis', company: 'Mobilis', description: 'Telekomünikasyon' },
      { name: '#bna', company: 'BNA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Algérie', description: 'Havacılık' }
    ],
    'TN': [
      { name: '#orange', company: 'Orange Tunisie', description: 'Telekomünikasyon' },
      { name: '#biat', company: 'BIAT', description: 'Bankacılık' },
      { name: '#tunisair', company: 'Tunisair', description: 'Havacılık' }
    ],
    'LY': [
      { name: '#libyana', company: 'Libyana', description: 'Telekomünikasyon' },
      { name: '#sahara', company: 'Sahara Bank', description: 'Bankacılık' },
      { name: '#air', company: 'Air Libya', description: 'Havacılık' }
    ],
    'SD': [
      { name: '#zain', company: 'Zain Sudan', description: 'Telekomünikasyon' },
      { name: '#cbos', company: 'CBOS', description: 'Bankacılık' },
      { name: '#air', company: 'Air Sudan', description: 'Havacılık' }
    ],
    'SS': [
      { name: '#zain', company: 'Zain South Sudan', description: 'Telekomünikasyon' },
      { name: '#bss', company: 'BSS', description: 'Bankacılık' },
      { name: '#air', company: 'Air South Sudan', description: 'Havacılık' }
    ],
    'ER': [
      { name: '#eritel', company: 'Eritel', description: 'Telekomünikasyon' },
      { name: '#hbe', company: 'HBE', description: 'Bankacılık' },
      { name: '#air', company: 'Air Eritrea', description: 'Havacılık' }
    ],
    'DJ': [
      { name: '#evatis', company: 'Evatis', description: 'Telekomünikasyon' },
      { name: '#bda', company: 'BDA', description: 'Bankacılık' },
      { name: '#air', company: 'Air Djibouti', description: 'Havacılık' }
    ],
    'SO': [
      { name: '#hormuud', company: 'Hormuud Telecom', description: 'Telekomünikasyon' },
      { name: '#salaam', company: 'Salaam Bank', description: 'Bankacılık' },
      { name: '#air', company: 'Air Somalia', description: 'Havacılık' }
    ],
    'KM': [
      { name: '#comores', company: 'Comores Telecom', description: 'Telekomünikasyon' },
      { name: '#bic', company: 'BIC', description: 'Bankacılık' },
      { name: '#air', company: 'Air Comores', description: 'Havacılık' }
    ],
    'KM': [
      { name: '#comores', company: 'Comores Telecom', description: 'Telekomünikasyon' },
      { name: '#bic', company: 'BIC', description: 'Bankacılık' },
      { name: '#air', company: 'Air Comores', description: 'Havacılık' }
    ]
  };
  
  return sponsors[countryCode] || sponsors['US'];
}

// Popüler kanalları oluştur
function generatePopularChannels(selectedHobbies) {
  const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
  const countryCode = userLocation.countryCode || 'TR';
  
  const channelMap = {
    'teknoloji': [
      { name: '#yapayzeka', members: '1.2K', activity: 'Yüksek' },
      { name: '#programlama', members: '856', activity: 'Orta' },
      { name: '#blockchain', members: '432', activity: 'Düşük' }
    ],
    'spor': [
      { name: '#futbol', members: '2.1K', activity: 'Yüksek' },
      { name: '#fitness', members: '1.5K', activity: 'Yüksek' },
      { name: '#basketbol', members: '678', activity: 'Orta' }
    ],
    'müzik': [
      { name: '#müzik', members: '1.8K', activity: 'Yüksek' },
      { name: '#gitar', members: '945', activity: 'Orta' },
      { name: '#konser', members: '567', activity: 'Düşük' }
    ],
    'oyun': [
      { name: '#oyun', members: '3.2K', activity: 'Yüksek' },
      { name: '#esports', members: '1.1K', activity: 'Yüksek' },
      { name: '#minecraft', members: '789', activity: 'Orta' }
    ],
    'sanat': [
      { name: '#resim', members: '654', activity: 'Orta' },
      { name: '#fotograf', members: '1.3K', activity: 'Yüksek' },
      { name: '#grafik', members: '432', activity: 'Düşük' }
    ],
    'yemek': [
      { name: '#yemek', members: '1.7K', activity: 'Yüksek' },
      { name: '#pisirme', members: '823', activity: 'Orta' },
      { name: '#kahve', members: '456', activity: 'Düşük' }
    ]
  };

  let popularChannels = [];
  
  // Seçilen ilgi alanlarına göre kanalları topla
  selectedHobbies.forEach(hobby => {
    if (channelMap[hobby]) {
      popularChannels = popularChannels.concat(channelMap[hobby]);
    }
  });

  // Eğer hiç ilgi alanı seçilmemişse genel kanalları göster
  if (popularChannels.length === 0) {
    popularChannels = [
      { name: '#genel', members: '5.2K', activity: 'Yüksek' },
      { name: '#teknoloji', members: '2.1K', activity: 'Yüksek' },
      { name: '#spor', members: '1.8K', activity: 'Orta' },
      { name: '#müzik', members: '1.5K', activity: 'Orta' },
      { name: '#oyun', members: '3.2K', activity: 'Yüksek' }
    ];
  }

  // Üyelerine göre sırala (en popüler önce)
  popularChannels.sort((a, b) => {
    const aMembers = parseInt(a.members.replace(/[^\d]/g, ''));
    const bMembers = parseInt(b.members.replace(/[^\d]/g, ''));
    return bMembers - aMembers;
  });

  // En fazla 8 kanal göster
  return popularChannels.slice(0, 8);
}

// İlgi alanı arama
function filterHobbies() {
  const searchTerm = document.getElementById('hobbySearch').value.toLowerCase();
  const hobbyItems = document.querySelectorAll('.hobby-item-large');
  
  hobbyItems.forEach(item => {
    const hobbyText = item.textContent.toLowerCase();
    if (hobbyText.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// İlgi alanı seçim limiti kontrolü
function checkHobbyLimit() {
  const selectedHobbies = document.querySelectorAll('.hobby-item-large.selected');
  if (selectedHobbies.length >= 10) {
    // 10'dan fazla seçim yapılamaz
    return false;
  }
  return true;
}

// DM başlatma
function startDM(username) {
  console.log(`💬 DM başlatılıyor: ${username}`);
  openDMModal();
  if (username) {
    selectDMUser(username);
  }
}

// DM modal açma
function openDMModal() {
  const dmModal = document.getElementById('dmModal');
  if (dmModal) {
    dmModal.classList.add('open');
  }
}

// DM modal kapatma
function closeDMModal() {
  const dmModal = document.getElementById('dmModal');
  if (dmModal) {
    dmModal.classList.remove('open');
  }
}

// DM kullanıcı seçme
function selectDMUser(username) {
  const dmUserName = document.getElementById('dmUserName');
  const dmChatSection = document.getElementById('dmChatSection');
  
  if (dmUserName) {
    dmUserName.textContent = username;
  }
  
  if (dmChatSection) {
    dmChatSection.style.display = 'block';
  }
  
  // DM mesaj geçmişini yükle
  loadDMMessages(username);
  
  console.log(`💬 DM kullanıcısı seçildi: ${username}`);
}

// DM mesajları yükle
async function loadDMMessages(username) {
  const dmMessages = document.getElementById('dmMessages');
  if (!dmMessages) return;

  // Gerçek API'den DM geçmişini al
  try {
    const response = await fetch(API + '/dm/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        userId1: getCurrentUserId(),
        userId2: getUserIdByUsername(username)
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      dmMessages.innerHTML = '';
      data.messages.forEach(msg => {
        const div = document.createElement('div');
        const isOwn = msg.from === getCurrentUserId();
        div.className = `dm-message ${isOwn ? 'own' : 'other'}`;
        div.innerHTML = `
          <div class="dm-message-sender">${isOwn ? 'You' : msg.fromDisplay}</div>
          <div class="dm-message-text">${msg.text}</div>
          <div class="dm-message-time">${formatTime(msg.timestamp)}</div>
        `;
        dmMessages.appendChild(div);
      });
    } else {
      // Hata durumunda örnek mesajlar göster
      showSampleDMMessages(dmMessages, username);
    }
  } catch (error) {
    console.error('DM geçmişi yükleme hatası:', error);
    showSampleDMMessages(dmMessages, username);
  }

  dmMessages.scrollTop = dmMessages.scrollHeight;
}

// Örnek DM mesajları göster
function showSampleDMMessages(dmMessages, username) {
  const sampleMessages = [
    { sender: 'You', message: 'Merhaba!', time: '10:30', own: true },
    { sender: username, message: 'Selam! Nasılsın?', time: '10:31', own: false },
    { sender: 'You', message: 'İyiyim, teşekkürler!', time: '10:32', own: true }
  ];

  dmMessages.innerHTML = '';
  sampleMessages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `dm-message ${msg.own ? 'own' : 'other'}`;
    div.innerHTML = `
      <div class="dm-message-sender">${msg.sender}</div>
      <div class="dm-message-text">${msg.message}</div>
      <div class="dm-message-time">${msg.time}</div>
    `;
    dmMessages.appendChild(div);
  });
}

// DM kullanıcı arama
function searchUsers() {
  const searchTerm = document.getElementById('dmUserSearch').value.toLowerCase();
  const userItems = document.querySelectorAll('.dm-user-item');
  
  userItems.forEach(item => {
    const userName = item.querySelector('.dm-user-name').textContent.toLowerCase();
    if (userName.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// DM mesaj gönderme
async function sendDMMessage() {
  const messageInput = document.getElementById('dmMessageInput');
  const message = messageInput.value.trim();
  
  if (!message) return;
  
  const dmMessages = document.getElementById('dmMessages');
  const dmUserName = document.getElementById('dmUserName').textContent;
  
  // Yeni mesaj ekle
  const div = document.createElement('div');
  div.className = 'dm-message own';
  const time = new Date().toLocaleTimeString();
  div.innerHTML = `
    <div class="dm-message-sender">You</div>
    <div class="dm-message-text">${message}</div>
    <div class="dm-message-time">${time}</div>
  `;
  dmMessages.appendChild(div);
  
  // Input'u temizle
  messageInput.value = '';
  
  // Scroll'u en alta kaydır
  dmMessages.scrollTop = dmMessages.scrollHeight;
  
  // WebSocket ile DM mesajını gönder
  if (ws && ws.readyState === WebSocket.OPEN) {
    const dmData = {
      type: 'dm',
      toUid: getUserIdByUsername(dmUserName),
      text: message
    };
    ws.send(JSON.stringify(dmData));
  }
  
  console.log(`💬 DM mesaj gönderildi: ${message}`);
}

// Eksik yardımcı fonksiyonlar
function getCurrentUserId() {
  return localStorage.getItem('userId') || 'anonymous';
}

function getUserIdByUsername(username) {
  // Bu fonksiyon gerçek implementasyonda kullanıcı listesinden ID döndürmeli
  return username.toLowerCase().replace(/\s+/g, '_');
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Profil modal fonksiyonları
function openProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.add('open');
  }
}

function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  if (profileModal) {
    profileModal.classList.remove('open');
  }
}

// Kanal modal fonksiyonları
function openCreateChannelModal() {
  const channelModal = document.getElementById('createChannelModal');
  if (channelModal) {
    channelModal.classList.add('open');
  }
}

function closeCreateChannelModal() {
  const channelModal = document.getElementById('createChannelModal');
  if (channelModal) {
    channelModal.classList.remove('open');
  }
}

// Kanal değiştirme
function switchChannel(channelName) {
  console.log('Kanal değiştiriliyor:', channelName);
  currentChannel = channelName;
  
  // Kanal başlığını güncelle
  const channelTitle = document.getElementById('channelTitle');
  if (channelTitle) {
    channelTitle.textContent = channelName;
  }
  
  // Mesajları temizle
  const messages = document.getElementById('messages');
  if (messages) {
    messages.innerHTML = `<div class="info">🚀 ${channelName} kanalına hoş geldiniz!</div>`;
  }
  
  // WebSocket ile kanal değiştir
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'join',
      channel: channelName
    }));
  }
}

// DM mesaj handler'ları
function handleDMMessage(data) {
  const dmMessages = document.getElementById('dmMessages');
  if (!dmMessages) return;
  
  const div = document.createElement('div');
  const isOwn = data.from === getCurrentUserId();
  div.className = `dm-message ${isOwn ? 'own' : 'other'}`;
  div.innerHTML = `
    <div class="dm-message-sender">${isOwn ? 'You' : data.fromDisplay}</div>
    <div class="dm-message-text">${data.text}</div>
    <div class="dm-message-time">${formatTime(data.timestamp)}</div>
  `;
  dmMessages.appendChild(div);
  dmMessages.scrollTop = dmMessages.scrollHeight;
}

function handleDMError(data) {
  console.error('DM Hatası:', data.message);
  // Kullanıcıya hata mesajı göster
  const dmMessages = document.getElementById('dmMessages');
  if (dmMessages) {
    const div = document.createElement('div');
    div.className = 'dm-message error';
    div.innerHTML = `
      <div class="dm-message-text">❌ ${data.message}</div>
    `;
    dmMessages.appendChild(div);
    dmMessages.scrollTop = dmMessages.scrollHeight;
  }
}

// Arkadaş ekle modal açma
function openAddFriendModal() {
  const addFriendModal = document.getElementById('addFriendModal');
  if (addFriendModal) {
    addFriendModal.classList.add('open');
  }
}

// Arkadaş ekle modal kapatma
function closeAddFriendModal() {
  const addFriendModal = document.getElementById('addFriendModal');
  if (addFriendModal) {
    addFriendModal.classList.remove('open');
  }
}

// Kullanıcı arama (arkadaş ekleme için)
function searchUsersForAdd() {
  const searchTerm = document.getElementById('addFriendSearch').value.toLowerCase();
  const searchResults = document.getElementById('searchResults');
  
  if (!searchTerm) {
    searchResults.innerHTML = '';
    return;
  }
  
  // Örnek kullanıcılar
  const sampleUsers = [
    { name: 'TechGuru2024', email: 'tech@example.com', status: 'online' },
    { name: 'ArtLover99', email: 'art@example.com', status: 'away' },
    { name: 'MusicFan123', email: 'music@example.com', status: 'offline' },
    { name: 'GameMaster456', email: 'game@example.com', status: 'online' },
    { name: 'TravelBug789', email: 'travel@example.com', status: 'away' }
  ];
  
  const filteredUsers = sampleUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm) || 
    user.email.toLowerCase().includes(searchTerm)
  );
  
  searchResults.innerHTML = '';
  filteredUsers.forEach(user => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
      <div class="user-avatar">👤</div>
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-email">${user.email}</div>
      </div>
      <div class="user-status ${user.status}"></div>
      <button class="btn btn-sm btn-primary" onclick="addFriend('${user.name}')">➕ Ekle</button>
    `;
    searchResults.appendChild(div);
  });
}

// Arkadaş ekleme
async function addFriend(username) {
  console.log(`👥 Arkadaş ekleniyor: ${username}`);
  
  try {
    // Backend'e arkadaş ekleme isteği gönder
    const response = await fetch(API + '/user/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        targetUserId: username
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Arkadaş listesine ekle
      const friendsList = document.getElementById('friendsList');
      if (friendsList) {
        const div = document.createElement('div');
        div.className = 'friend-item';
        div.innerHTML = `
          <div class="friend-avatar">👤</div>
          <div class="friend-info">
            <div class="friend-name">${username}</div>
            <div class="friend-status online">Çevrimiçi</div>
          </div>
          <div class="friend-actions">
            <button class="btn-icon" onclick="startDM('${username}')" title="DM">💬</button>
            <button class="btn-icon" onclick="toggleFollow('${username}')" title="Takip Et">👥</button>
          </div>
        `;
        friendsList.appendChild(div);
      }
      
      alert('Arkadaş başarıyla eklendi!');
      closeAddFriendModal();
    } else {
      alert('Arkadaş eklenemedi: ' + (data.error || 'Bilinmeyen hata'));
    }
  } catch (error) {
    console.error('Arkadaş ekleme hatası:', error);
    alert('Arkadaş eklenirken hata oluştu.');
  }
}

// E-posta daveti gönderme
function sendInvite() {
  const email = document.getElementById('inviteEmail').value.trim();
  
  if (!email) {
    alert('Lütfen e-posta adresi girin!');
    return;
  }
  
  console.log(`📧 Davet gönderiliyor: ${email}`);
  alert(`📧 ${email} adresine davet gönderildi!`);
  
  // Input'u temizle
  document.getElementById('inviteEmail').value = '';
}

// Davet linkini kopyalama
function copyInviteLink() {
  const inviteLink = document.getElementById('inviteLink');
  inviteLink.select();
  document.execCommand('copy');
  alert('🔗 Davet linki kopyalandı!');
}

// Takip etme/takibi bırakma
function toggleFollow(username) {
  console.log(`👥 Takip durumu değiştiriliyor: ${username}`);
  // Takip durumunu değiştir
  alert(`👥 ${username} takip durumu değiştiriliyor...`);
}

// Online kullanıcıları güncelle
function updateOnlineUsers() {
  // WebSocket'ten online kullanıcıları al ve güncelle
  console.log('🟢 Online kullanıcılar güncelleniyor...');
}

// Son aktiviteleri güncelle
function updateRecentActivities() {
  // Son aktiviteleri al ve güncelle
  console.log('📈 Son aktiviteler güncelleniyor...');
}

// İstatistikleri güncelle
function updateStats() {
  // İstatistikleri al ve güncelle
  console.log('📊 İstatistikler güncelleniyor...');
}

// Donate modal açma
function openDonateModal() {
  const donateModal = document.getElementById('donateModal');
  if (donateModal) {
    donateModal.classList.add('open');
    // Event listener'ları ekle
    setupDonateEventListeners();
  }
}

// Donate modal kapatma
function closeDonateModal() {
  const donateModal = document.getElementById('donateModal');
  if (donateModal) {
    donateModal.classList.remove('open');
  }
}

// Donate event listener'larını kur
function setupDonateEventListeners() {
  // Bağış seçenekleri
  document.querySelectorAll('.donate-option').forEach(option => {
    option.addEventListener('click', function() {
      // Önceki seçimi kaldır
      document.querySelectorAll('.donate-option').forEach(opt => opt.classList.remove('selected'));
      // Yeni seçimi işaretle
      this.classList.add('selected');
      
      // Özel miktar seçildiyse input'u göster
      if (this.dataset.amount === 'custom') {
        document.getElementById('customAmount').style.display = 'block';
    } else {
        document.getElementById('customAmount').style.display = 'none';
      }
    });
  });

  // Ödeme yöntemleri
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
      // Önceki seçimi kaldır
      document.querySelectorAll('.payment-method').forEach(meth => meth.classList.remove('active'));
      // Yeni seçimi işaretle
      this.classList.add('active');
    });
  });
}

// Bağış işleme
function processDonation() {
  const selectedOption = document.querySelector('.donate-option.selected');
  const selectedMethod = document.querySelector('.payment-method.active');
  const customAmount = document.getElementById('customAmount').value;
  const message = document.getElementById('donateMessage').value;

  if (!selectedOption) {
    alert('Lütfen bir bağış miktarı seçin!');
    return;
  }
  
  if (!selectedMethod) {
    alert('Lütfen bir ödeme yöntemi seçin!');
    return;
  }
  
  let amount = selectedOption.dataset.amount;
  if (amount === 'custom') {
    if (!customAmount || customAmount < 1) {
      alert('Lütfen geçerli bir miktar girin!');
      return;
    }
    amount = customAmount;
  }

  const paymentMethod = selectedMethod.dataset.method;
  
  console.log('💰 Bağış işlemi:', {
    amount: amount + '₺',
    method: paymentMethod,
    message: message
  });

  // Bağış işlemini simüle et
  alert(`💰 ${amount}₺ bağış ${paymentMethod} ile işleniyor...\n\nMesaj: ${message || 'Mesaj yok'}`);
  
  // Modal'ı kapat
  closeDonateModal();
  
  // Form'u temizle
  document.querySelectorAll('.donate-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('.payment-method').forEach(meth => meth.classList.remove('active'));
  document.querySelector('.payment-method[data-method="card"]').classList.add('active');
  document.getElementById('customAmount').value = '';
  document.getElementById('donateMessage').value = '';
}

// Sponsor kanal modal açma
function openSponsorChannelModal() {
  const sponsorModal = document.getElementById('sponsorChannelModal');
  if (sponsorModal) {
    sponsorModal.classList.add('open');
    // Event listener'ları ekle
    setupSponsorChannelEventListeners();
  }
}

// Sponsor kanal modal kapatma
function closeSponsorChannelModal() {
  const sponsorModal = document.getElementById('sponsorChannelModal');
  if (sponsorModal) {
    sponsorModal.classList.remove('open');
  }
}

// Sponsor kanal event listener'larını kur
function setupSponsorChannelEventListeners() {
  // Fiyatlandırma seçenekleri
  document.querySelectorAll('.pricing-option').forEach(option => {
    option.addEventListener('click', function() {
      // Önceki seçimi kaldır
      document.querySelectorAll('.pricing-option').forEach(opt => opt.classList.remove('selected'));
      // Yeni seçimi işaretle
      this.classList.add('selected');
    });
  });
}

// Sponsor kanal oluşturma
function createSponsorChannel() {
  const channelName = document.getElementById('sponsorChannelName').value;
  const company = document.getElementById('sponsorCompany').value;
  const description = document.getElementById('sponsorDescription').value;
  const website = document.getElementById('sponsorWebsite').value;
  const selectedPricing = document.querySelector('.pricing-option.selected');
  const visualOptions = Array.from(document.querySelectorAll('input[name="visual[]"]:checked'))
    .map(checkbox => checkbox.value);

  if (!channelName || !company) {
    alert('Lütfen kanal adı ve şirket adını girin!');
    return;
  }

  if (!selectedPricing) {
    alert('Lütfen bir fiyatlandırma seçeneği seçin!');
    return;
  }

  const duration = selectedPricing.dataset.duration;
  const price = selectedPricing.dataset.price;

  console.log('💼 Sponsor kanal oluşturuluyor:', {
    channelName,
    company,
    description,
    website,
    duration: duration + ' gün',
    price: price + '₺',
    visualOptions
  });

  // Sponsor kanal oluşturma işlemini simüle et
  alert(`💼 Sponsor kanal oluşturuluyor!\n\nKanal: ${channelName}\nŞirket: ${company}\nSüre: ${duration} gün\nFiyat: ${price}₺\n\nGörsel özellikler: ${visualOptions.join(', ') || 'Yok'}`);
  
  // Modal'ı kapat
  closeSponsorChannelModal();
  
  // Form'u temizle
  document.getElementById('sponsorChannelForm').reset();
  document.querySelectorAll('.pricing-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelectorAll('input[name="visual[]"]').forEach(checkbox => checkbox.checked = false);
}

// Ayarlar modal açma
function openSettingsModal() {
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    settingsModal.classList.add('open');
    loadSettings();
  }
}

// Ayarlar modal kapatma
function closeSettingsModal() {
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal) {
    settingsModal.classList.remove('open');
  }
}

// Ayarları yükle
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  
  // Lokasyon ayarları
  if (settings.autoLocation !== undefined) {
    document.getElementById('autoLocation').checked = settings.autoLocation;
  }
  if (settings.manualLocation) {
    document.getElementById('manualLocation').value = settings.manualLocation;
  }
  
  // Chat ayarları
  if (settings.soundNotifications !== undefined) {
    document.getElementById('soundNotifications').checked = settings.soundNotifications;
  }
  if (settings.messageHistory) {
    document.getElementById('messageHistory').value = settings.messageHistory;
  }
  
  // Görünüm ayarları
  if (settings.theme) {
    document.getElementById('theme').value = settings.theme;
  }
  if (settings.fontSize) {
    document.getElementById('fontSize').value = settings.fontSize;
  }
  
  // Gizlilik ayarları
  if (settings.showOnlineStatus !== undefined) {
    document.getElementById('showOnlineStatus').checked = settings.showOnlineStatus;
  }
  if (settings.allowDMs !== undefined) {
    document.getElementById('allowDMs').checked = settings.allowDMs;
  }
}

// Ayarları kaydet
function saveSettings() {
  const settings = {
    autoLocation: document.getElementById('autoLocation').checked,
    manualLocation: document.getElementById('manualLocation').value,
    soundNotifications: document.getElementById('soundNotifications').checked,
    messageHistory: document.getElementById('messageHistory').value,
    theme: document.getElementById('theme').value,
    fontSize: document.getElementById('fontSize').value,
    showOnlineStatus: document.getElementById('showOnlineStatus').checked,
    allowDMs: document.getElementById('allowDMs').checked
  };
  
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  // Ayarları uygula
  applySettings(settings);
  
  alert('✅ Ayarlar kaydedildi!');
  closeSettingsModal();
}

// Ayarları uygula
function applySettings(settings) {
  // Tema uygula
  if (settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  // Yazı boyutu uygula
  const fontSizeMap = {
    'small': '0.8rem',
    'medium': '1rem',
    'large': '1.2rem'
  };
  document.documentElement.style.fontSize = fontSizeMap[settings.fontSize] || '1rem';
  
  // Lokasyon ayarlarını uygula
  if (!settings.autoLocation && settings.manualLocation) {
    selectLocation(settings.manualLocation, getCountryName(settings.manualLocation), 'Unknown');
  }
  
  console.log('⚙️ Ayarlar uygulandı:', settings);
}

// Ülke kodundan ülke adını al
function getCountryName(countryCode) {
  const countryMap = {
    'TR': 'Turkey',
    'US': 'United States',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain'
  };
  return countryMap[countryCode] || 'Unknown';
}

// Hobileri yükle
function loadHobbies() {
  const hobbyGrid = document.getElementById('hobbyGrid');
  if (!hobbyGrid) return;

  const hobbies = [
    // Teknoloji
    { name: 'Teknoloji', emoji: '💻', category: 'tech' },
    { name: 'Programlama', emoji: '💻', category: 'tech' },
    { name: 'Yapay Zeka', emoji: '🤖', category: 'tech' },
    { name: 'Blockchain', emoji: '⛓️', category: 'tech' },
    { name: 'Siber Güvenlik', emoji: '🔒', category: 'tech' },
    { name: 'Robotik', emoji: '🤖', category: 'tech' },
    { name: 'IoT', emoji: '🌐', category: 'tech' },
    { name: 'Cloud', emoji: '☁️', category: 'tech' },
    { name: 'AI', emoji: '🧠', category: 'tech' },
    { name: 'Veri Bilimi', emoji: '📊', category: 'tech' },
    
    // Spor
    { name: 'Futbol', emoji: '⚽', category: 'sport' },
    { name: 'Basketbol', emoji: '🏀', category: 'sport' },
    { name: 'Tenis', emoji: '🎾', category: 'sport' },
    { name: 'Yüzme', emoji: '🏊', category: 'sport' },
    { name: 'Koşu', emoji: '🏃', category: 'sport' },
    { name: 'Fitness', emoji: '💪', category: 'sport' },
    { name: 'Yoga', emoji: '🧘', category: 'sport' },
    { name: 'Pilates', emoji: '🤸', category: 'sport' },
    { name: 'CrossFit', emoji: '🏋️', category: 'sport' },
    { name: 'Dans', emoji: '💃', category: 'sport' },
    { name: 'Boks', emoji: '🥊', category: 'sport' },
    { name: 'Kayak', emoji: '🎿', category: 'sport' },
    { name: 'Surf', emoji: '🏄', category: 'sport' },
    { name: 'Tırmanış', emoji: '🧗', category: 'sport' },
    { name: 'Bisiklet', emoji: '🚴', category: 'sport' },
    { name: 'Golf', emoji: '⛳', category: 'sport' },
    { name: 'Satranç', emoji: '♟️', category: 'sport' },
    
    // Müzik
    { name: 'Müzik', emoji: '🎵', category: 'music' },
    { name: 'Gitar', emoji: '🎸', category: 'music' },
    { name: 'Piyano', emoji: '🎹', category: 'music' },
    { name: 'Davul', emoji: '🥁', category: 'music' },
    { name: 'Keman', emoji: '🎻', category: 'music' },
    { name: 'Saksofon', emoji: '🎷', category: 'music' },
    { name: 'DJ', emoji: '🎧', category: 'music' },
    { name: 'Konser', emoji: '🎤', category: 'music' },
    { name: 'Opera', emoji: '🎭', category: 'music' },
    { name: 'Jazz', emoji: '🎷', category: 'music' },
    { name: 'Rock', emoji: '🎸', category: 'music' },
    { name: 'Pop', emoji: '🎤', category: 'music' },
    { name: 'Klasik', emoji: '🎼', category: 'music' },
    { name: 'Elektronik', emoji: '🎛️', category: 'music' },
    { name: 'Hip Hop', emoji: '🎤', category: 'music' },
    { name: 'Reggae', emoji: '🎵', category: 'music' },
    
    // Sanat
    { name: 'Resim', emoji: '🎨', category: 'art' },
    { name: 'Heykel', emoji: '🗿', category: 'art' },
    { name: 'Fotoğraf', emoji: '📸', category: 'art' },
    { name: 'Video', emoji: '🎥', category: 'art' },
    { name: 'Grafik', emoji: '🎨', category: 'art' },
    { name: 'Web Tasarım', emoji: '🌐', category: 'art' },
    { name: 'UI/UX', emoji: '📱', category: 'art' },
    { name: 'Animasyon', emoji: '🎬', category: 'art' },
    { name: '3D', emoji: '🎮', category: 'art' },
    { name: 'El İşi', emoji: '🧵', category: 'art' },
    { name: 'Origami', emoji: '📄', category: 'art' },
    { name: 'Kaligrafi', emoji: '✍️', category: 'art' },
    { name: 'Dövme', emoji: '🖋️', category: 'art' },
    { name: 'Mimari', emoji: '🏗️', category: 'art' },
    { name: 'İç Mimari', emoji: '🏠', category: 'art' },
    
    // Eğlence
    { name: 'Film', emoji: '🎬', category: 'entertainment' },
    { name: 'Dizi', emoji: '📺', category: 'entertainment' },
    { name: 'Anime', emoji: '🎌', category: 'entertainment' },
    { name: 'Manga', emoji: '📚', category: 'entertainment' },
    { name: 'Kitap', emoji: '📖', category: 'entertainment' },
    { name: 'Roman', emoji: '📚', category: 'entertainment' },
    { name: 'Şiir', emoji: '📝', category: 'entertainment' },
    { name: 'Tiyatro', emoji: '🎭', category: 'entertainment' },
    { name: 'Stand-up', emoji: '🎤', category: 'entertainment' },
    { name: 'Podcast', emoji: '🎧', category: 'entertainment' },
    { name: 'YouTube', emoji: '📺', category: 'entertainment' },
    { name: 'Twitch', emoji: '🎮', category: 'entertainment' },
    { name: 'Netflix', emoji: '📺', category: 'entertainment' },
    { name: 'Disney+', emoji: '🏰', category: 'entertainment' },
    { name: 'Prime Video', emoji: '📺', category: 'entertainment' },
    
    // Oyun
    { name: 'Oyun', emoji: '🎮', category: 'gaming' },
    { name: 'PC', emoji: '💻', category: 'gaming' },
    { name: 'PlayStation', emoji: '🎮', category: 'gaming' },
    { name: 'Xbox', emoji: '🎮', category: 'gaming' },
    { name: 'Nintendo', emoji: '🎮', category: 'gaming' },
    { name: 'Mobil', emoji: '📱', category: 'gaming' },
    { name: 'VR', emoji: '🥽', category: 'gaming' },
    { name: 'E-Spor', emoji: '🏆', category: 'gaming' },
    { name: 'LoL', emoji: '⚔️', category: 'gaming' },
    { name: 'CS:GO', emoji: '🔫', category: 'gaming' },
    { name: 'Valorant', emoji: '🎯', category: 'gaming' },
    { name: 'Fortnite', emoji: '🏗️', category: 'gaming' },
    { name: 'Minecraft', emoji: '⛏️', category: 'gaming' },
    { name: 'Among Us', emoji: '👨‍🚀', category: 'gaming' },
    { name: 'Board Games', emoji: '🎲', category: 'gaming' },
    { name: 'Puzzle', emoji: '🧩', category: 'gaming' },
    { name: 'RPG', emoji: '⚔️', category: 'gaming' },
    { name: 'FPS', emoji: '🔫', category: 'gaming' },
    { name: 'Strateji', emoji: '🏰', category: 'gaming' },
    { name: 'Yarış', emoji: '🏎️', category: 'gaming' },
    
    // Yaşam Tarzı
    { name: 'Yemek', emoji: '🍕', category: 'lifestyle' },
    { name: 'Pişirme', emoji: '👨‍🍳', category: 'lifestyle' },
    { name: 'Kahve', emoji: '☕', category: 'lifestyle' },
    { name: 'Çay', emoji: '🍵', category: 'lifestyle' },
    { name: 'Alkol', emoji: '🍷', category: 'lifestyle' },
    { name: 'Kokteyl', emoji: '🍸', category: 'lifestyle' },
    { name: 'Moda', emoji: '👗', category: 'lifestyle' },
    { name: 'Makyaj', emoji: '💄', category: 'lifestyle' },
    { name: 'Saç', emoji: '💇', category: 'lifestyle' },
    { name: 'Cilt Bakımı', emoji: '🧴', category: 'lifestyle' },
    { name: 'Parfüm', emoji: '🌸', category: 'lifestyle' },
    { name: 'Ev Dekorasyonu', emoji: '🏠', category: 'lifestyle' },
    { name: 'Bahçıvanlık', emoji: '🌱', category: 'lifestyle' },
    { name: 'Bitki', emoji: '🌿', category: 'lifestyle' },
    { name: 'Hayvan', emoji: '🐕', category: 'lifestyle' },
    { name: 'Koleksiyon', emoji: '📦', category: 'lifestyle' },
    { name: 'Antika', emoji: '🏺', category: 'lifestyle' },
    { name: 'Vintage', emoji: '📻', category: 'lifestyle' },
    { name: 'Minimalizm', emoji: '🧘', category: 'lifestyle' },
    { name: 'Sıfır Atık', emoji: '♻️', category: 'lifestyle' },
    
    // Seyahat
    { name: 'Seyahat', emoji: '✈️', category: 'travel' },
    { name: 'Kamp', emoji: '🏕️', category: 'travel' },
    { name: 'Trekking', emoji: '🥾', category: 'travel' },
    { name: 'Hiking', emoji: '🥾', category: 'travel' },
    { name: 'Backpacking', emoji: '🎒', category: 'travel' },
    { name: 'Cruise', emoji: '🚢', category: 'travel' },
    { name: 'Road Trip', emoji: '🛣️', category: 'travel' },
    { name: 'City Break', emoji: '🏙️', category: 'travel' },
    { name: 'Plaj', emoji: '🏖️', category: 'travel' },
    { name: 'Dağ', emoji: '🏔️', category: 'travel' },
    { name: 'Çöl', emoji: '🏜️', category: 'travel' },
    { name: 'Orman', emoji: '🌴', category: 'travel' },
    { name: 'Ada', emoji: '🏝️', category: 'travel' },
    { name: 'Kültür', emoji: '🏛️', category: 'travel' },
    { name: 'Tarih', emoji: '🏺', category: 'travel' },
    { name: 'Müze', emoji: '🏛️', category: 'travel' },
    { name: 'Festival', emoji: '🎪', category: 'travel' },
    { name: 'Konser', emoji: '🎤', category: 'travel' },
    { name: 'Gastronomi', emoji: '🍽️', category: 'travel' },
    { name: 'Şarap', emoji: '🍷', category: 'travel' },
    
    // Eğitim
    { name: 'Dil Öğrenme', emoji: '🗣️', category: 'education' },
    { name: 'İngilizce', emoji: '🇺🇸', category: 'education' },
    { name: 'Almanca', emoji: '🇩🇪', category: 'education' },
    { name: 'Fransızca', emoji: '🇫🇷', category: 'education' },
    { name: 'İspanyolca', emoji: '🇪🇸', category: 'education' },
    { name: 'Japonca', emoji: '🇯🇵', category: 'education' },
    { name: 'Korece', emoji: '🇰🇷', category: 'education' },
    { name: 'Arapça', emoji: '🇸🇦', category: 'education' },
    { name: 'Çince', emoji: '🇨🇳', category: 'education' },
    { name: 'Rusça', emoji: '🇷🇺', category: 'education' },
    { name: 'Matematik', emoji: '📐', category: 'education' },
    { name: 'Fizik', emoji: '⚛️', category: 'education' },
    { name: 'Kimya', emoji: '🧪', category: 'education' },
    { name: 'Biyoloji', emoji: '🧬', category: 'education' },
    { name: 'Tarih', emoji: '📚', category: 'education' },
    { name: 'Coğrafya', emoji: '🌍', category: 'education' },
    { name: 'Felsefe', emoji: '🤔', category: 'education' },
    { name: 'Psikoloji', emoji: '🧠', category: 'education' },
    { name: 'Sosyoloji', emoji: '👥', category: 'education' },
    { name: 'Ekonomi', emoji: '💰', category: 'education' },
    
    // Sağlık
    { name: 'Meditasyon', emoji: '🧘', category: 'health' },
    { name: 'Mindfulness', emoji: '🧠', category: 'health' },
    { name: 'Nefes', emoji: '🫁', category: 'health' },
    { name: 'Masaj', emoji: '💆', category: 'health' },
    { name: 'Akupunktur', emoji: '🪡', category: 'health' },
    { name: 'Homeopati', emoji: '🌿', category: 'health' },
    { name: 'Aromaterapi', emoji: '🕯️', category: 'health' },
    { name: 'Refleksoloji', emoji: '🦶', category: 'health' },
    { name: 'Reiki', emoji: '✨', category: 'health' },
    { name: 'Kristal', emoji: '💎', category: 'health' },
    { name: 'Astroloji', emoji: '🔮', category: 'health' },
    { name: 'Tarot', emoji: '🃏', category: 'health' },
    { name: 'Numeroloji', emoji: '🔢', category: 'health' },
    { name: 'Feng Shui', emoji: '🏠', category: 'health' },
    { name: 'Vegan', emoji: '🌱', category: 'health' },
    { name: 'Vejetaryen', emoji: '🥬', category: 'health' },
    { name: 'Keto', emoji: '🥑', category: 'health' },
    { name: 'Paleo', emoji: '🥩', category: 'health' },
    { name: 'Intermittent', emoji: '⏰', category: 'health' },
    { name: 'Detox', emoji: '🧘', category: 'health' },
    
    // İş
    { name: 'Girişimcilik', emoji: '🚀', category: 'business' },
    { name: 'Yatırım', emoji: '📈', category: 'business' },
    { name: 'Kripto', emoji: '₿', category: 'business' },
    { name: 'Forex', emoji: '💱', category: 'business' },
    { name: 'Borsa', emoji: '📊', category: 'business' },
    { name: 'Emlak', emoji: '🏠', category: 'business' },
    { name: 'Pazarlama', emoji: '📢', category: 'business' },
    { name: 'Satış', emoji: '💼', category: 'business' },
    { name: 'İK', emoji: '👥', category: 'business' },
    { name: 'Finans', emoji: '💰', category: 'business' },
    { name: 'Muhasebe', emoji: '📊', category: 'business' },
    { name: 'Danışmanlık', emoji: '💡', category: 'business' },
    { name: 'Koçluk', emoji: '🎯', category: 'business' },
    { name: 'Mentorluk', emoji: '👨‍🏫', category: 'business' },
    { name: 'Networking', emoji: '🤝', category: 'business' },
    { name: 'Konuşma', emoji: '🎤', category: 'business' },
    { name: 'Yazarlık', emoji: '✍️', category: 'business' },
    { name: 'Blogging', emoji: '📝', category: 'business' },
    { name: 'Vlogging', emoji: '📹', category: 'business' },
    { name: 'Influencer', emoji: '⭐', category: 'business' }
  ];

  // Hobileri grid'e ekle
  hobbies.forEach(hobby => {
    const div = document.createElement('div');
    div.className = 'hobby-item-large';
    div.dataset.hobby = hobby.name.toLowerCase().replace(/\s+/g, '');
    div.dataset.category = hobby.category;
    div.innerHTML = `${hobby.emoji} ${hobby.name}`;
    hobbyGrid.appendChild(div);
  });

  console.log(`🎯 ${hobbies.length} ilgi alanı yüklendi`);
}

// Tab switching
function switchTab(tabName) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.querySelector('.tab-btn[onclick="switchTab(\'login\')"]');
  const registerTab = document.querySelector('.tab-btn[onclick="switchTab(\'register\')"]');
  
  if (tabName === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
  }
}

// Kanal şifre bölümünü göster/gizle
function togglePasswordSection() {
  const passwordSection = document.getElementById('passwordSection');
  const privateRadio = document.querySelector('input[name="channelType"][value="private"]');
  
  if (privateRadio.checked) {
    passwordSection.style.display = 'block';
  } else {
    passwordSection.style.display = 'none';
  }
}

// Profil form submit
function submitProfileForm() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('profileName').value;
      const surname = document.getElementById('profileSurname').value;
      const age = document.getElementById('profileAge').value;
      const bio = document.getElementById('profileBio').value;
      
      console.log('Profil güncellendi:', { name, surname, age, bio });
      alert('✅ Profil başarıyla güncellendi!');
      closeProfileModal();
    });
  }
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
window.createChannel = createChannel;
window.generateRandomNickname = generateRandomNickname;
window.selectLocation = selectLocation;
window.autoDetectLocation = autoDetectLocation;
window.skipLocation = skipLocation;
window.filterHobbies = filterHobbies;
window.updateSelectedHobbies = updateSelectedHobbies;
window.startDM = startDM;
window.toggleFollow = toggleFollow;
window.updateOnlineUsers = updateOnlineUsers;
window.updateRecentActivities = updateRecentActivities;
window.updateStats = updateStats;
window.openDonateModal = openDonateModal;
window.closeDonateModal = closeDonateModal;
window.processDonation = processDonation;
window.openSponsorChannelModal = openSponsorChannelModal;
window.closeSponsorChannelModal = closeSponsorChannelModal;
window.createSponsorChannel = createSponsorChannel;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.saveSettings = saveSettings;
window.openDMModal = openDMModal;
window.closeDMModal = closeDMModal;
window.selectDMUser = selectDMUser;
window.searchUsers = searchUsers;
window.sendDMMessage = sendDMMessage;
window.openAddFriendModal = openAddFriendModal;
window.closeAddFriendModal = closeAddFriendModal;
window.searchUsersForAdd = searchUsersForAdd;
window.addFriend = addFriend;
window.sendInvite = sendInvite;
window.copyInviteLink = copyInviteLink;
window.switchChannel = switchChannel;
window.sendMessage = sendMessage;
window.switchTab = switchTab;
window.togglePasswordSection = togglePasswordSection;

// Basit lokasyon algılama (sadece bir kez)
function detectLocationOnce() {
  const existingLocation = localStorage.getItem('userLocation');
  if (existingLocation) {
    console.log('✅ Lokasyon zaten mevcut:', JSON.parse(existingLocation));
    return;
  }
  
  console.log('🌍 İlk kez lokasyon algılanıyor...');
  
  // Varsayılan lokasyon ayarla
  const defaultLocation = {
    country: 'Turkey',
    countryCode: 'TR',
    city: 'Istanbul',
    region: 'Istanbul',
    ip: 'default'
  };
  
  localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
  console.log('📍 Varsayılan lokasyon ayarlandı:', defaultLocation);
  
  // Dil değiştir
  if (window.onLocationChange) {
    window.onLocationChange('TR');
  }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App başlatılıyor...');
  
  // Lokasyon algıla (sadece bir kez)
  detectLocationOnce();
  
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
  
  // İlgi alanlarını yükle
  loadHobbies();
  
  // Dinamik ülke butonlarını oluştur
  generateCountryButtons();
  
  // İlgi alanları event listener'larını ekle
  document.querySelectorAll('.hobby-item-large').forEach(item => {
    item.addEventListener('click', function() {
      // Limit kontrolü
      if (this.classList.contains('selected')) {
        // Seçili ise kaldır
        this.classList.remove('selected');
      } else {
        // Seçili değilse, limit kontrolü yap
        if (checkHobbyLimit()) {
          this.classList.add('selected');
        } else {
          alert('En fazla 10 ilgi alanı seçebilirsiniz!');
          return;
        }
      }
      updateSelectedHobbies();
    });
  });

  // Form handler'larını ekle
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const createChannelForm = document.getElementById('createChannelForm');
  const profileForm = document.getElementById('profileForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('identifier').value = document.getElementById('loginEmail').value;
      document.getElementById('password').value = document.getElementById('loginPassword').value;
      doLogin();
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      document.getElementById('identifier').value = document.getElementById('registerEmail').value;
      document.getElementById('password').value = document.getElementById('registerPassword').value;
      doRegister();
    });
  }
  
  if (createChannelForm) {
    createChannelForm.addEventListener('submit', function(e) {
      e.preventDefault();
      createChannel();
    });
  }
  
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('profileName').value;
      const surname = document.getElementById('profileSurname').value;
      const age = document.getElementById('profileAge').value;
      const bio = document.getElementById('profileBio').value;
      
      console.log('Profil güncellendi:', { name, surname, age, bio });
      alert('✅ Profil başarıyla güncellendi!');
      closeProfileModal();
    });
  }

  // Kanal türü değişikliği için event listener
  document.querySelectorAll('input[name="channelType"]').forEach(radio => {
    radio.addEventListener('change', togglePasswordSection);
  });

  // DM mesaj gönderme event listener'ı
  const dmSendBtn = document.getElementById('dmSendBtn');
  const dmMessageInput = document.getElementById('dmMessageInput');
  
  if (dmSendBtn) {
    dmSendBtn.addEventListener('click', sendDMMessage);
  }
  
  if (dmMessageInput) {
    dmMessageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendDMMessage();
      }
    });
  }
  
  console.log('✅ App başlatıldı');
});
