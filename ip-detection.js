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
    
    // IP API'den lokasyon bilgisi al
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
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

// Lokasyon verisini temizle ve yeniden algıla
function clearLocationAndRedetect() {
  console.log('🗑️ Eski lokasyon verisi temizleniyor...');
  localStorage.removeItem('userLocation');
  localStorage.removeItem('selectedLanguage');
  console.log('✅ Lokasyon verisi temizlendi, yeniden algılanıyor...');
  
  // 1 saniye bekle ve yeniden algıla
  setTimeout(() => {
    detectUserLocation();
  }, 1000);
}

// Global fonksiyonlar olarak ekle
window.detectUserLocation = detectUserLocation;
window.loadLocationBasedChannels = loadLocationBasedChannels;
window.locationBasedChannels = locationBasedChannels;
window.clearLocationAndRedetect = clearLocationAndRedetect;
