# Çekirdek P2P Chat

Aşağıdaki yapı proje ana dizinin içini gösterir.

/ Cekirdek
- /app        - Expo Router (Sayfalar ve Navigasyon)
- /components - UI Bileşenleri (Atomic Design)
- /hooks      - Özel React Hook'ları (P2P mantığı)
- /services   - Altyapı köprüleri (Supabase, Simple-peer vb.)
- /server     - Python Twisted seeding motoru / sinyalleşme
- /assets     - Logolar, ikonlar ve örnek görseller
- .env        - Yerel ortam değişkenleri (gitignore yapılmalı)
- app.json    - Uygulama yapılandırması
- package.json- Bağımlılıklar
  
<p align="center">
  <img src="./Cekirdek-P2P/assets/cekirdek-entry.png" alt="Çekirdek Giriş" style="max-width:640px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.6);"/>
</p>

<table width="100%" border="0" style="border: none;">
  <tr style="border: none;">
    <!-- Yazıyı küçülttük (h1'den h3'e) -->
    <td style="border: none;"><h3>CekirdekChat</h3></td>
    <td align="right" style="border: none;">
      <!-- Fotoğrafı büyüttük (40'tan 200'e) ve yarı saydamlığı kaldırdık -->
      <img width="200" src="https://github.com/user-attachments/assets/25fa0d07-f8bf-4ba3-baac-a14cdc5d11b4" />
    </td>
  </tr>
</table>
