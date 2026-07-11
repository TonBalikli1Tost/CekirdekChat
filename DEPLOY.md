Çekirdek — Hızlı Deploy Rehberi

Bu dosya, repo için hızlı deploy / hosting seçeneklerini açıklar ve hazır config dosyalarını gösterir.

1) Vercel (frontend)
- Frontend yapılandırması zaten vercel.json içinde mevcuttur.
- Yapılacaklar:
  - Vercel dashboard'da proje bağlayın (GitHub repo).
  - Çevre değişkenlerini (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY) Vercel UI üzerinden ekleyin veya Vercel Secret'ları kullanın.
  - Auto deploy aktifse, yeni branch push edildiğinde deploy başlar.

2) Render (Twisted seeding server)
- render.yaml eklendi; backend-python/ içindeki Dockerfile ile bir web service (Docker) oluşturmak üzere yapılandırıldı.
- Yapılacaklar:
  - Render account oluşturun veya giriş yapın.
  - New → Web Service → "Connect a repository" seçeneği ile bu repo'yu seçin.
  - render.yaml bulunduğu için Render otomatikleştirilmiş kurulum sunacaktır.
  - SEED_PORT gibi çevre değişkenlerini Render dashboard'da kontrol edin.

3) STUN (WebRTC NAT traversal)
- frontend/stun-servers.json dosyası eklendi; uygulamanızın RTCPeerConnection oluştururken bu listeyi kullanabilirsiniz.
- Örnek (frontend tarafı):
  const config = { iceServers: require('./stun-servers.json').stunServers };

4) Hugging Face Spaces (opsiyonel)
- Spaces doğrudan bir Twisted UDP sunucusunu barındırmak için ideal olmayabilir; Spaces çoğunlukla HTTP/Streamlit/Gradio uygulamaları içindir.
- Eğer Twisted tabanlı bir işlevsellik yerine HTTP sinyalleşme isterseniz, örnek bir FastAPI/Flask sinyalleşme köprüsü oluşturup spaces/ veya backend-python-http/ dizinine koyabilirsiniz.

5) Supabase
- Supabase ile ilgili schema ve env örnekleri .env.example içinde ve supabase/schema.sql içinde mevcuttur.
- Supabase dashboard üzerinden proje oluşturup .env değerlerini Vercel/Render ortam değişkenlerine ekleyin.

Güvenlik uyarısı
- Gerçek API anahtarlarını (PUTER_API_KEY, REWIND API key, OpenAI secret) asla repoya commit etmeyin. .env ve .vscode/ gibi dosyalar .gitignore içinde tutuluyor.

Nasıl devam edeyim?
- Hazır konfigürasyonları repoya ekledim: backend-python/Dockerfile, render.yaml, frontend/stun-servers.json, DEPLOY.md
- İsterseniz:
  • Render'da servis oluşturmayı deneyebilirim fakat bunun için sizin Render hesabınıza erişim veya API token gerekir (gizli bilgi).
  • Vercel için deploy talimatlarını çalıştırıp otomatik deploy'u başlatabilirim (Vercel token gerektirir).
  • Ya da ben hazırlıkları tamamlayayım, siz hesabınızla bağlanıp birkaç tıklamayla deploy edin.

Not: Oluşturduğum branch: merge/external-ui-into-main-<timestamp> (origin üzerinde mevcut). Pull request sayfası repo üzerinde önerildi.
