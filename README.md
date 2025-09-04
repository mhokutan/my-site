# 🚀 Gelişmiş Sohbet Uygulaması

Bu proje, sponsor kanallar ve akıllı kanal sistemi içeren gelişmiş bir sohbet uygulamasıdır.

## ✨ Özellikler

### 💰 Sponsor Kanal Sistemi
- Bölgesel sponsor kanallar (ülke/şehir bazlı)
- Dinamik fiyatlandırma sistemi (5-100$ arası)
- 7-60 gün arası süre seçenekleri
- Lokasyon bazlı özelleştirme

### 🎯 Akıllı Kanal Sistemi
- İlgi alanlarına göre kanal önerileri
- Private/Public kanal oluşturma
- Şifreli kanal desteği
- Otomatik kanal birleştirme
- Popülerlik bazlı sıralama

### 📍 Lokasyon Sistemi
- Ülke/şehir seçimi
- Sponsor kanallar için lokasyon bazlı özelleştirme

## 🛠️ Kurulum

### 1. Node.js Yükleyin
- [Node.js](https://nodejs.org/) sitesinden Node.js'i indirin ve yükleyin
- Terminal'de `node --version` komutu ile kontrol edin

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Server'ı Başlatın
```bash
npm start
```

### 4. Tarayıcıda Açın
- `http://localhost:3000` adresine gidin
- Veya `index.html` dosyasını doğrudan açın

## 🎮 Kullanım

### Sponsor Kanal Oluşturma
1. "💰 Sponsor" butonuna tıklayın
2. Kanal adı girin (örn: "istanbul-restoranlar")
3. Süre seçin (7-60 gün)
4. "Oluştur" butonuna tıklayın

### Lokasyon Ayarlama
1. "📍 Lokasyon" butonuna tıklayın
2. Ülke ve şehir seçin
3. "Kaydet" butonuna tıklayın

### Kanal Oluşturma
1. "Yeni Kanal Oluştur" butonuna tıklayın
2. Kanal adı girin
3. Public/Private seçin
4. Private ise şifre belirleyin
5. "Oluştur" butonuna tıklayın

## 📁 Dosya Yapısı

```
my-site/
├── server.js              # Backend server
├── app.js                 # Frontend JavaScript
├── index.html             # Ana sayfa
├── styles.css             # CSS stilleri
├── advanced-features.js   # Yeni özellikler
├── package.json           # Node.js bağımlılıkları
└── README.md              # Bu dosya
```

## 🔧 API Endpoint'leri

### Sponsor Kanallar
- `POST /sponsor/create` - Sponsor kanal oluştur
- `POST /sponsor/regional` - Bölgesel sponsor kanalları getir

### Kanallar
- `POST /channel/create` - Kanal oluştur
- `POST /channel/join` - Kanala katıl
- `POST /channels/list` - Kanal listesi getir

### Kullanıcı
- `POST /user/location` - Lokasyon güncelle
- `POST /login` - Giriş yap
- `POST /register` - Kayıt ol

## 🎨 Görsel Özellikler

- **Sponsor kanallar**: Altın renkte
- **Önerilen kanallar**: Mavi renkte
- **Popüler kanallar**: Kırmızı renkte
- **Hover efektleri**: Smooth geçişler
- **Responsive tasarım**: Mobil uyumlu

## 🚀 Geliştirme

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📝 Notlar

- Tüm veriler memory'de saklanır (server yeniden başlatıldığında sıfırlanır)
- WebSocket bağlantısı real-time mesajlaşma için kullanılır
- JWT token'lar 7 gün geçerlidir
- Şifreler bcrypt ile hash'lenir

## 🎯 Gelecek Özellikler

- [ ] Veritabanı entegrasyonu
- [ ] Dosya paylaşımı
- [ ] Emoji reaksiyonları
- [ ] Sesli mesajlar
- [ ] Video aramalar
- [ ] Bot sistemi

---

**Geliştirici**: Hazim  
**Versiyon**: 4.4.3  
**Lisans**: MIT