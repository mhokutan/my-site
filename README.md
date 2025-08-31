# One‑Time Chat (Frontend Only)
Rastgele eşleşme ile tek seferlik, P2P (WebRTC) metin sohbeti. **Tamamen istemci tarafı**: HTML + CSS + JavaScript.

## Nasıl Çalışır?
- **Eşleştirme**: Firebase Realtime Database üzerinde tek slotluk basit bir kuyruk (`/queue`). İlk kullanıcı kuyruğa yazılır, ikinci geldiğinde eşleştirir ve kuyruğu temizler.
- **Sohbet**: PeerJS ile WebRTC **DataChannel** üzerinden doğrudan eşler arası (P2P) metin aktarımı. Mesajlar sunucuda saklanmaz.
- **Yapay Zeka Yedeği**: 5 saniye içinde başka bir kullanıcı bulunamazsa OpenAI Chat Completions API'si aracılığıyla basit bir yapay zeka eşleşmesi yapılır.

## Kurulum
1. Firebase projesi oluştur: https://console.firebase.google.com  
2. Realtime Database -> **Start in test mode** (deneme içindir).  
3. `app.js` içindeki `firebaseConfig` alanını kendi proje ayarlarınla doldur.
4. `.env.example` dosyasını `.env` olarak kopyala ve OpenAI API anahtarı ile OAuth bilgilerini doldur:
   ```
   cp .env.example .env
   # .env içinde OPENAI_API_KEY ve GOOGLE_CLIENT_ID/SECRET değerlerini düzenle
   ```
5. Gerekli paketleri yükle: `npm install`.
6. Tarayıcıya gerekli OAuth bilgilerini aktarmak için `node inject-env.js` komutunu çalıştır (bu, `env.js` dosyasını üretir).
7. Sunucuyu başlat: `node server.js` (statik dosyaları ve `/api/ai` uç noktasını sağlar).
8. `index.html`, `styles.css`, `app.js` dosyalarını ve üretilen `env.js`'i (git'e ekleme) yayınla.

### Yapay Zeka Kullanımı
Tarayıcı OpenAI API anahtarına doğrudan erişmez. `server.js`, `.env` dosyasındaki `OPENAI_API_KEY` değerini kullanarak OpenAI API'sine istek yapar. Anahtar tanımlanmazsa yapay zeka modu devre dışı kalır ancak sunucu çalışmaya devam eder.

### OpenAI API'ye `curl` ile örnek istek

```bash
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "yapay zekâ hakkında bir haiku yaz"}]
  }'
```

### Google OAuth
Google ile kimlik doğrulaması için `.env` dosyasındaki `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` değerlerini doldur.

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

## Buton Örneği
`button-demo.html` dosyası, "Değiştir" ve "Geç" butonlarının nasıl eklenebileceğini gösteren basit bir örnek içerir. Butonlara tıklayınca sohbet alanına bir mesaj eklenir.
