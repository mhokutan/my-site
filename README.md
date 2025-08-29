# One‑Time Chat (Frontend Only)
Rastgele eşleşme ile tek seferlik, P2P (WebRTC) metin sohbeti. **Tamamen istemci tarafı**: HTML + CSS + JavaScript.

## Nasıl Çalışır?
- **Eşleştirme**: Firebase Realtime Database üzerinde tek slotluk basit bir kuyruk (`/queue`). İlk kullanıcı kuyruğa yazılır, ikinci geldiğinde eşleştirir ve kuyruğu temizler.
- **Sohbet**: PeerJS ile WebRTC **DataChannel** üzerinden doğrudan eşler arası (P2P) metin aktarımı. Mesajlar sunucuda saklanmaz.

## Kurulum
1. Firebase projesi oluştur: https://console.firebase.google.com  
2. Realtime Database -> **Start in test mode** (deneme içindir).  
3. `app.js` içindeki `firebaseConfig` alanını kendi proje ayarlarınla doldur.  
4. `index.html`, `styles.css`, `app.js` dosyalarını GitHub Pages/Netlify ile yayınla.

> Not: Test modunda veritabanı herkese açık olabilir. Üretimde güvenlik kurallarını kısıtla.

### Örnek (çok basit) güvenlik kuralları
```json
{
  "rules": {
    "queue": {
      ".read": false,
      ".write": true,
      ".validate": "newData.isString() && newData.val().length < 64"
    }
  }
}
```

## Kullanım
- Sayfayı aç, **Sohbete Başla** butonuna bas.
- İlk gelen kullanıcı bekler; ikinci geldiğinde otomatik bağlanırlar.
- **Sonraki** ile mevcut sohbet kapanır ve yeni eş aramaya başlarsın.

## Uyarılar
- Bu proje eğitim amaçlıdır. Kişisel veri paylaşma.  
- P2P bağlantı bazı ağlarda çalışmayabilir (kurumsal ağ, NAT, firewall). Ev/cep internetinde genelde çalışır.

## Dağıtım (GitHub Pages)
- Bu repo içeriğini GitHub'a gönder.
- Settings → Pages → Source: Deploy from branch → `main` + `/ (root)`.
- 1–2 dk sonra site adresin: `https://kullaniciadiniz.github.io/repo-adiniz/`
