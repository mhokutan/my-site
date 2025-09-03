const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Veri yapıları
const users = new Map();
const tokens = new Map();
const channels = new Map();
const userSessions = new Map();

// ===================== YENİ VERİ YAPILARI - Sponsor ve Akıllı Kanal Sistemi =====================
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

// ===================== MEVCUT API ENDPOINT'LERİ =====================

// Giriş
app.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = users.get(identifier);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
    }
    
    const token = jwt.sign({ userId: identifier }, 'secret', { expiresIn: '7d' });
    tokens.set(token, identifier);
    
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kayıt
app.post('/register', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (users.has(identifier)) {
      return res.status(400).json({ error: 'Kullanıcı zaten mevcut' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(identifier, { password: hashedPassword, profile: {} });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Profil güncelle
app.post('/profile/update', (req, res) => {
  const { token, profile } = req.body;
  if (!tokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  
  const userId = tokens.get(token);
  const user = users.get(userId);
  if (user) {
    user.profile = { ...user.profile, ...profile };
    users.set(userId, user);
  }
  
  res.json({ success: true });
});

// Feedback
app.post('/feedback', (req, res) => {
  const { token, text } = req.body;
  console.log('Feedback:', text);
  res.json({ success: true });
});

// Sponsor bot
app.post('/sponsor', (req, res) => {
  const { text } = req.body;
  const responses = [
    "Hepon Sigorta hakkında daha fazla bilgi için www.heponsigorta.com adresini ziyaret edebilirsiniz.",
    "Sigorta ihtiyaçlarınız için bizimle iletişime geçin!",
    "Hepon Sigorta - Güvenli gelecek için yanınızdayız."
  ];
  
  res.json({ answer: responses[Math.floor(Math.random() * responses.length)] });
});

// ===================== YENİ API ENDPOINT'LERİ =====================

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

// ===================== WEBSOCKET =====================
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'join') {
        ws.channel = message.channel;
        ws.nick = message.nick;
        ws.token = message.token;
        
        // Kanal istatistiklerini güncelle
        const stats = channelStats.get(message.channel);
        if (stats) {
          stats.userCount = (stats.userCount || 0) + 1;
          stats.lastActivity = Date.now();
        }
      }
      
      if (message.type === 'message') {
        // Kanal istatistiklerini güncelle
        const stats = channelStats.get(ws.channel);
        if (stats) {
          stats.messageCount = (stats.messageCount || 0) + 1;
          stats.lastActivity = Date.now();
        }
      }
      
      // Tüm istemcilere mesajı ilet
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.channel === ws.channel) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });
  
  ws.on('close', () => {
    // Kanal istatistiklerini güncelle
    if (ws.channel) {
      const stats = channelStats.get(ws.channel);
      if (stats) {
        stats.userCount = Math.max(0, (stats.userCount || 1) - 1);
      }
    }
  });
});

// ===================== SERVER BAŞLAT =====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log('📡 WebSocket aktif');
  console.log('💰 Sponsor kanal sistemi hazır');
  console.log('🎯 Akıllı kanal sistemi hazır');
  console.log('📍 Lokasyon sistemi hazır');
});

module.exports = app;
