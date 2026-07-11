import React, { useEffect, useState, useRef } from 'react';
import SimplePeer from 'simple-peer';

const SIGNAL_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:9003';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | connecting | p2p | encrypted
  const [room, setRoom] = useState('genel');
  const [nick, setNick] = useState('çekirdekçi_42');
  const wsRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    // lazy connect only when user interacts
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const startSignaling = () => {
    if (wsRef.current) return;
    setStatus('connecting');
    try {
      const ws = new WebSocket(SIGNAL_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', room }));
      };
      ws.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          if (d.type === 'peers') {
            d.peers.forEach((id) => createPeer(id, true));
          } else if (d.type === 'peer-joined') {
            createPeer(d.id, true);
          } else if (d.type === 'signal') {
            receiveSignal(d.from, d.payload);
          } else if (d.type === 'peer-left') {
            // remove peer
            if (peersRef.current[d.id]) {
              try { peersRef.current[d.id].destroy(); } catch(e){}
              delete peersRef.current[d.id];
            }
          }
        } catch (e) {
          console.warn('invalid message', e);
        }
      };
      ws.onclose = () => setStatus('idle');
      ws.onerror = () => setStatus('idle');
    } catch (e) {
      setStatus('idle');
    }
  };

  function createPeer(id, initiator) {
    if (peersRef.current[id]) return;
    const peer = new SimplePeer({ initiator, trickle: true });
    peer.on('signal', (data) => { wsRef.current && wsRef.current.send(JSON.stringify({ type: 'signal', room, target: id, payload: data })); });
    peer.on('connect', () => { setStatus('p2p'); peer.send(`hello from ${nick}`); });
    peer.on('data', (d) => { console.log('data', d.toString()); });
    peer.on('error', (e) => { console.warn('peer error', e); });
    peersRef.current[id] = peer;
  }

  function receiveSignal(from, payload) {
    if (!peersRef.current[from]) createPeer(from, false);
    try { peersRef.current[from].signal(payload); } catch (e) { console.warn('signal fail', e); }
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="brand">
          <img src="/assets/logo.png" alt="Çekirdek" className="logo" onError={(e)=>{e.target.style.display='none'}} />
          <div>
            <h1>Çekirdek Chat</h1>
            <p className="muted">P2P sohbet - doğrudan bağlantı</p>
          </div>
        </div>
        <div className="status">
          <span className={`badge badge-${status}`}>{status.toUpperCase()}</span>
        </div>
      </header>

      <main className="container">
        <section className="card">
          <h2>Katıl</h2>
          <div className="row">
            <label>Takma ad</label>
            <input value={nick} onChange={e=>setNick(e.target.value)} />
          </div>
          <div className="row">
            <label>Kanal</label>
            <input value={room} onChange={e=>setRoom(e.target.value)} />
          </div>
          <div className="row actions">
            <button className="btn primary" onClick={startSignaling}>Bağlan</button>
            <button className="btn" onClick={()=>{ setStatus('idle'); if(wsRef.current) wsRef.current.close(); wsRef.current=null; }}>Ayrıl</button>
          </div>
        </section>

        <section className="card">
          <h3>Bilgilendirme</h3>
          <p>Bu demo simple-peer kullanarak tarayıcılar arasında doğrudan P2P bağlantı kurar. Aynı kanalda birkaç sekme veya cihaz açarak test edebilirsiniz.</p>
        </section>
      </main>

      <footer className="app-footer">
        <small>© Çekirdek — Demo</small>
      </footer>
    </div>
  );
}
