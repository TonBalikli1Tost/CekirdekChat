# Çekirdek Chat

Minimalist, keskin köşeli ve hafif bir P2P iletişim projesi başlangıcı.

## Yapı

- frontend/
  - App.js
  - app.json
  - webpack.config.js
  - src/services/
  - src/components/
- backend-python/
  - server.py
  - requirements.txt
- supabase/
  - schema.sql
  - cleanup_trigger.sql

## Başlatma

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend:

```bash
cd backend-python
pip install -r requirements.txt
python server.py
```

