const WebSocket = require('ws');
const port = process.env.SIGNAL_PORT || 9003;
const wss = new WebSocket.Server({ port });

const rooms = new Map();

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch (e) {}
}

wss.on('connection', (ws) => {
  ws.room = null;
  ws._id = Math.random().toString(36).slice(2,9);
  ws.on('message', (msg) => {
    let d;
    try { d = JSON.parse(msg.toString()); } catch (e) { return; }
    const { type, room, target, payload } = d;
    if (type === 'join') {
      ws.room = room || 'default';
      if (!rooms.has(ws.room)) rooms.set(ws.room, new Set());
      rooms.get(ws.room).add(ws);
      const peers = Array.from(rooms.get(ws.room)).filter(s=>s!==ws).map(s=>s._id || null);
      send(ws, { type: 'peers', peers });
      rooms.get(ws.room).forEach(s => { if (s!==ws) send(s, { type: 'peer-joined', id: ws._id || null }); });
    } else if (type === 'signal') {
      if (ws.room && rooms.has(ws.room)) {
        if (target) {
          for (const s of rooms.get(ws.room)) { if ((s._id||null) === target) send(s, { type: 'signal', from: ws._id||null, payload }); }
        } else {
          for (const s of rooms.get(ws.room)) { if (s!==ws) send(s, { type: 'signal', from: ws._id||null, payload }); }
        }
      }
    }
  });
  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
      rooms.get(ws.room).forEach(s => send(s, { type: 'peer-left', id: ws._id||null }));
    }
  });
});

console.log(`Signaling JS server listening on ws://0.0.0.0:${port}`);
