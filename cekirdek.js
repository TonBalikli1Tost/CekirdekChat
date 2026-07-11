// cekirdek.js — minimal server to run a small local UI and provide test AI endpoints
// Purpose: serve frontend (if present) and provide a small /cekirdek demo UI that uses Puter client examples.
// Reads configuration from environment variables (see .env.example). DO NOT commit real secrets.

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Serve existing frontend build if present (frontend/dist or frontend/public)
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const frontendPublic = path.join(__dirname, 'frontend', 'public');
const frontendRoot = path.join(__dirname, 'frontend');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  console.log('Serving static from frontend/dist');
} else if (fs.existsSync(frontendPublic)) {
  app.use(express.static(frontendPublic));
  console.log('Serving static from frontend/public');
} else if (fs.existsSync(frontendRoot)) {
  app.use(express.static(frontendRoot));
  console.log('Serving static from frontend/');
} else {
  console.log('No frontend found. / will show demo UI at /cekirdek');
}

// Simple echo endpoint for local testing
app.post('/api/echo', (req, res) => {
  const text = (req.body && req.body.text) ? String(req.body.text) : '';
  res.json({ reply: `Echo: ${text}` });
});

// /api/puter - proxy to Puter or placeholder
app.post('/api/puter', async (req, res) => {
  const { prompt, model } = req.body || {};

  // Avoid committing or using secrets from source. If PUTER_API_KEY is set in environment, attempt to proxy.
  if (!process.env.PUTER_API_KEY) {
    return res.status(501).json({
      error: 'Puter API key not configured on server. For local testing, set PUTER_API_KEY in a local .env (NOT committed).',
      example: {
        method: 'POST',
        path: '/api/puter',
        body: { prompt: 'Hello', model: 'gpt-5.4-nano' }
      }
    });
  }

  // Example: the Puter JS client is primarily client-side. If you have a Puter REST endpoint, implement proxy here.
  // For security, do not store or log secret values. This server returns a placeholder response.
  return res.json({ reply: `(Server proxy placeholder) Received prompt: "${prompt}" — model: "${model || 'default'}"` });
});

// Simple demo UI at /cekirdek that uses the Puter client script in-browser (unsafe to include secret keys client-side)
app.get('/cekirdek', (req, res) => {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Çekirdek — Demo Chat</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>body{font-family:Segoe UI,Roboto,Helvetica,Arial;margin:20px}#chat{max-width:720px}textarea{width:100%;height:80px}button{padding:8px 12px;margin-top:8px}</style>
</head>
<body>
  <h1>Çekirdek — Demo Chat</h1>
  <div id="chat">
    <textarea id="prompt" placeholder="Yazınız...">Merhaba, nasılsın?</textarea>
    <br />
    <button id="send">Send to /api/echo</button>
    <button id="puter">Try Puter (server must be configured)</button>
    <pre id="out"></pre>
  </div>

  <script>
    document.getElementById('send').onclick = async () => {
      const text = document.getElementById('prompt').value;
      const r = await fetch('/api/echo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const j = await r.json();
      document.getElementById('out').textContent = JSON.stringify(j, null, 2);
    };

    document.getElementById('puter').onclick = async () => {
      const text = document.getElementById('prompt').value;
      const r = await fetch('/api/puter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: text, model: 'gpt-5.4-nano' }) });
      const j = await r.json();
      document.getElementById('out').textContent = JSON.stringify(j, null, 2);
    };
  </script>

  <p style="margin-top:24px;color:#666">Not: Puter veya diğer API anahtarlarını yerel .env dosyanıza ekleyin (gitignore edilmiştir). Server proxy sadece placeholder cevap döner — gerçek Puter entegrasyonu için sunucu tarafı Puter REST endpoint dokümanına göre implementasyon gereklidir.</p>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Fallback: serve index.html from frontend if present
app.get('/', (req, res) => {
  const candidates = [
    path.join(frontendDist, 'index.html'),
    path.join(frontendPublic, 'index.html'),
    path.join(frontendRoot, 'index.html')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.redirect('/cekirdek');
});

app.listen(PORT, () => {
  console.log(`Çekirdek server listening on http://localhost:${PORT}`);
});
