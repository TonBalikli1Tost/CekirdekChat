# Çekirdek P2P

Aşağıdaki yapı proje ana dizini için önerilen düzeni gösterir.

/ Cekirdek-P2P

- /app        - Expo Router (Sayfalar ve Navigasyon)
- /components - UI Bileşenleri (Atomic Design)
- /hooks      - Özel React Hook'ları (P2P mantığı)
- /services   - Altyapı köprüleri (Supabase, Simple-peer vb.)
- /server     - Python Twisted seeding motoru / sinyalleşme
- /assets     - Logolar, ikonlar ve örnek görseller
- .env        - Yerel ortam değişkenleri (gitignore yapılmalı)
- app.json    - Uygulama yapılandırması
- package.json- Bağımlılıklar

Görsel: Giriş ekranı (demo). Aşağıdaki görüntü repo içindeki Cekirdek-P2P/assets klasöründen yüklenir.

<p align="center">
  <img src="./Cekirdek-P2P/assets/cekirdek-entry.png" alt="Çekirdek Giriş" style="max-width:640px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.6);"/>
</p>
