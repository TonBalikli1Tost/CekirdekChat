import React, { useState } from 'react';
import Button from './Button';
import { createPeer, destroyPeer } from '../services/p2pService';
import { supabase } from '../services/supabaseClient';

export default function ReadyPanel() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);

  const appendLog = (message) => {
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()} — ${message}`,
      ...prev,
    ].slice(0, 20));
  };

  const initPeer = (isInitiator) => {
    setStatus('starting');
    appendLog(`Hazır sinyal başlatılıyor (${isInitiator ? 'initiator' : 'receiver'})`);
    destroyPeer();

    const peer = createPeer({
      isInitiator,
      onSignal: async (data) => {
        appendLog('Sinyal üretildi.');
        if (!supabase) {
          appendLog('Supabase yapılandırması yok.');
          return;
        }

        try {
          const signalText = JSON.stringify(data);
          const { error } = await supabase.from('discovery').insert([
            {
              signal: signalText,
              role: isInitiator ? 'offer' : 'answer',
            },
          ]);

          if (error) {
            throw error;
          }

          appendLog('Sinyal Supabase discovery tablosuna kaydedildi.');
        } catch (err) {
          appendLog(`Supabase sinyal hatası: ${err.message || err}`);
        }
      },
      onData: (payload) => {
        appendLog(`Gelen veri: ${JSON.stringify(payload)}`);
      },
      onError: (err) => {
        appendLog(`P2P hata: ${err.message || err}`);
        setStatus('error');
      },
    });

    if (!peer) {
      appendLog('Peer oluşturulamadı.');
      setStatus('error');
      return;
    }

    peer.on('connect', () => {
      setStatus('connected');
      setConnected(true);
      appendLog('P2P bağlantısı hazır!');
    });

    peer.on('close', () => {
      setConnected(false);
      setStatus('closed');
      appendLog('Peer bağlantısı kapandı.');
    });

    return peer;
  };

  const startInitiator = () => {
    initPeer(true);
    appendLog('Initiator modu seçildi. Teklif hazırlanıyor.');
  };

  const startReceiver = async () => {
    const peer = initPeer(false);
    if (!peer || !supabase) return;

    try {
      const { data, error } = await supabase.from('discovery').select('signal,role').order('id', { ascending: false }).limit(20);
      if (error) {
        throw error;
      }

      const offerRow = (data || []).find((row) => row.role === 'offer');
      if (!offerRow) {
        appendLog('Offer sinyali bulunamadı. Lütfen initiator başlatın.');
        return;
      }

      const offer = JSON.parse(offerRow.signal);
      peer.signal(offer);
      appendLog('Offer sinyali alındı ve uygulandı.');
    } catch (err) {
      appendLog(`Offer çekme hatası: ${err.message || err}`);
    }
  };

  const resetPeer = () => {
    destroyPeer();
    setStatus('idle');
    setConnected(false);
    appendLog('P2P oturumu sıfırlandı.');
  };

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #222', backgroundColor: '#09090b' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <Button onClick={startInitiator}>Hazır Başlatıcı</Button>
        <Button onClick={startReceiver} variant="ghost">Hazır Yanıtlayıcı</Button>
        <Button onClick={resetPeer} variant="ghost">Sıfırla</Button>
      </div>
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#9ca3af' }}>
        Durum: {status} {connected ? '· Bağlı' : ''}
      </div>
      <div style={{ marginTop: '16px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #18181b', padding: '12px', fontSize: '13px', lineHeight: 1.5, backgroundColor: '#000' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#6b7280' }}>Hazır sinyal logları burada görüntülenecek.</div>
        ) : (
          logs.map((line, index) => (
            <div key={index} style={{ marginBottom: '6px', color: '#fff' }}>{line}</div>
          ))
        )}
      </div>
    </div>
  );
}
