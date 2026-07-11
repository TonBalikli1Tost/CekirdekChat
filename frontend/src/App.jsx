import React, { useEffect, useState, useRef } from 'react';
import SimplePeer from 'simple-peer';

const SIGNAL_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:9003';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | connecting | p2p | encrypted
  const [room, setRoom] = useState('genel');
  const wsRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    // connect to signaling
    setStatus('connecting');
    const ws = new WebSocket(SIGNAL_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus('connecting');
      ws.send(JSON.stringify({ type: 'join', room }));
    };
    ws.onmessage = (ev) => {
      const d = JSON.parse(ev.data);
      if (d.type === 'peers') {
        // create peers (initiator)
        d.peers.forEach((id) => createPeer(id, true));
      } else if (d.type === 'peer-joined') {
        createPeer(d.id, true);
      } else if (d.type === 'signal') {
        receiveSignal(d.from, d.payload);
      } else if (d.type === 'peer-left') {
        // cleanup
      }
    };
    ws.onclose = () => { setStatus('idle'); };
    ws.onerror = () => { setStatus('idle'); };

    return () => { ws.close(); };
  }, [room]);

  function createPeer(id, initiator) {
    const peer = new SimplePeer({ initiator, trickle: true });
    peer.on('signal', (data) => { wsRef.current && wsRef.current.send(JSON.stringify({ type: 'signal', room, target: id, payload: data })); });
    peer.on('connect', () => { setStatus('p2p'); peer.send('hello from client'); });
    peer.on('data', (d) => { console.log('data', d.toString()); });
    peersRef.current[id] = peer;
  }

  function receiveSignal(from, payload) {
    if (!peersRef.current[from]) createPeer(from, false);
    peersRef.current[from].signal(payload);
  }

  return (
    <div style={{fontFamily:'Segoe UI',padding:24,maxWidth:840,margin:'0 auto'}}>
      <h1>Çekirdek Chat — Web</h1>
      <div>Status: <strong>{status}</strong></div>
      <div style={{marginTop:12}}>
        <label>Room: <input value={room} onChange={e=>setRoom(e.target.value)} /></label>
      </div>
      <p style={{marginTop:12}}>Open multiple browser tabs to test P2P via signaling server.</p>
    </div>
  );
}
