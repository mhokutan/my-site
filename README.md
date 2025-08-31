# Kategorili Hızlı Sohbet

Bu proje, GitHub Pages üzerinde çalışacak statik bir sohbet arayüzüdür. WebSocket sunucusu verilmediğinde demo botu devreye girer.

## Özellikler

- Kategorilere göre sohbet (Genel Sohbet, Teknoloji, Oyun, Spor, Film & Dizi, Müzik, Eğitim & Öğrenme)
- Rumuz seçme modali
- Light/Dark tema değiştirici
- WebSocket entegrasyonu (join, message, system, paired, unpaired, typing)
- Demo Bot (600-1200ms gecikmeli yanıtlar, kategoriye göre sorular)
- Mesaj baloncukları, gönderildi/okundu simülasyonu
- Mesaj düzenleme/silme (10 sn içinde)
- Emoji reaksiyonları (👍❤️😂😮😢)
- Anket mesajları (`/poll soru | seçenek1 | seçenek2`)
- Kaybolan mesaj (`/vanish mesaj`)
- 25 mesaj veya 3 dakika sonra sohbet sonlandırma önerisi

## Kullanım

Dosyaları GitHub Pages deposunun köküne yerleştirin.  `CONFIG.WS_URL` değerini gerçek bir WebSocket adresi ile güncellerseniz gerçek zamanlı sohbet mümkündür.

## Geliştirme

Bu proje düz HTML/CSS/JS kullanır, bağımlılık yoktur. Test veya derleme adımı gerekmez.
