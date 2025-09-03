# 🚀 Backend Güncelleme Talimatları

## Render Backend'e Eklenecek Kod

Aşağıdaki kodu Render'daki `server.js` dosyanızın **sonuna** ekleyin:

```javascript
// ===================== YENİ VERİ YAPILARI =====================
const sponsorChannels = new Map();  // channelId -> { owner, region, price, priority, created }
const channelStats = new Map();     // channelName -> { userCount, messageCount, lastActivity }
const userLocations = new Map();    // userId -> { country, city, region }
const sponsorPrices = new Map();    // region -> { basePrice, demand, supply }

// Sponsor kanal fiyat hesaplama
function calculateSponsorPrice(region) {
  const base = sponsorPrices.get(region) || { basePrice: 10, demand: 1, supply: 1 };
  const marketPrice = base.basePrice * (base.demand / base.supply);
  return Math.max(5, Math.min(100, marketPrice)); // 5-100$ arası
}

// Bölgesel sponsor kanalları getir
function getRegionalSponsorChannels(userRegion) {
  const regionalChannels = [];
  for (const [channelId, data] of sponsorChannels) {
    if (data.region === userRegion) {
      regionalChannels.push({
        id: channelId,
        name: data.name,
        price: data.price,
        priority: data.priority
      });
    }
  }
  return regionalChannels.sort((a, b) => b.priority - a.priority).slice(0, 10);
}

// İlgi alanlarına göre kanal öner
function getSuggestedChannels(hobbies) {
  const suggestions = [];
  const hobbyChannels = {
    'Yapay Zekâ': ['#yapayzeka', '#teknoloji', '#ai', '#chatgpt', '#openai'],
    'Teknoloji': ['#teknoloji', '#sohbet'],
    'Yazılım': ['#yazilim', '#teknoloji'],
    'Futbol': ['#futbol', '#spor', '#fenerbahce', '#galatasaray'],
    'Müzik': ['#muzik', '#sohbet'],
    'Film': ['#film', '#sinema', '#netflix'],
    'Basketbol': ['#basketbol', '#spor', '#nba'],
    'Oyun': ['#oyun', '#gaming', '#valorant', '#lol'],
    'Anime': ['#anime', '#manga'],
    'Kitap': ['#kitap', '#okuma']
  };

  hobbies.forEach(hobby => {
    if (hobbyChannels[hobby]) {
      suggestions.push(...hobbyChannels[hobby]);
    }
  });

  return [...new Set(suggestions)];
}

// ===================== YENİ API ENDPOINT'LERİ =====================

// Sponsor kanal oluştur
app.post('/sponsor/create', (req, res) => {
  const { token, channelName, region, duration } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const channelId = `sponsor_${Date.now()}`;
  const price = calculateSponsorPrice(region);
  
  sponsorChannels.set(channelId, {
    owner: userId,
    name: channelName,
    region,
    price,
    priority: 1,
    created: new Date(),
    duration
  });
  
  res.json({ success: true, channelId, price });
});

// Bölgesel sponsor kanalları getir
app.post('/sponsor/regional', (req, res) => {
  const { token, region } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const channels = getRegionalSponsorChannels(region);
  res.json({ success: true, channels });
});

// Kanal listesi getir
app.post('/channels/list', (req, res) => {
  const { token, hobbies } = req.body;
  
  // İlgi alanlarına göre öneriler
  const suggested = getSuggestedChannels(hobbies || []);
  
  // Popüler kanallar
  const popular = Array.from(channelStats.entries())
    .sort((a, b) => b[1].userCount - a[1].userCount)
    .slice(0, 20)
    .map(([name, stats]) => ({ name, ...stats }));
  
  res.json({ success: true, suggested, popular });
});

// Kullanıcı lokasyonu güncelle
app.post('/user/location', (req, res) => {
  const { token, country, city } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  userLocations.set(userId, {
    country,
    city,
    region: `${country}_${city}`
  });
  
  res.json({ success: true });
});

console.log('🚀 Yeni endpoint\'ler eklendi!');
```

## Adımlar:

1. **Render Dashboard'a gidin**
2. **Projenizi bulun** (Chat Backend)
3. **server.js dosyasını düzenleyin**
4. **Yukarıdaki kodu sonuna ekleyin**
5. **Deploy edin**
6. **Test edin**

## Test:

Deploy tamamlandıktan sonra:
- İlgi alanları seçin
- Lokasyon ayarlayın
- Kanal ekleyin

Her şey çalışmalı! 🎉
