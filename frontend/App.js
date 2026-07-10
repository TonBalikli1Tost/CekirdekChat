import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './src/services/supabaseClient';
import Button from './src/components/Button';
import AuthPanel from './src/components/AuthPanel';
import CekirdekChat from './src/components/CekirdekChat';

const CHANNELS = ['genel', 'oyun', 'müzik', 'yazılım', 'sohbet'];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('genel');
  const [customChannel, setCustomChannel] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'cekirdek-chat' && parts[1] === 'chat' && parts[2]) {
      setSelectedChannel(parts.slice(2).join('-'));
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Kullanıcı kontrol hatası:', error);
          setUser(null);
        } else {
          setUser(data?.user || null);
        }
      } catch (err) {
        console.error('Auth hatası:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && roomName && !joined) {
      setJoined(true);
    }
  }, [user, roomName, joined]);

  const roomName = useMemo(() => customChannel.trim() || selectedChannel, [customChannel, selectedChannel]);
  const displayName = nickname.trim() || user?.email?.split('@')[0] || user?.id || 'Anonim';

  const handleJoin = () => {
    if (!displayName) return;
    const normalizedChannel = roomName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    const targetPath = `/cekirdek-chat/chat/${normalizedChannel}`;
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath);
    }
    setJoined(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111318', color: '#e5e7eb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {!user || loading ? (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#1f2126', border: '1px solid #2d2f33', borderRadius: '24px', padding: '32px' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>Çekirdek'e Katıl</div>
              <div style={{ color: '#9ca3af', marginTop: '10px' }}>Takma adını gir, bir kanal seç ve gerçek P2P sohbete başla.</div>
            </div>
            <AuthPanel onUserChange={setUser} />
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#9ca3af' }}>Giriş yapıldıktan sonra kanal seçimine devam edin.</div>
          </div>
        </div>
      ) : !joined ? (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '680px', background: '#1e2228', border: '1px solid #292d33', borderRadius: '32px', padding: '32px' }}>
            <div style={{ marginBottom: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#f8fafc' }}>Çekirdek'e Katıl</div>
              <div style={{ color: '#a1a8b3', marginTop: '8px' }}>Takma adını gir, bir kanal seç ve gerçek P2P sohbete başla.</div>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#d1d5db', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Takma Ad</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="ör. çekirdekçi_42"
                  style={{ width: '100%', borderRadius: '16px', border: '1px solid #2f343b', background: '#16181d', color: '#f8fafc', padding: '14px 16px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#d1d5db', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Kanal Seç</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {CHANNELS.map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => { setSelectedChannel(channel); setCustomChannel(''); }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '999px',
                        border: selectedChannel === channel && !customChannel ? '1px solid #22c55e' : '1px solid #2f343b',
                        background: selectedChannel === channel && !customChannel ? '#22c55e' : '#16181d',
                        color: selectedChannel === channel && !customChannel ? '#0f172a' : '#e5e7eb',
                        cursor: 'pointer',
                      }}
                    >
                      #{channel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#d1d5db', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Yeni kanal oluştur</label>
                <input
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  placeholder="Yeni kanal adı"
                  style={{ width: '100%', borderRadius: '16px', border: '1px solid #2f343b', background: '#16181d', color: '#f8fafc', padding: '14px 16px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setJoined(true)}
                  disabled={!displayName}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    background: '#22c55e',
                    color: '#0f172a',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    fontWeight: 700,
                    cursor: displayName ? 'pointer' : 'not-allowed',
                    opacity: displayName ? 1 : 0.55,
                    border: 'none',
                  }}
                >
                  #{roomName} kanalına katıl
                </button>
                <button
                  type="button"
                  onClick={() => { setNickname(''); setCustomChannel(''); setSelectedChannel('genel'); }}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    background: '#16181d',
                    color: '#e5e7eb',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    fontWeight: 600,
                    border: '1px solid #2f343b',
                  }}
                >
                  Sıfırla
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CekirdekChat user={user} username={displayName} channel={roomName} />
      )}
    </div>
  );
}
