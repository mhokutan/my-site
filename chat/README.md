# Hızlı Sohbet Uygulaması

Bu klasör, kullanıcıları hızlı şekilde eşleştiren ve kısa süre içinde eşleşme bulunamazsa yapay zekâ ile sohbet başlatan basit bir örnek uygulama içerir.

## Özellikler
- Takma ad ile giriş
- 1-1 hızlı sohbet için gerçek kullanıcı eşleştirmesi
- 5 saniye içinde kullanıcı bulunamazsa otomatik yapay zekâ sohbeti
- OpenAI API entegrasyonu
- Socket.io ile gerçek zamanlı mesajlaşma

## Kurulum
1. Bağımlılıkları yükleyin (depo kökünde):
   ```bash
   npm install
   ```
2. Bir `.env` dosyası oluşturup OpenAI anahtarınızı ekleyin:
   ```env
   OPENAI_API_KEY=YOUR_KEY_HERE
   ```
3. Sunucuyu başlatın:
   ```bash
   npm start
   ```
4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Not
Bu örnek basit olması için hazırlanmıştır; gerçek üretim ortamları için ek güvenlik ve hata kontrolleri gereklidir.
