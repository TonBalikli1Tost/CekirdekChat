import React, { useEffect, useState } from 'react';
import { supabase, getUserId } from '../services/supabaseClient';
import Button from './Button';

export default function AuthPanel() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const loadUser = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setStatusMessage('Kullanıcı alınamadı.');
        } else {
          setUser(data?.user || null);
        }
      } catch (err) {
        setStatusMessage('Auth kontrolü sırasında hata.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!supabase || !email) return;
    setLoading(true);
    setStatusMessage('Magic link gönderiliyor...');

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatusMessage(`Giriş hatası: ${error.message}`);
    } else {
      setStatusMessage('Email adresine magic link gönderildi. Gelen kutunu kontrol et.');
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatusMessage(`Çıkış hatası: ${error.message}`);
    } else {
      setStatusMessage('Çıkış yapıldı.');
      setUser(null);
    }
    setLoading(false);
  };

  const userIdFallback = user ? user.email || user.id : null;

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #222', backgroundColor: '#09090b' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Kimlik</div>
          <div style={{ color: '#fff', fontSize: '14px' }}>
            {user ? `Giriş yapıldı: ${user.email || user.id}` : 'Giriş yapılmadı'}
          </div>
        </div>

        {!user ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email adresi"
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: '1px solid #18181b',
                padding: '10px 12px',
                minWidth: '240px',
                borderRadius: 0,
                outline: 'none',
              }}
            />
            <Button onClick={handleSignIn} disabled={!email || loading}>
              Giriş / Sign In
            </Button>
          </>
        ) : (
          <Button onClick={handleSignOut} disabled={loading} variant="ghost">
            Çıkış / Sign Out
          </Button>
        )}
      </div>
      {statusMessage ? (
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#9ca3af' }}>{statusMessage}</div>
      ) : null}
      {userIdFallback ? (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
          Kullanıcı kimliği: {userIdFallback}
        </div>
      ) : null}
    </div>
  );
}
