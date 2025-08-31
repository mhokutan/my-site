# Hızlı Sohbet

Bu proje, kullanıcıların seçtikleri kategoriye göre başka bir kullanıcıyla 1-1 sohbet etmelerini sağlar. Aynı kategoride çevrimiçi kullanıcı yoksa, sohbet otomatik olarak yapay zekâ ile başlar.

## Özellikler
- Profil bölümünden rumuz belirleme
- Sol tarafta hashtag (#) ile başlayan kategori listesi
- Ülke ve şehir seçerek veya elle kategori ekleme
- WebSocket ile gerçek zamanlı eşleştirme
- Kategoriye göre OpenAI desteği

## Kurulum
1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. OpenAI anahtarınızı içeren `.env` dosyası oluşturun:
   ```
   OPENAI_API_KEY=ANAHTARINIZ
   ```
3. Sunucuyu çalıştırın:
   ```bash
   npm start
   ```
4. Tarayıcıdan `http://localhost:3000` adresine gidin.

## Kategoriler
- #Teknoloji
- #Oyun
- #Genel Sohbet
- #Spor
- Özel kategoriler (#Türkiye-İstanbul gibi)

Bu proje eğitim amaçlıdır.
