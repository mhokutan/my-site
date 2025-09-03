// ===================== Çok Dilli Destek - Lokasyona Göre Dil Değişimi =====================

const translations = {
  // Türkçe (varsayılan)
  'TR': {
    // Menü
    'menu': 'Menü',
    'login': 'Giriş',
    'logout': 'Çıkış',
    'profile': 'Profil Düzenle',
    'feedback': 'Öneri',
    'location': 'Lokasyon',
    'sponsor': 'Sponsor',
    'donate': '☕ Kahve İkram Et',
    
    // Kanallar
    'sponsorChannels': 'Sponsorlu Kanallar',
    'generalChannels': 'Genel Kanallar',
    'favoriteChannels': 'Favori Kanallarım',
    'users': 'Kullanıcılar',
    'following': 'Takip Edilenler',
    
    // Kanal başlıkları
    'sponsorChannelsTitle': '💰 Sponsor Kanallar',
    'generalChannelsTitle': '🌐 Genel Kanallar',
    'favoriteCitiesTitle': '🏙️ Favori Şehirler',
    
    'loginTitle': 'Giriş / Kayıt',
    'profileTitle': 'Profil Düzenle',
    'locationTitle': 'Lokasyon Ayarla',
    'sponsorTitle': 'Sponsor Kanal Oluştur',
    'channelTitle': 'Yeni Kanal Oluştur',
    'hobbiesTitle': 'İlgi Alanları',
    
    'email': 'Email veya Telefon',
    'password': 'Şifre',
    'firstName': 'Ad',
    'lastName': 'Soyad',
    'gender': 'Cinsiyet',
    'birth': 'Doğum Tarihi',
    'country': 'Ülke',
    'city': 'Şehir',
    'channelName': 'Kanal adı',
    'channelDescription': 'Kanal açıklaması',
    'channelType': 'Kanal türü',
    'public': 'Genel',
    'private': 'Özel',
    'password': 'Şifre',
    'createChannel': 'Kanal Oluştur',
    'loginBtn': 'Giriş',
    'registerBtn': 'Kayıt',
    'rememberMe': 'Beni Hatırla',
    'saveBtn': 'Kaydet',
    'cancelBtn': 'İptal',
    'closeBtn': 'Kapat',
    
    // Status
    'anonymous': 'Anonim',
    'loggedIn': 'Giriş yapıldı',
    'typing': 'yazıyor...',
    
    // Time
    'now': 'şimdi',
    'today': 'bugün',
    'yesterday': 'dün'
  },
  
  // İngilizce
  'US': {
    'menu': 'Menu',
    'login': 'Login',
    'logout': 'Logout',
    'profile': 'Edit Profile',
    'feedback': 'Feedback',
    'location': 'Location',
    'sponsor': 'Sponsor',
    'donate': '☕ Buy me a coffee',
    
    'sponsorChannels': 'Sponsored Channels',
    'generalChannels': 'General Channels',
    'favoriteChannels': 'My Favorite Channels',
    'users': 'Users',
    'following': 'Following',
    
    // Kanal başlıkları
    'sponsorChannelsTitle': '💰 Sponsor Channels',
    'generalChannelsTitle': '🌐 General Channels',
    'favoriteCitiesTitle': '🏙️ Favorite Cities',
    
    'loginTitle': 'Login / Register',
    'profileTitle': 'Edit Profile',
    'locationTitle': 'Set Location',
    'sponsorTitle': 'Create Sponsor Channel',
    'channelTitle': 'Create New Channel',
    'hobbiesTitle': 'Interests',
    
    'email': 'Email or Phone',
    'password': 'Password',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'gender': 'Gender',
    'birth': 'Birth Date',
    'country': 'Country',
    'city': 'City',
    'channelName': 'Channel name',
    'channelDescription': 'Channel description',
    'channelType': 'Channel type',
    'public': 'Public',
    'private': 'Private',
    'password': 'Password',
    'createChannel': 'Create Channel',
    'loginBtn': 'Login',
    'registerBtn': 'Register',
    'rememberMe': 'Remember Me',
    'saveBtn': 'Save',
    'cancelBtn': 'Cancel',
    'closeBtn': 'Close',
    
    // Status
    'anonymous': 'Anonymous',
    'loggedIn': 'Logged in',
    'typing': 'typing...',
    
    // Time
    'now': 'now',
    'today': 'today',
    'yesterday': 'yesterday'
  }
};

// Dil değiştirme fonksiyonu
function changeLanguage(countryCode) {
  const lang = translations[countryCode] || translations['TR'];
  
  // Tüm data-translate attribute'larına sahip elementleri bul ve güncelle
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (lang[key]) {
      element.textContent = lang[key];
    }
  });
  
  // Placeholder'ları güncelle
  document.querySelectorAll('[data-placeholder]').forEach(element => {
    const key = element.getAttribute('data-placeholder');
    if (lang[key]) {
      element.placeholder = lang[key];
    }
  });
  
  // Title'ları güncelle
  document.querySelectorAll('[data-title]').forEach(element => {
    const key = element.getAttribute('data-title');
    if (lang[key]) {
      element.title = lang[key];
    }
  });
  
  // Dil kodunu localStorage'a kaydet
  localStorage.setItem('selectedLanguage', countryCode);
  
  console.log(`🌍 Dil değiştirildi: ${countryCode}`);
}

// Sayfa yüklendiğinde dil ayarını yükle
function loadLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
  
  // Önce kaydedilmiş dil varsa onu kullan
  if (savedLanguage && translations[savedLanguage]) {
    changeLanguage(savedLanguage);
    return;
  }
  
  // Yoksa kullanıcının lokasyonuna göre dil belirle
  if (userLocation.country && translations[userLocation.country]) {
    changeLanguage(userLocation.country);
  } else {
    // Varsayılan olarak Türkçe
    changeLanguage('TR');
  }
}

// Lokasyon değiştiğinde dil değiştir
function onLocationChange(countryCode) {
  console.log('🌍 onLocationChange çağrıldı:', countryCode);
  console.log('🌍 Mevcut translations anahtarları:', Object.keys(translations));
  
  if (translations[countryCode]) {
    console.log('✅ Dil değiştiriliyor:', countryCode);
    changeLanguage(countryCode);
  } else {
    console.log('❌ Dil bulunamadı:', countryCode);
    console.log('🔄 Varsayılan dil (TR) kullanılıyor');
    changeLanguage('TR');
  }
}

// Global olarak erişilebilir yap
window.changeLanguage = changeLanguage;
window.loadLanguage = loadLanguage;
window.onLocationChange = onLocationChange;