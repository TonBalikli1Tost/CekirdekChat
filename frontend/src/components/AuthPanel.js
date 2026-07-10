import React, { useEffect, useState } from 'react';
import { supabase, getUserId } from '../services/supabaseClient';
import Button from './Button';

export default function AuthPanel({ onUserChange }) {
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
          if (onUserChange) onUserChange(data?.user || null);
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
      if (onUserChange) onUserChange(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [onUserChange]);

  const handleSignIn = async () => {
    if (!supabase || !email) return;
    setLoading(true);
    setStatusMessage('Kaydediliyor...');

    try {
      // Direkt email ile giriş - auto-confirm development mode
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) {
        // Hata varsa başka yol dene - anonymous session
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          setStatusMessage(`Giriş hatası: ${error.message}`);
        } else {
          // Anonymous başarılı, user emailini update et
          await supabase.auth.updateUser({ email });
          setStatusMessage('Kaydoldunuz, teşekkürler geliştirme ekibi!');
          setEmail('');
          setTimeout(() => setStatusMessage(''), 3000);
        }
      } else {
        setStatusMessage('Kaydoldunuz, teşekkürler geliştirme ekibi!');
        setEmail('');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Login hata:', err);
      setStatusMessage('Bir hata oluştu, lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
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
      if (onUserChange) onUserChange(null);
    }
    setLoading(false);
  };

  const userIdFallback = user ? user.email || user.id : null;

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #222', backgroundColor: '#09090b' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flexDirection: 'column', '@media (min-width: 768px)': { flexDirection: 'row' } }}>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              placeholder="Email adresi"
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: '1px solid #18181b',
                padding: '10px 12px',
                minWidth: '100%',
                maxWidth: '240px',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            <Button onClick={handleSignIn} disabled={!email || loading}>
              {loading ? 'GİRİŞ YAPILIYOR...' : 'Giriş / Sign In'}
            </Button>
          </>
        ) : (
          <Button onClick={handleSignOut} disabled={loading} variant="ghost">
            Çıkış / Sign Out
          </Button>
        )}
      </div>
      {statusMessage ? (
        <div style={{ marginTop: '12px', fontSize: '13px', color: statusMessage.includes('teşekkürler') ? '#22c55e' : '#9ca3af' }}>{statusMessage}</div>
      ) : null}
    </div>
  );
}
