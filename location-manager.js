// ===================== Gelişmiş Lokasyon Yöneticisi =====================
// Cookie + Geolocation + Manuel Seçim

class LocationManager {
  constructor() {
    this.cookieName = 'userLocation';
    this.cookieExpiry = 365; // 1 yıl
    this.supportedLanguages = {
      'US': { name: 'English', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston'] },
      'TR': { name: 'Türkçe', flag: '🇹🇷', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa'] },
      'DE': { name: 'Deutsch', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'] },
      'FR': { name: 'Français', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse'] },
      'ES': { name: 'Español', flag: '🇪🇸', cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville'] }
    };
    
    this.init();
  }

  // Cookie işlemleri
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Lokasyon verilerini kaydet
  saveLocation(countryCode, city) {
    const locationData = {
      countryCode,
      city,
      timestamp: Date.now(),
      source: 'manual'
    };
    
    this.setCookie(this.cookieName, JSON.stringify(locationData), this.cookieExpiry);
    localStorage.setItem('userLocation', JSON.stringify(locationData));
    
    console.log('📍 Lokasyon kaydedildi:', locationData);
    this.applyLocation(countryCode, city);
  }

  // Kaydedilmiş lokasyonu yükle
  loadSavedLocation() {
    const cookieData = this.getCookie(this.cookieName);
    const localData = localStorage.getItem('userLocation');
    
    if (cookieData) {
      try {
        const data = JSON.parse(cookieData);
        console.log('🍪 Cookie\'den lokasyon yüklendi:', data);
        return data;
      } catch (e) {
        console.error('🍪 Cookie parse hatası:', e);
      }
    }
    
    if (localData) {
      try {
        const data = JSON.parse(localData);
        console.log('💾 LocalStorage\'dan lokasyon yüklendi:', data);
        return data;
      } catch (e) {
        console.error('💾 LocalStorage parse hatası:', e);
      }
    }
    
    return null;
  }

  // Geolocation API ile otomatik lokasyon
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation desteklenmiyor'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log('🌍 GPS koordinatları:', { latitude, longitude });
            
            // Reverse geocoding için basit API
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            const locationData = {
              countryCode: data.countryCode,
              city: data.city || data.locality,
              latitude,
              longitude,
              timestamp: Date.now(),
              source: 'geolocation'
            };
            
            console.log('🌍 Geolocation verisi:', locationData);
            resolve(locationData);
          } catch (error) {
            console.error('🌍 Geolocation API hatası:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('🌍 Geolocation hatası:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 dakika cache
        }
      );
    });
  }

  // Lokasyonu uygula
  applyLocation(countryCode, city) {
    // Dil değiştir
    if (window.onLocationChange) {
      window.onLocationChange(countryCode);
    }
    
    // UI güncelle
    this.updateLocationUI(countryCode, city);
    
    // Kanalları yükle
    if (window.loadLocationBasedChannels) {
      const locationData = { countryCode, city };
      window.loadLocationBasedChannels(locationData);
    }
  }

  // UI güncelle
  updateLocationUI(countryCode, city) {
    const locationIndicator = document.getElementById('locationIndicator');
    const currentLocation = document.getElementById('currentLocation');
    
    if (locationIndicator && currentLocation) {
      const lang = this.supportedLanguages[countryCode];
      if (lang) {
        currentLocation.textContent = `${lang.flag} ${city}, ${lang.name}`;
        locationIndicator.style.display = 'block';
      }
    }
  }

  // Hızlı lokasyon seçim butonları oluştur
  createLocationButtons() {
    const container = document.createElement('div');
    container.className = 'location-buttons';
    container.innerHTML = `
      <div class="location-header">
        <h3>🌍 Lokasyon Seçin</h3>
        <button onclick="locationManager.closeLocationModal()" class="close-btn">✖</button>
      </div>
      <div class="location-grid">
        ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
          <div class="location-group">
            <h4>${lang.flag} ${lang.name}</h4>
            <div class="city-buttons">
              ${lang.cities.map(city => `
                <button onclick="locationManager.selectLocation('${code}', '${city}')" class="city-btn">
                  ${city}
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="location-footer">
        <button onclick="locationManager.tryGeolocation()" class="geolocation-btn">
          📍 Otomatik Algıla
        </button>
        <button onclick="locationManager.closeLocationModal()" class="skip-btn">
          ⏭️ Geç
        </button>
      </div>
    `;
    
    return container;
  }

  // Lokasyon seç
  selectLocation(countryCode, city) {
    this.saveLocation(countryCode, city);
    this.closeLocationModal();
  }

  // Geolocation dene
  async tryGeolocation() {
    try {
      const locationData = await this.getCurrentLocation();
      this.saveLocation(locationData.countryCode, locationData.city);
      this.closeLocationModal();
    } catch (error) {
      alert('Otomatik lokasyon algılanamadı. Lütfen manuel seçim yapın.');
    }
  }

  // Modal aç
  openLocationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.id = 'locationModal';
    modal.innerHTML = `
      <div class="modal-content location-modal">
        ${this.createLocationButtons().innerHTML}
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Modal kapat
  closeLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
      modal.remove();
    }
  }

  // Ana başlatma fonksiyonu
  async init() {
    console.log('🚀 LocationManager başlatılıyor...');
    
    // Kaydedilmiş lokasyonu kontrol et
    const savedLocation = this.loadSavedLocation();
    
    if (savedLocation && savedLocation.countryCode) {
      console.log('✅ Kaydedilmiş lokasyon bulundu:', savedLocation);
      this.applyLocation(savedLocation.countryCode, savedLocation.city);
    } else {
      console.log('❌ Kaydedilmiş lokasyon yok, modal açılıyor...');
      // 1 saniye bekle ki sayfa yüklensin
      setTimeout(() => {
        this.openLocationModal();
      }, 1000);
    }
  }
}

// Global instance oluştur
window.locationManager = new LocationManager();

// Global fonksiyonlar
window.openLocationModal = () => window.locationManager.openLocationModal();
window.closeLocationModal = () => window.locationManager.closeLocationModal();
