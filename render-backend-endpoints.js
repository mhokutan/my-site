// ===================== RENDER BACKEND'E EKLENMESİ GEREKEN ENDPOINT'LER =====================

// Bu kodu Render'daki server.js dosyanıza ekleyin

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
    // Spor
    'Futbol': ['#futbol', '#spor', '#fenerbahce', '#galatasaray', '#besiktas', '#trabzonspor'],
    'Basketbol': ['#basketbol', '#spor', '#nba', '#euroleague'],
    'Voleybol': ['#voleybol', '#spor'],
    'Koşu': ['#kosu', '#spor', '#maraton'],
    'Fitness': ['#fitness', '#spor', '#gym'],
    'Yüzme': ['#yuzme', '#spor'],
    'Tenis': ['#tenis', '#spor'],
    'MMA': ['#mma', '#spor', '#ufc'],
    'Dalış': ['#dalis', '#spor'],
    'Kamp': ['#kamp', '#spor', '#dogada'],
    
    // Oyunlar
    'Bilgisayar Oyunları': ['#oyun', '#gaming', '#pc'],
    'Mobil Oyunlar': ['#mobiloyun', '#gaming'],
    'CS:GO': ['#csgo', '#oyun', '#gaming'],
    'LoL': ['#lol', '#oyun', '#gaming'],
    'Valorant': ['#valorant', '#oyun', '#gaming'],
    'Satranç': ['#satranc', '#oyun'],
    
    // Eğlence
    'Film': ['#film', '#sinema', '#netflix'],
    'Dizi': ['#dizi', '#netflix', '#sohbet'],
    'Anime': ['#anime', '#manga'],
    'Belgesel': ['#belgesel'],
    
    // Müzik
    'Müzik': ['#muzik', '#sohbet'],
    'Rock': ['#rock', '#muzik'],
    'Rap': ['#rap', '#muzik'],
    'Klasik': ['#klasik', '#muzik'],
    'Piyano': ['#piyano', '#muzik'],
    'Gitar': ['#gitar', '#muzik'],
    'DJ': ['#dj', '#muzik'],
    
    // Kitap & Eğitim
    'Kitap': ['#kitap', '#okuma'],
    'Roman': ['#roman', '#kitap'],
    'Şiir': ['#siir', '#kitap'],
    'Kişisel Gelişim': ['#kisiselgelisim'],
    'Felsefe': ['#felsefe'],
    
    // Yemek
    'Yemek': ['#yemek', '#tarif'],
    'Tatlı': ['#tatli', '#yemek'],
    'Kahve': ['#kahve', '#yemek'],
    'Çay': ['#cay', '#yemek'],
    'Barbekü': ['#barbeku', '#yemek'],
    'Vegan': ['#vegan', '#yemek'],
    
    // Teknoloji
    'Teknoloji': ['#teknoloji', '#sohbet'],
    'Yazılım': ['#yazilim', '#teknoloji'],
    'Yapay Zekâ': ['#yapayzeka', '#teknoloji', '#ai', '#chatgpt', '#openai'],
    'Siber Güvenlik': ['#siberguvenlik', '#teknoloji'],
    'Kripto': ['#kripto', '#teknoloji', '#bitcoin', '#blockchain'],
    'Web Tasarım': ['#webtasarim', '#teknoloji'],
    'Mobil Uygulama': ['#mobiluygulama', '#teknoloji'],
    'Veri Bilimi': ['#veribilimi', '#teknoloji', '#ai'],
    'Makine Öğrenmesi': ['#makineogrenmesi', '#teknoloji', '#ai'],
    
    // Sanat & Tasarım
    'Seyahat': ['#seyahat', '#tatil'],
    'Fotoğraf': ['#fotograf', '#sanat'],
    'Doğa': ['#doga', '#seyahat'],
    'Resim': ['#resim', '#sanat'],
    'Heykel': ['#heykel', '#sanat'],
    'Tasarım': ['#tasarim', '#sanat'],
    'Moda': ['#moda', '#tasarim'],
    
    // Araçlar
    'Araba': ['#araba', '#otomobil'],
    'Motosiklet': ['#motosiklet'],
    'Drone': ['#drone', '#teknoloji'],
    'RC': ['#rc', '#oyun'],
    'Model': ['#model', '#hobi'],
    
    // Dil & Eğitim
    'Dil Öğrenme': ['#dilogrenme'],
    'İngilizce': ['#ingilizce', '#dilogrenme'],
    'Almanca': ['#almanca', '#dilogrenme'],
    'İspanyolca': ['#ispanyolca', '#dilogrenme'],
    'Türkçe': ['#turkce', '#dilogrenme'],
    
    // İş & Finans
    'Girişimcilik': ['#girisimcilik'],
    'Pazarlama': ['#pazarlama'],
    'E-ticaret': ['#eticaret'],
    'Yatırım': ['#yatirim'],
    'Borsa': ['#borsa', '#yatirim'],
    
    // Sağlık & Wellness
    'Sağlık': ['#saglik'],
    'Psikoloji': ['#psikoloji'],
    'Meditasyon': ['#meditasyon'],
    'Yoga': ['#yoga'],
    'Mindfulness': ['#mindfulness']
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

// Kanal oluştur
app.post('/channel/create', (req, res) => {
  const { token, channelName, type, password } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const channel = channels.get(channelName);
  
  if (channel) {
    // Mevcut kanala katıl
    channel.members.add(userId);
    const stats = channelStats.get(channelName);
    if (stats) stats.userCount = channel.members.size;
    
    res.json({ success: true, joined: true, channelName });
  } else {
    // Yeni kanal oluştur
    channels.set(channelName, {
      members: new Set([userId]),
      type: type || 'public',
      password: password || null,
      created: new Date()
    });
    
    channelStats.set(channelName, {
      userCount: 1,
      messageCount: 0,
      lastActivity: new Date()
    });
    
    res.json({ success: true, joined: false, channelName });
  }
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

console.log('🚀 Yeni endpoint\'ler eklendi: Sponsor kanallar, Akıllı kanal sistemi, Lokasyon sistemi');
