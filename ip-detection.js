// Gelişmiş IP Lokasyon Algılama - Otomatik Dil ve Kanal Filtreleme
console.log('🌍 Gelişmiş IP Lokasyon Algılama başlatılıyor...');

// Lokasyon bazlı kanal önerileri
const locationBasedChannels = {
  'TR': {
    'Istanbul': ['#istanbul', '#beyoglu', '#kadikoy', '#besiktas', '#sisli'],
    'Ankara': ['#ankara', '#cankaya', '#kecioren', '#mamak'],
    'Izmir': ['#izmir', '#konak', '#bornova', '#karsiyaka'],
    'Bursa': ['#bursa', '#nilufer', '#osmangazi'],
    'Antalya': ['#antalya', '#muratpasa', '#konyaalti'],
    'default': ['#genel', '#sohbet', '#turkce']
  },
  'US': {
    'New York': ['#newyork', '#manhattan', '#brooklyn', '#queens'],
    'Los Angeles': ['#losangeles', '#hollywood', '#beverlyhills'],
    'Chicago': ['#chicago', '#downtown'],
    'Houston': ['#houston', '#texas'],
    'default': ['#general', '#chat', '#english']
  },
  'FR': {
    'Paris': ['#paris', '#champselysees', '#montmartre'],
    'Lyon': ['#lyon', '#rhone'],
    'Marseille': ['#marseille', '#provence'],
    'default': ['#general', '#chat', '#francais']
  },
  'DE': {
    'Berlin': ['#berlin', '#mitte', '#kreuzberg'],
    'Munich': ['#munich', '#bavaria'],
    'Hamburg': ['#hamburg', '#north'],
    'default': ['#general', '#chat', '#deutsch']
  },
  'ES': {
    'Madrid': ['#madrid', '#centro', '#salamanca'],
    'Barcelona': ['#barcelona', '#catalonia'],
    'Valencia': ['#valencia', '#east'],
    'default': ['#general', '#chat', '#espanol']
  }
};

async function detectUserLocation() {
  try {
    console.log('🔍 IP adresinden lokasyon algılanıyor...');
    
    // IP API'den lokasyon bilgisi al (birden fazla API dene)
    let data;
    try {
      const response = await fetch('https://ipapi.co/json/');
      data = await response.json();
    } catch (error) {
      console.log('⚠️ ipapi.co başarısız, alternatif API deneniyor...');
      try {
        const response = await fetch('https://ipinfo.io/json');
        const ipinfoData = await response.json();
        data = {
          country_name: ipinfoData.country,
          country_code: ipinfoData.country,
          city: ipinfoData.city,
          region: ipinfoData.region,
          ip: ipinfoData.ip,
          timezone: ipinfoData.timezone
        };
      } catch (error2) {
        console.log('⚠️ ipinfo.io da başarısız, varsayılan lokasyon kullanılıyor...');
        throw new Error('Tüm IP API\'leri başarısız');
      }
    }
    
    console.log('📍 API Yanıtı:', data);
    console.log('🌍 Gerçek lokasyon:', data.country_name, data.city, data.region);
    
    if (data.country_name && data.city) {
      // Ülke kodunu düzelt
      let countryCode = data.country_code;
      if (countryCode === 'staates' || countryCode === 'united staates') {
        countryCode = 'US';
      }
      
      // Lokasyon bilgilerini kaydet
      const locationData = {
        country: data.country_name,
        countryCode: countryCode,
        city: data.city,
        region: data.region || null,
        ip: data.ip,
        timezone: data.timezone || null,
        currency: data.currency || null
      };
      
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      console.log('✅ Lokasyon kaydedildi:', locationData);
      
      // Dil değiştir
      const languageMap = {
        'US': 'US', 'CA': 'US', 'GB': 'US', 'AU': 'US', 'NZ': 'US',
        'TR': 'TR',
        'FR': 'FR', 'BE': 'FR', 'CH': 'FR',
        'DE': 'DE', 'AT': 'DE', 'LI': 'DE',
        'ES': 'ES', 'MX': 'ES', 'AR': 'ES', 'CL': 'ES', 'CO': 'ES', 'PE': 'ES', 'VE': 'ES', 'UY': 'ES'
      };
      
      const detectedLanguage = languageMap[data.country_code] || 'TR';
      console.log('🌍 Dil değiştiriliyor:', detectedLanguage);
      
      // Dil değiştir fonksiyonunu çağır
      if (window.onLocationChange) {
        window.onLocationChange(detectedLanguage);
      }
      
      // Sayfayı yenile ki dil değişikliği uygulanabilsin
      setTimeout(() => {
        location.reload();
      }, 1000);
      
      // Lokasyona göre kanalları yükle
      if (window.loadLocationBasedChannels) {
        window.loadLocationBasedChannels(locationData);
      }
      
      // Backend'e lokasyon bilgisini gönder
      if (window.API) {
        try {
          await fetch(window.API + '/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: window.token || 'anonymous',
              country: data.country_name,
              city: data.city,
              state: data.region,
              countryCode: data.country_code
            })
          });
        } catch (error) {
          console.log('Backend lokasyon güncelleme hatası:', error);
        }
      }
      
      // Kullanıcıya bildir (sessizce)
      console.log(`📍 Lokasyonunuz algılandı: ${data.city}, ${data.country_name}\n🌍 Dil: ${detectedLanguage}`);
      
    } else {
      console.error('❌ Lokasyon bilgisi alınamadı');
      // Varsayılan lokasyon ayarla
      const defaultLocation = {
        country: 'Turkey',
        countryCode: 'TR',
        city: 'Istanbul',
        region: 'Istanbul',
        ip: 'unknown'
      };
      localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
      
      if (window.onLocationChange) {
        window.onLocationChange('TR');
      }
    }
    
  } catch (error) {
    console.error('❌ IP algılama hatası:', error);
    // Varsayılan lokasyon ayarla
    const defaultLocation = {
      country: 'Turkey',
      countryCode: 'TR',
      city: 'Istanbul',
      region: 'Istanbul',
      ip: 'unknown'
    };
    localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
    
    if (window.onLocationChange) {
      window.onLocationChange('TR');
    }
  }
}

// Lokasyona göre kanalları yükle
function loadLocationBasedChannels(locationData) {
  const countryCode = locationData.countryCode;
  const city = locationData.city;
  
  if (locationBasedChannels[countryCode]) {
    const cityChannels = locationBasedChannels[countryCode][city] || 
                        locationBasedChannels[countryCode]['default'];
    
    // Lokasyon bazlı kanalları localStorage'a kaydet
    localStorage.setItem('locationBasedChannels', JSON.stringify(cityChannels));
    
    // Kanal listesini güncelle
    if (window.updateChannelList) {
      window.updateChannelList(cityChannels);
    }
    
    console.log(`📍 ${city} için kanallar yüklendi:`, cityChannels);
  }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Sayfa yüklendi, lokasyon kontrol ediliyor...');
  
  // DEBUG: localStorage'ı kontrol et
  const existingLocation = localStorage.getItem('userLocation');
  console.log('🔍 Mevcut localStorage lokasyon:', existingLocation);
  
  // Otomatik lokasyon algılama yap
  console.log('🔄 Otomatik lokasyon algılanıyor...');
  detectUserLocation();
  
  // Eğer lokasyon zaten algılanmışsa tekrar algılama
  if (existingLocation) {
    const locationData = JSON.parse(existingLocation);
    console.log('✅ Lokasyon zaten mevcut:', locationData);
    
    // Mevcut lokasyona göre dil değiştir
    const languageMap = {
      'US': 'US', 'CA': 'US', 'GB': 'US', 'AU': 'US', 'NZ': 'US',
      'TR': 'TR',
      'FR': 'FR', 'BE': 'FR', 'CH': 'FR',
      'DE': 'DE', 'AT': 'DE', 'LI': 'DE',
      'ES': 'ES', 'MX': 'ES', 'AR': 'ES', 'CL': 'ES', 'CO': 'ES', 'PE': 'ES', 'VE': 'ES', 'UY': 'ES'
    };
    
    // Ülke kodunu düzelt
    let countryCode = locationData.countryCode;
    if (countryCode === 'staates' || countryCode === 'united staates') {
      countryCode = 'US';
      // localStorage'ı güncelle
      locationData.countryCode = 'US';
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      console.log('🔧 Ülke kodu düzeltildi: staates -> US');
    }
    
    const detectedLanguage = languageMap[countryCode] || 'TR';
    console.log('🌍 Dil eşleme:', countryCode, '->', detectedLanguage);
    console.log('🔍 languageMap:', languageMap);
    console.log('🔍 countryCode:', countryCode);
    if (window.onLocationChange) {
      window.onLocationChange(detectedLanguage);
    } else {
      console.log('⚠️ onLocationChange fonksiyonu bulunamadı');
    }
    
    // Lokasyona göre kanalları yükle
    loadLocationBasedChannels(locationData);
    
    // DEBUG: Yeniden algılama seçeneği sun
    console.log('🔄 Yeniden lokasyon algılamak için: localStorage.removeItem("userLocation")');
    return;
  }
  
  // 2 saniye bekle ki diğer scriptler yüklensin
  setTimeout(() => {
    detectUserLocation();
  }, 2000);
});

// Manuel lokasyon modal'ını aç
function openLocationModal() {
  const modal = document.createElement('div');
  modal.className = 'modal open';
  modal.id = 'locationModal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🌍 Lokasyon Seçin</h3>
        <button class="modal-close" onclick="closeLocationModal()">✖</button>
      </div>
      <div class="modal-body">
        <select id="countrySelect" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="">Ülke Seçin</option>
          <option value="US">🇺🇸 Amerika</option>
          <option value="TR">🇹🇷 Türkiye</option>
          <option value="FR">🇫🇷 Fransa</option>
          <option value="DE">🇩🇪 Almanya</option>
          <option value="ES">🇪🇸 İspanya</option>
          <option value="GB">🇬🇧 İngiltere</option>
          <option value="IT">🇮🇹 İtalya</option>
          <option value="RU">🇷🇺 Rusya</option>
          <option value="CN">🇨🇳 Çin</option>
          <option value="JP">🇯🇵 Japonya</option>
          <option value="KR">🇰🇷 Güney Kore</option>
          <option value="IN">🇮🇳 Hindistan</option>
          <option value="BR">🇧🇷 Brezilya</option>
          <option value="CA">🇨🇦 Kanada</option>
          <option value="AU">🇦🇺 Avustralya</option>
        </select>
        <input type="text" id="cityInput" placeholder="Şehir" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div class="modal-footer">
        <button onclick="saveManualLocation()" style="background: var(--brand); color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Kaydet</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Manuel lokasyon modal'ını kapat
function closeLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.remove();
  }
}

// Manuel lokasyon kaydet
function saveManualLocation() {
  const countryCode = document.getElementById('countrySelect').value;
  const city = document.getElementById('cityInput').value.trim();
  
  if (!countryCode || !city) {
    alert('Lütfen ülke ve şehir seçin.');
    return;
  }
  
  const countryNames = {
    'US': 'United States',
    'TR': 'Turkey', 
    'FR': 'France',
    'DE': 'Germany',
    'ES': 'Spain',
    'GB': 'United Kingdom',
    'IT': 'Italy',
    'RU': 'Russia',
    'CN': 'China',
    'JP': 'Japan',
    'KR': 'South Korea',
    'IN': 'India',
    'BR': 'Brazil',
    'CA': 'Canada',
    'AU': 'Australia'
  };
  
  const locationData = {
    country: countryNames[countryCode],
    countryCode: countryCode,
    city: city,
    region: city,
    ip: 'manual',
    timezone: 'manual',
    currency: 'manual',
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('userLocation', JSON.stringify(locationData));
  console.log('📍 Manuel lokasyon kaydedildi:', locationData);
  
  // Dil değiştir
  const languageMap = {
    'US': 'US', 'CA': 'US', 'GB': 'US', 'AU': 'US', 'NZ': 'US',
    'TR': 'TR',
    'FR': 'FR', 'BE': 'FR', 'CH': 'FR',
    'DE': 'DE', 'AT': 'DE', 'LI': 'DE',
    'ES': 'ES', 'MX': 'ES', 'AR': 'ES', 'CL': 'ES', 'CO': 'ES', 'PE': 'ES', 'VE': 'ES', 'UY': 'ES'
  };
  
  const selectedLanguage = languageMap[countryCode] || 'TR';
  console.log(`🌍 Dil değiştiriliyor: ${countryCode} -> ${selectedLanguage}`);
  
  if (window.onLocationChange) {
    window.onLocationChange(selectedLanguage);
  }
  
  // Kanalları yükle
  loadLocationBasedChannels(locationData);
  
  // Modal'ı kapat
  closeLocationModal();
  
  // Sayfayı yenile
  location.reload();
}

// Lokasyon verisini temizle ve yeniden algıla
function clearLocationAndRedetect() {
  console.log('🗑️ Eski lokasyon verisi temizleniyor...');
  localStorage.removeItem('userLocation');
  localStorage.removeItem('selectedLanguage');
  console.log('✅ Lokasyon verisi temizlendi, manuel seçim için modal açılıyor...');
  openLocationModal();
}

// Global fonksiyonlar olarak ekle
window.detectUserLocation = detectUserLocation;
window.loadLocationBasedChannels = loadLocationBasedChannels;
window.locationBasedChannels = locationBasedChannels;
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.saveManualLocation = saveManualLocation;
window.clearLocationAndRedetect = clearLocationAndRedetect;
window.clearLocationAndRedetect = clearLocationAndRedetect;
