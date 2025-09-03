// IP Lokasyon Algılama - Basit ve Çalışan Versiyon
console.log('🌍 IP Lokasyon Algılama başlatılıyor...');

async function detectUserLocation() {
  try {
    console.log('🔍 IP adresinden lokasyon algılanıyor...');
    
    // IP API'den lokasyon bilgisi al
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    console.log('📍 API Yanıtı:', data);
    
    if (data.country_name && data.city) {
      // Lokasyon bilgilerini kaydet
      const locationData = {
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        region: data.region || null,
        ip: data.ip
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
      
      // Kullanıcıya bildir
      alert(`📍 Lokasyonunuz algılandı: ${data.city}, ${data.country_name}\n🌍 Dil: ${detectedLanguage}`);
      
      // Sayfayı yenile
      setTimeout(() => {
        location.reload();
      }, 2000);
      
    } else {
      console.error('❌ Lokasyon bilgisi alınamadı');
      alert('❌ Lokasyon algılanamadı. Varsayılan olarak Türkçe kullanılacak.');
    }
    
  } catch (error) {
    console.error('❌ IP algılama hatası:', error);
    alert('❌ Lokasyon algılanamadı. Varsayılan olarak Türkçe kullanılacak.');
  }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Sayfa yüklendi, lokasyon algılanıyor...');
  
  // 2 saniye bekle ki diğer scriptler yüklensin
  setTimeout(() => {
    detectUserLocation();
  }, 2000);
});

// Global fonksiyon olarak ekle
window.detectUserLocation = detectUserLocation;
