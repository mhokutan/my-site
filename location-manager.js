// Location Manager - Cookie + Geolocation based system
class LocationManager {
    constructor() {
        this.locationDetected = false;
        this.init();
    }

    init() {
        console.log('🚀 LocationManager başlatılıyor...');
        this.loadSavedLocation();
    }

    // Cookie functions
    setCookie(name, value, days = 30) {
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

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }

    // Save location to cookie and localStorage
    saveLocationToCookie(locationData) {
        const cookieData = JSON.stringify(locationData);
        this.setCookie('userLocation', cookieData, 365); // 1 year
        localStorage.setItem('userLocation', cookieData);
        console.log('📍 Lokasyon kaydedildi:', locationData);
    }

    // Load location from cookie or localStorage
    loadLocationFromCookie() {
        // Try cookie first
        const cookieLocation = this.getCookie('userLocation');
        if (cookieLocation) {
            try {
                const locationData = JSON.parse(cookieLocation);
                console.log('🍪 Cookie\'den lokasyon yüklendi:', locationData);
                return locationData;
            } catch (error) {
                console.error('Cookie lokasyon parse hatası:', error);
            }
        }

        // Fallback to localStorage
        const localLocation = localStorage.getItem('userLocation');
        if (localLocation) {
            try {
                const locationData = JSON.parse(localLocation);
                console.log('💾 LocalStorage\'dan lokasyon yüklendi:', locationData);
                return locationData;
            } catch (error) {
                console.error('LocalStorage lokasyon parse hatası:', error);
            }
        }

        return null;
    }

    // Detect geolocation
    detectGeolocation() {
        if (!navigator.geolocation) {
            console.log('❌ Geolocation desteklenmiyor');
            return Promise.reject('Geolocation desteklenmiyor');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('🌍 GPS koordinatları:', { latitude, longitude });
                    
                    // Reverse geocoding (simplified)
                    this.reverseGeocode(latitude, longitude)
                        .then(locationData => {
                            console.log('🌍 Geolocation verisi:', locationData);
                            this.saveLocationToCookie(locationData);
                            this.applyLocation(locationData);
                            resolve(locationData);
                        })
                        .catch(error => {
                            console.error('Reverse geocoding hatası:', error);
                            reject(error);
                        });
                },
                (error) => {
                    console.error('Geolocation hatası:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // Simplified reverse geocoding
    reverseGeocode(lat, lng) {
        // This is a simplified version - in production you'd use a real geocoding service
        const locationData = {
            country: 'Turkey',
            countryCode: 'TR',
            city: 'Istanbul',
            region: 'Istanbul',
            latitude: lat,
            longitude: lng,
            source: 'geolocation'
        };

        // Simple region detection based on coordinates
        if (lat > 40 && lat < 42 && lng > 28 && lng < 30) {
            locationData.city = 'Istanbul';
            locationData.country = 'Turkey';
            locationData.countryCode = 'TR';
        } else if (lat > 39 && lat < 40 && lng > 32 && lng < 33) {
            locationData.city = 'Ankara';
            locationData.country = 'Turkey';
            locationData.countryCode = 'TR';
        } else if (lat > 40 && lat < 41 && lng > 28 && lng < 30) {
            locationData.city = 'Izmir';
            locationData.country = 'Turkey';
            locationData.countryCode = 'TR';
        } else if (lat > 40 && lat < 45 && lng > -75 && lng < -70) {
            locationData.city = 'New York';
            locationData.country = 'United States';
            locationData.countryCode = 'US';
        } else if (lat > 48 && lat < 49 && lng > 2 && lng < 3) {
            locationData.city = 'Paris';
            locationData.country = 'France';
            locationData.countryCode = 'FR';
        } else if (lat > 52 && lat < 53 && lng > 13 && lng < 14) {
            locationData.city = 'Berlin';
            locationData.country = 'Germany';
            locationData.countryCode = 'DE';
        } else if (lat > 40 && lat < 41 && lng > -4 && lng < -3) {
            locationData.city = 'Madrid';
            locationData.country = 'Spain';
            locationData.countryCode = 'ES';
        }

        return Promise.resolve(locationData);
    }

    // Load saved location
    loadSavedLocation() {
        const savedLocation = this.loadLocationFromCookie();
        
        if (savedLocation && savedLocation.countryCode) {
            console.log('✅ Kaydedilmiş lokasyon bulundu:', savedLocation);
            this.applyLocation(savedLocation);
        } else {
            console.log('❌ Kaydedilmiş lokasyon yok, modal açılıyor...');
            this.openLocationModal();
        }
    }

    // Apply location changes
    applyLocation(locationData) {
        if (this.locationDetected) return; // Prevent multiple applications
        
        this.locationDetected = true;
        
        // Update language based on country
        if (window.onLocationChange) {
            window.onLocationChange(locationData.countryCode);
        }
        
        // Update UI elements
        this.updateLocationUI(locationData);
        
        // Load location-based channels
        this.loadLocationBasedChannels(locationData);
    }

    // Update location UI
    updateLocationUI(locationData) {
        const locationIndicator = document.getElementById('locationIndicator');
        if (locationIndicator) {
            const flag = this.getCountryFlag(locationData.countryCode);
            locationIndicator.innerHTML = `${flag} ${locationData.city}, ${locationData.country}`;
        }
    }

    // Get country flag emoji
    getCountryFlag(countryCode) {
        const flags = {
            'TR': '🇹🇷',
            'US': '🇺🇸',
            'FR': '🇫🇷',
            'DE': '🇩🇪',
            'ES': '🇪🇸',
            'GB': '🇬🇧',
            'IT': '🇮🇹',
            'RU': '🇷🇺',
            'CN': '🇨🇳',
            'JP': '🇯🇵'
        };
        return flags[countryCode] || '🌍';
    }

    // Load location-based channels
    loadLocationBasedChannels(locationData) {
        // This would typically make an API call to get location-specific channels
        const locationChannels = this.getLocationChannels(locationData.countryCode);
        
        if (window.updateChannelList) {
            window.updateChannelList(locationChannels);
        }
        
        console.log('📍 Lokasyon bazlı kanallar yüklendi:', locationChannels);
    }

    // Get channels for specific country
    getLocationChannels(countryCode) {
        const channelMap = {
            'TR': ['#genel', '#sohbet', '#türkiye', '#istanbul', '#ankara'],
            'US': ['#general', '#chat', '#usa', '#newyork', '#california'],
            'FR': ['#général', '#chat', '#france', '#paris', '#lyon'],
            'DE': ['#allgemein', '#chat', '#deutschland', '#berlin', '#münchen'],
            'ES': ['#general', '#chat', '#españa', '#madrid', '#barcelona']
        };
        
        return channelMap[countryCode] || ['#genel', '#sohbet'];
    }
}

// Global functions for modal interaction
function openLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeLocationModal() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function selectLocation(countryCode, country, city) {
    const locationData = {
        country: country,
        countryCode: countryCode,
        city: city,
        source: 'manual'
    };
    
    locationManager.saveLocationToCookie(locationData);
    locationManager.applyLocation(locationData);
    closeLocationModal();
}

function autoDetectLocation() {
    locationManager.detectGeolocation()
        .then(() => {
            closeLocationModal();
        })
        .catch(error => {
            console.error('Otomatik lokasyon algılama hatası:', error);
            alert('Lokasyon algılanamadı. Lütfen manuel olarak seçin.');
        });
}

function skipLocation() {
    // Set default location
    const defaultLocation = {
        country: 'Turkey',
        countryCode: 'TR',
        city: 'Istanbul',
        source: 'default'
    };
    
    locationManager.saveLocationToCookie(defaultLocation);
    locationManager.applyLocation(defaultLocation);
    closeLocationModal();
}

// Initialize LocationManager
const locationManager = new LocationManager();

// Make functions globally accessible
window.openLocationModal = openLocationModal;
window.closeLocationModal = closeLocationModal;
window.selectLocation = selectLocation;
window.autoDetectLocation = autoDetectLocation;
window.skipLocation = skipLocation;