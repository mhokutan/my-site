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

// Kanal oluşturma
function createChannel() {
  const channelName = document.getElementById('channelName').value;
  const channelType = document.querySelector('input[name="channelType"]:checked').value;
  const channelPassword = document.getElementById('channelPassword').value;

  if (!channelName) {
    alert('Lütfen kanal adı girin!');
    return;
  }

  console.log('Kanal oluşturuluyor:', { channelName, channelType, channelPassword });
  
  // Yeni kanalı listeye ekle
  addChannelToList(channelName, channelType);
  
  // Modal'ı kapat
  closeCreateChannelModal();
  
  // Form'u temizle
  document.getElementById('createChannelForm').reset();
  
  alert(`✅ Kanal oluşturuldu: ${channelName}`);
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

// Popüler kanalları oluştur
function generatePopularChannels(selectedHobbies) {
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
  // DM modalını aç veya yeni sekme aç
  alert(`💬 ${username} ile DM başlatılıyor...`);
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
  
  console.log('✅ App başlatıldı');
});
