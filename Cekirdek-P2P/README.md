# Cekirdek-P2P

Bu dizin proje için ana yapıyı içerir.

- app/        — Expo Router ile sayfalar ve navigasyon
- components/ — UI bileşenleri
- hooks/      — Özel React hook'ları (P2P mantığı)
- services/   — Supabase, Simple-peer, Clerk gibi altyapı köprüleri
- server/     — Twisted seeding motoru veya HTTP signaling köprüsü
- assets/     — Logolar, ikonlar, örnek ekran görüntüleri

Aşağıdaki görsel giriş ekranı örneğidir (assets içinde):

<p align="center">
  <img src="./assets/cekirdek-entry.png" alt="Çekirdek Giriş" style="max-width:480px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.5);" />
</p>

Yerel test: .env dosyasını oluşturun (gitignore içine alın):

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
PORT=3000
```
