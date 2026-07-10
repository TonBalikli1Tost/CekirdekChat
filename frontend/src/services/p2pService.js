import Peer from 'simple-peer';

const STUN_SERVER = 'stun:stun.l.google.com:19302';
let peer = null;

export function createPeer({ isInitiator = true, stream = null, onSignal, onData, onError }) {
  try {
    peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      config: { iceServers: [{ urls: STUN_SERVER }] },
      stream: stream || undefined,
    });

    peer.on('signal', (data) => {
      try {
        if (typeof onSignal === 'function') onSignal(data);
      } catch (err) {
        console.error('Sinyal işlenemedi:', err);
      }
    });

    peer.on('data', (chunk) => {
      try {
        const payload = JSON.parse(chunk.toString());
        if (typeof onData === 'function') onData(payload);
      } catch (err) {
        console.error('P2P veri ayrıştırılamadı:', err);
      }
    });

    peer.on('error', (err) => {
      try {
        if (typeof onError === 'function') onError(err);
      } catch (err2) {
        console.error('Peer hata işleyici hatası:', err2);
      }
    });

    return peer;
  } catch (err) {
    console.error('Peer başlatılamadı:', err);
    return null;
  }
}

export function sendMessage(text) {
  try {
    if (!peer || !peer.connected) return;
    peer.send(JSON.stringify({ type: 'CHAT', text }));
  } catch (err) {
    console.error('Mesaj gönderilemedi:', err);
  }
}

export function sendMediaAck(payload) {
  try {
    if (peer?.connected) {
      peer.send(JSON.stringify({ type: 'MEDIA_ACK', payload }));
    }
  } catch (err) {
    console.error('MEDIA_ACK gönderilemedi:', err);
  }
}

export function destroyPeer() {
  try {
    if (peer && !peer.destroyed) peer.destroy();
    peer = null;
  } catch (err) {
    console.error('Peer kapatılamadı:', err);
  }
}
