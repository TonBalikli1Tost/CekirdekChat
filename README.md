#  Çekirdek Chat - P2P Encrypted Messaging

Eskişehir'de 5 kişilik grup için tamamen **peer-to-peer**, **end-to-end encrypted** iletişim uygulaması.

**Version:** 0.1.0 | **Status:** Beta

##  Özellikler

- **E2EE Encryption** - TweetNaCl.js ile tamamen şifrelenmiş mesajlar
- **Real-time Messaging** - Supabase Realtime ile canlı sohbet
- **Responsive Design** - Telefon, tablet, bilgisayar uyumlu
- **Dark Theme** - Göz dostu modern arayüz
- **Direct Login** - Email ile direkt giriş
- **Supabase Backend** - Güvenli, skallanabilir altyapı
- **Production Ready** - Rate limiting, error handling, monitoring

##  Quick Start

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

##  Tech Stack

- **Frontend**: React 18, Webpack 5, TweetNaCl.js, Supabase
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Encryption**: TweetNaCl.js (NaCl/Tweetnacl)
- **Deployment**: Vercel
- **Monitoring**: Custom error tracking & performance monitoring

##  Yapı

```
├── frontend/              # React UI
│  ├── src/
│  │  ├── components/      # ChatScreen, AuthPanel, etc.
│  │  └── services/        # encryption, supabase, p2p, monitoring
│  └── package.json
├── backend-python/        # P2P Signaling Server
├── supabase/              # Database schema
├── vercel.json            # Vercel deployment config
├── .env.example           # Environment variables template
└── package.json           # Root configuration
```

##  Security

- **TweetNaCl.js** E2EE ile tüm mesajlar şifrelenmiş
- **Supabase RLS** ile sadece auth users mesaj gönderebilir
- **Row-Level Security** ile veri izolasyonu
- **CSP Headers** ile XSS koruması
- **HSTS** ile Man-in-the-Middle koruması
- **Rate Limiting** ile brute-force/DDoS koruması

##  Live Deployment

- **UI**: https://cekirdek-chat.vercel.app
- **Supabase Project**: Production database & auth
- **Real-time Updates**: WebSocket connection via Supabase Realtime

### Deployment Info
- **Platform**: Vercel (Auto-deploy on push to main)
- **Environment Variables**: Configured in Vercel Project Settings
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

##  Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
BACKEND_PORT=9999
```

See `.env.example` for more details.

##  Production Checklist

- ✅ Webpack optimization & code splitting
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Error handling & monitoring
- ✅ Performance monitoring
- ✅ Rate limiting
- ✅ Health checks
- ✅ Cache optimization
- ✅ Vercel deployment configured
- ✅ Supabase RLS policies
- ✅ Babel dependency resolution

##  Contributors

- **TonBalikli1Tost** - Lead Developer
- **Copilot** - AI Assistant, Production optimization

---

**Geliştirme Ekibi - 2026**

### Vercel Deployment Status
Latest deployment status and logs available at: https://vercel.com/dashboard/projects

### Support & Issues
For bugs, feature requests, or improvements, please create an issue in the GitHub repository.

