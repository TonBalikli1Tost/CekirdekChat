import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { generateKeyPair, encryptMessage, decryptMessage } from '../services/encryptionService';
import Button from './Button';

const FRIENDS = [
  { id: '1', name: 'Ari', online: true },
  { id: '2', name: 'Mina', online: false },
  { id: '3', name: 'Efe', online: true },
  { id: '4', name: 'Lina', online: false },
  { id: '5', name: 'Sero', online: true },
];

export default function ChatScreen({ user }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [activeFriend, setActiveFriend] = useState('1');
  const [loading, setLoading] = useState(false);
  const [keyPair, setKeyPair] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Key pair oluştur ve kalıcılığı sağla
  useEffect(() => {
    const saved = window.localStorage.getItem('cekirdek-chat-keypair');
    if (saved) {
      try {
        setKeyPair(JSON.parse(saved));
        return;
      } catch (err) {
        console.error('Anahtar yükleme hatası:', err);
      }
    }

    const keys = generateKeyPair();
    window.localStorage.setItem('cekirdek-chat-keypair', JSON.stringify(keys));
    setKeyPair(keys);
  }, [user]);

  // Mobil responsive dinle
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mesajları yükle ve realtime dinle
  useEffect(() => {
    if (!supabase) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);
        
        if (error) {
          console.error('Mesajlar yükleme hatası:', error);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Mesaj yükleme hatası:', err);
      }
    };

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${user?.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const activeMessages = useMemo(() => {
    return messages.map((msg) => {
      let text = msg.content;
      if (msg.encrypted && msg.metadata && keyPair) {
        try {
          const metadata = JSON.parse(msg.metadata);
          const decrypted = decryptMessage(metadata, keyPair.publicKey, keyPair.secretKey);
          if (decrypted) text = decrypted;
        } catch (err) {
          console.error('Mesaj deşifreleme hatası:', err);
        }
      }
      return {
        id: msg.id,
        from: msg.sender,
        text,
        encrypted: msg.encrypted || false,
      };
    });
  }, [messages, keyPair]);

  const activeFriendData = FRIENDS.find((friend) => friend.id === activeFriend) || FRIENDS[0];

  const handleSend = async () => {
    if (!user) {
      alert('Mesaj göndermek için giriş yapmalısınız');
      return;
    }

    const text = draft.trim();
    if (!text || !supabase) return;

    setLoading(true);
    try {
      // E2EE encryption
      const encryptedData = keyPair ? encryptMessage(text, keyPair.publicKey, keyPair.secretKey) : null;

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender: user.email || user.id,
            content: text,
            encrypted: !!encryptedData,
            metadata: encryptedData ? JSON.stringify(encryptedData) : null,
          },
        ]);

      if (error) {
        console.error('Mesaj gönderme hatası:', error);
        alert('Mesaj gönderilemedi');
      } else {
        setDraft('');
      }
    } catch (err) {
      console.error('Gönderme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      backgroundColor: '#000',
      color: '#fff',
      flexDirection: isMobile ? 'column' : 'row',
    }}>
      {/* Sidebar - Kişiler */}
      <aside style={{
        width: isMobile ? '100%' : '240px',
        borderRight: isMobile ? 'none' : '1px solid #222',
        borderBottom: isMobile ? '1px solid #222' : 'none',
        backgroundColor: '#09090b',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        maxHeight: isMobile ? '120px' : 'auto',
        overflowX: isMobile ? 'auto' : 'visible',
        overflowY: isMobile ? 'visible' : 'auto',
      }}>
        <div style={{
          padding: '16px 14px',
          borderBottom: isMobile ? 'none' : '1px solid #18181b',
          fontWeight: 600,
          color: '#f8fafc',
          whiteSpace: 'nowrap',
          minWidth: isMobile ? 'auto' : '100%',
        }}>
          Kişiler
        </div>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          flex: 1,
          overflowX: isMobile ? 'auto' : 'visible',
          overflowY: isMobile ? 'visible' : 'auto',
        }}>
          {FRIENDS.map((friend) => (
            <Button
              key={friend.id}
              onClick={() => setActiveFriend(friend.id)}
              variant={activeFriend === friend.id ? 'secondary' : 'ghost'}
              style={{
                width: isMobile ? 'auto' : '100%',
                minWidth: isMobile ? '80px' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start',
                borderRadius: 0,
                borderBottom: !isMobile ? '1px solid #18181b' : 'none',
                borderRight: isMobile ? '1px solid #18181b' : 'none',
                padding: '14px 16px',
                backgroundColor: activeFriend === friend.id ? '#111827' : '#09090b',
                color: '#f8fafc',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                width: isMobile ? 'auto' : '100%',
                flexDirection: isMobile ? 'column' : 'row',
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: friend.online ? '#22c55e' : '#6b7280',
                }} />
                <span style={{ fontSize: isMobile ? '12px' : '14px' }}>{friend.name}</span>
              </span>
            </Button>
          ))}
        </div>
      </aside>

      {/* Chat Section */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        minWidth: 0,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 18px',
          borderBottom: '1px solid #222',
          backgroundColor: '#050505',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {activeFriendData.name}
            </div>
            <div style={{
              fontSize: '13px',
              color: activeFriendData.online ? '#22c55e' : '#6b7280',
            }}>
              {activeFriendData.online ? 'Çevrimiçi' : 'Çevrimdışı'}
            </div>
          </div>
          <Button onClick={handleClearChat} variant="ghost" style={{ padding: '10px 14px' }}>
            Sohbeti Temizle
          </Button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          {activeMessages.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              Bu kişiyle henüz bir konuşma yok. Mesaj göndererek başlayabilirsin.
            </div>
          ) : (
            activeMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: msg.from === user?.email || msg.from === user?.id ? '#111827' : '#0f172a',
                  maxWidth: isMobile ? '90%' : '400px',
                  alignSelf: msg.from === user?.email || msg.from === user?.id ? 'flex-end' : 'flex-start',
                  wordWrap: 'break-word',
                }}
              >
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  {msg.from}
                  {msg.encrypted && <span style={{ marginLeft: '8px', color: '#22c55e' }}>🔒</span>}
                </div>
                <div style={{ fontSize: '15px', color: '#f8fafc' }}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '16px',
          borderTop: '1px solid #222',
          backgroundColor: '#050505',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Mesaj yaz..."
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '14px',
              backgroundColor: '#111827',
              color: '#f8fafc',
              border: '1px solid #1f2937',
              padding: '14px 16px',
              outline: 'none',
              fontSize: '15px',
              minWidth: isMobile ? '100%' : 'auto',
            }}
          />
          <Button onClick={handleSend} disabled={!draft.trim() || loading || !user} style={{
            minWidth: isMobile ? '100%' : 'auto',
          }}>
            {loading ? 'GÖNDERILIYOR...' : 'GÖNDER'}
          </Button>
        </div>
      </section>
    </div>
  );
}
