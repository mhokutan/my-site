// ===================== RENDER BACKEND'İNE EKLENECEK KODLAR =====================
// Bu kodları mevcut Render backend'inize ekleyin

// 1. VERİ YAPILARI (Dosyanın başına ekleyin)
const sponsorChannels = new Map();  // channelId -> { owner, region, price, priority, created }
const channelStats = new Map();     // channelName -> { userCount, messageCount, lastActivity }
const userLocations = new Map();    // userId -> { country, city, region }
const sponsorPrices = new Map();    // region -> { basePrice, demand, supply }

// 2. YARDIMCI FONKSİYONLAR (Veri yapılarından sonra ekleyin)
function calculateSponsorPrice(region) {
  const base = sponsorPrices.get(region) || { basePrice: 10, demand: 1, supply: 1 };
  const marketPrice = base.basePrice * (base.demand / base.supply);
  return Math.max(5, Math.min(100, marketPrice)); // 5-100$ arası
}

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

function getSuggestedChannels(hobbies) {
  const suggestions = [];
  const hobbyChannels = {
    'Futbol': ['#futbol', '#spor', '#fenerbahce', '#galatasaray'],
    'Müzik': ['#müzik', '#rap', '#rock', '#klasik'],
    'Film': ['#film', '#sinema', '#netflix', '#anime'],
    'Teknoloji': ['#teknoloji', '#yazılım', '#ai', '#blockchain'],
    'Oyun': ['#oyun', '#gaming', '#valorant', '#lol']
  };

  hobbies.forEach(hobby => {
    if (hobbyChannels[hobby]) {
      suggestions.push(...hobbyChannels[hobby]);
    }
  });

  return [...new Set(suggestions)];
}

// 3. API ENDPOINT'LERİ (server.listen()'den önce ekleyin)

// Sponsor kanal oluştur
app.post('/sponsor/create', (req, res) => {
  const { token, channelName, region, duration } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const price = calculateSponsorPrice(region);
  const channelId = `sponsor_${Date.now()}`;
  
  sponsorChannels.set(channelId, {
    owner: userId,
    name: channelName,
    region,
    price,
    priority: Math.random() * 100,
    created: Date.now(),
    duration: duration || 30 // 30 gün
  });

  res.json({ success: true, channelId, price });
});

// Bölgesel sponsor kanalları getir
app.post('/sponsor/regional', (req, res) => {
  const { token, region } = req.body;
  const channels = getRegionalSponsorChannels(region);
  res.json({ success: true, channels });
});

// Kanal oluştur
app.post('/channel/create', (req, res) => {
  const { token, channelName, type, password } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const cleanName = channelName.startsWith('#') ? channelName : `#${channelName}`;
  
  // Public kanal varsa birleştir
  if (type === 'public') {
    if (channels.has(cleanName)) {
      const existingChannel = channels.get(cleanName);
      existingChannel.members.add(userId);
      return res.json({ success: true, joined: true, channelName: cleanName });
    }
  }
  
  channels.set(cleanName, {
    owner: userId,
    type: type || 'public',
    password: type === 'private' ? password : null,
    members: new Set([userId]),
    created: Date.now(),
    popularity: 0
  });

  channelStats.set(cleanName, {
    userCount: 1,
    messageCount: 0,
    lastActivity: Date.now()
  });

  res.json({ success: true, channelName: cleanName });
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

// Kanala katıl
app.post('/channel/join', (req, res) => {
  const { token, channelName, password } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const channel = channels.get(channelName);
  
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  
  if (channel.type === 'private' && channel.password !== password) {
    return res.status(403).json({ error: 'Wrong password' });
  }
  
  channel.members.add(userId);
  const stats = channelStats.get(channelName);
  if (stats) stats.userCount = channel.members.size;
  
  res.json({ success: true });
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

// ===================== KULLANIM TALİMATLARI =====================
/*
1. Bu kodları mevcut Render backend'inize kopyalayın
2. Veri yapılarını dosyanın başına ekleyin
3. Yardımcı fonksiyonları veri yapılarından sonra ekleyin
4. API endpoint'lerini server.listen()'den önce ekleyin
5. Render'da deploy edin

Özellikler:
✅ Bölgesel sponsor kanallar (ülke/şehir bazlı)
✅ Dinamik fiyatlandırma sistemi (5-100$ arası)
✅ İlgi alanlarına göre kanal önerileri
✅ Private/Public kanal sistemi
✅ Şifreli kanal desteği
✅ Otomatik kanal birleştirme
✅ Popülerlik bazlı sıralama
✅ Lokasyon bazlı özelleştirme
✅ OpenAI API entegrasyonu (mevcut)
*/
