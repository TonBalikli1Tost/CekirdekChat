# 🧵 Çekirdek Chat - P2P Encrypted Messaging

Eskişehir'de 5 kişilik grup için tamamen **peer-to-peer**, **end-to-end encrypted** iletişim uygulaması.

## ✨ Özellikler

- **E2EE Encryption** - TweetNaCl.js ile tamamen şifrelenmiş mesajlar
- **Real-time Messaging** - Supabase Realtime ile canlı sohbet
- **Responsive Design** - Telefon, tablet, bilgisayar uyumlu
- **Dark Theme** - Göz dostu modern arayüz
- **Direct Login** - Email ile direkt giriş
- **Supabase Backend** - Güvenli, skallanabilir altyapı

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

- **Frontend**: React 18, Webpack, TweetNaCl.js, Supabase
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Encryption**: TweetNaCl.js (NaCl/Tweetnacl)
- **Deployment**: Vercel

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

- UI: https://cekirdek-chat.vercel.app (hazırlanıyor)
- Supabase: Realtime subscriptions aktif

---
**Geliştirme Ekibi - 2026**

