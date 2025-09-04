// Gerçek Kanal Sistemi - İlgi Alanlarına Göre Kanallar
console.log('🎯 Kanal Sistemi başlatılıyor...');

class ChannelSystem {
  constructor() {
    this.hobbyChannels = new Map();
    this.sponsorChannels = ['#heponsigorta', '#sponsor1', '#sponsor2'];
    this.generalChannels = ['#genel', '#spor', '#teknoloji', '#müzik', '#film', '#oyun'];
    this.favoriteCities = ['#istanbul', '#newyork', '#paris', '#london', '#tokyo', '#berlin', '#madrid', '#rome'];
    this.userHobbies = JSON.parse(localStorage.getItem('hobbies') || '[]');
  }

  // İlgi alanlarına göre kanallar oluştur
  createHobbyChannels() {
    console.log('🎯 İlgi alanlarına göre kanallar oluşturuluyor:', this.userHobbies);
    
    // Mevcut kanalları temizle
    this.hobbyChannels.clear();
    
    // Her ilgi alanı için kanal oluştur
    this.userHobbies.forEach(hobby => {
      const channelName = this.getChannelName(hobby);
      this.hobbyChannels.set(channelName, {
        name: channelName,
        hobby: hobby,
        users: new Set(),
        messages: []
      });
    });
    
    console.log('✅ Oluşturulan kanallar:', Array.from(this.hobbyChannels.keys()));
    this.renderChannels();
  }

  // İlgi alanından kanal adı oluştur
  getChannelName(hobby) {
    // Türkçe karakterleri temizle ve küçük harfe çevir
    const cleanHobby = hobby
      .toLowerCase()
      .replace(/[çğıöşü]/g, match => {
        const map = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' };
        return map[match];
      })
      .replace(/[^a-z0-9]/g, '');
    
    return `#${cleanHobby}`;
  }

  // Kanalları ekrana render et
  renderChannels() {
    // Sponsor kanalları
    this.renderChannelList('sponsorList', this.sponsorChannels, '💰');
    this.renderChannelList('sponsorListMobile', this.sponsorChannels, '💰');
    
    // Genel kanallar
    this.renderChannelList('channelList', this.generalChannels, '🌐');
    this.renderChannelList('channelListMobile', this.generalChannels, '🌐');
    
    // Favori şehir kanalları
    this.renderChannelList('favList', this.favoriteCities, '🏙️');
    this.renderChannelList('favListMobile', this.favoriteCities, '🏙️');
    
    // İlgi alanı kanalları (kendi kanalları)
    this.renderHobbyChannels();
    this.renderHobbyChannelsMobile();

    console.log('✅ Tüm kanallar render edildi');
  }

  // Kanal listesi render et
  renderChannelList(listId, channels, icon) {
    const channelList = document.getElementById(listId);
    if (!channelList) return;

    // Mevcut kanalları temizle
    channelList.innerHTML = '';

    // Kanalları ekle
    channels.forEach(channelName => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color: #FFD700;">${icon}</span> ${channelName}`;
      li.onclick = () => this.joinChannel(channelName);
      channelList.appendChild(li);
    });
  }

  // İlgi alanı kanallarını render et
  renderHobbyChannels() {
    const channelList = document.getElementById('channelList');
    if (!channelList) return;

    // İlgi alanı kanalları
    this.hobbyChannels.forEach((channel, channelName) => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color: #4CAF50;">🎯</span> ${channelName}`;
      li.onclick = () => this.joinChannel(channelName);
      channelList.appendChild(li);
    });
  }

  // Mobil ilgi alanı kanallarını render et
  renderHobbyChannelsMobile() {
    const channelList = document.getElementById('channelListMobile');
    if (!channelList) return;

    // İlgi alanı kanalları
    this.hobbyChannels.forEach((channel, channelName) => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="color: #4CAF50;">🎯</span> ${channelName}`;
      li.onclick = () => this.joinChannel(channelName);
      channelList.appendChild(li);
    });
  }

  // Kanala katıl
  joinChannel(channelName) {
    console.log('🎯 Kanala katılıyor:', channelName);
    
    // Mevcut kanal bilgisini güncelle
    if (window.currentChannel) {
      window.currentChannel = channelName;
    }
    
    // Topic'i güncelle
    const topic = document.getElementById('topic');
    if (topic) {
      topic.textContent = channelName;
    }
    
    // WebSocket'e katıl mesajı gönder
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      window.ws.send(JSON.stringify({
        type: 'join',
        channel: channelName,
        nick: window.nick || 'Anonim',
        token: window.token
      }));
    }
    
    // Mesajları temizle
    const messages = document.getElementById('messages');
    if (messages) {
      messages.innerHTML = '';
    }
    
    console.log('✅ Kanala katıldı:', channelName);
  }

  // İlgi alanları değiştiğinde kanalları güncelle
  updateHobbies(newHobbies) {
    console.log('🎯 İlgi alanları güncelleniyor:', newHobbies);
    this.userHobbies = newHobbies;
    localStorage.setItem('hobbies', JSON.stringify(newHobbies));
    this.createHobbyChannels();
    
    // Backend'e ilgi alanlarını gönder
    this.sendHobbiesToBackend(newHobbies);
  }
  
  // Backend'e ilgi alanlarını gönder
  async sendHobbiesToBackend(hobbies) {
    try {
      const response = await fetch(window.API + '/user/hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: window.token || 'anonymous',
          hobbies: hobbies
        })
      });
      
      if (response.ok) {
        console.log('✅ İlgi alanları backend\'e gönderildi');
      }
    } catch (error) {
      console.error('❌ İlgi alanları gönderme hatası:', error);
    }
  }

  // Sayfa yüklendiğinde çalıştır
  init() {
    console.log('🎯 Kanal sistemi başlatılıyor...');
    
    // İlgi alanları varsa kanalları oluştur
    if (this.userHobbies.length > 0) {
      this.createHobbyChannels();
    } else {
      // Varsayılan kanalları göster
      this.renderChannels();
    }
    
    // İlgi alanları değiştiğinde dinle
    window.addEventListener('hobbiesUpdated', (event) => {
      this.updateHobbies(event.detail.hobbies);
    });
  }
}

// Global instance oluştur
window.channelSystem = new ChannelSystem();

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.channelSystem.init();
  }, 1000);
});

// İlgi alanları kaydedildiğinde tetikle
window.addEventListener('hobbiesSaved', (event) => {
  console.log('🎯 İlgi alanları kaydedildi, kanallar güncelleniyor...');
  window.channelSystem.updateHobbies(event.detail.hobbies);
});

console.log('✅ Kanal Sistemi yüklendi');
