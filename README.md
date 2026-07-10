# 🧵 Çekirdek Chat - P2P Encrypted Messaging

Eskişehir'de 5 kişilik grup için tamamen **peer-to-peer**, **end-to-end encrypted** iletişim uygulaması.

## ✨ Özellikler

- **E2EE Encryption** - TweetNaCl.js ile tamamen şifrelenmiş mesajlar
- **Local-first Messaging** - Sunucuya bağlı olmayan, yerel P2P odaklı iletişim
- **Responsive Design** - Telefon, tablet, bilgisayar uyumlu
- **Dark Theme** - Göz dostu modern arayüz
- **Direct Login** - Yerel kullanıcı kimliği ile giriş
- **No Supabase** - Harici servis bağımlılığı yok

## 🚀 Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm start
# http://localhost:8080
```

### Backend (Python)
```bash
cd backend-python
pip install -r requirements.txt
python server.py
# Port 9999
```

## 📦 Tech Stack

- **Frontend**: React 18, Webpack, TweetNaCl.js
- **Backend**: Yerel P2P akışı ve kullanıcı kimliği
- **Encryption**: TweetNaCl.js (NaCl/Tweetnacl)
- **Deployment**: Yerel çalıştırma odaklı

## 📁 Yapı

```
├── frontend/              # React UI
│  ├── src/
│  │  ├── components/      # ChatScreen, AuthPanel, etc.
│  │  └── services/        # encryptionService, supabaseClient
│  └── package.json
├── backend-python/        # P2P Signaling Server
├── supabase/              # Database schema
├── vercel.json            # Deployment config
└── package.json
```

## 🔐 Security

- **TweetNaCl.js** E2EE ile tüm mesajlar şifrelenmiş
- **Supabase RLS** ile sadece auth users mesaj gönderebilir
- **Row-Level Security** ile veri izolasyonu

## 🌐 Live

- UI: Yerel olarak http://localhost:8080 adresinden açılır
- Bağlı servis: Yok, tamamen yerel deneyim

---
**Geliştirme Ekibi - 2026**

