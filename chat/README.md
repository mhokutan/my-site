# Kategori Tabanlı Hızlı Sohbet

Bu klasör, kullanıcıların kategori seçerek hızlıca eşleştiği ve kullanıcı bulunamazsa yapay zekâ ile sohbet edebildiği örnek bir uygulama içerir.

## Özellikler
- Takma ad ile giriş
- Kategorilere göre 1-1 eşleştirme
- Eşleşme yoksa OpenAI ile sohbet
- Gerçek zamanlı mesajlaşma (Socket.io)
- "Yazıyor" göstergesi
- Mesaj gönderildi / okundu bilgisi
- Mesaj düzenleme ve silme
- 30 sn sonra kaybolan mesajlar
- Emoji reaksiyonları
- Anket oluşturma ve oy kullanma
- Taş-kağıt-makas mini oyunu
- Tema ve arka plan seçimi
- Basit küfür filtresi

## Kurulum
1. Bağımlılıkları yükleyin (repo kökünde):
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
Bu örnek eğitim amaçlıdır; gerçek ortamlar için ek güvenlik ve kalıcılık önlemleri gerekir.
