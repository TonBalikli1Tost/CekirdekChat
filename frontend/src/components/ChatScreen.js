import React, { useMemo, useState } from 'react';
import Button from './Button';

const FRIENDS = [
  { id: '1', name: 'Ari', online: true },
  { id: '2', name: 'Mina', online: false },
  { id: '3', name: 'Efe', online: true },
  { id: '4', name: 'Lina', online: false },
  { id: '5', name: 'Sero', online: true },
];

const INITIAL_CONVERSATIONS = {
  '1': [
    { id: 'm1', from: 'Ari', text: 'Çekirdek hazır.' },
    { id: 'm2', from: 'ben', text: 'Sade ve hızlı kalsın.' },
  ],
  '2': [
    { id: 'm1', from: 'Mina', text: 'Merhaba, sohbet etmeye hazırım.' },
  ],
  '3': [
    { id: 'm1', from: 'Efe', text: 'Sesli chat de güzel olur.' },
  ],
  '4': [
    { id: 'm1', from: 'Lina', text: 'Yavaş olmadığından emin miyiz?' },
  ],
  '5': [
    { id: 'm1', from: 'Sero', text: 'Bugün neler paylaşalım?' },
  ],
};

export default function ChatScreen() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [draft, setDraft] = useState('');
  const [activeFriend, setActiveFriend] = useState('1');

  const activeMessages = useMemo(() => conversations[activeFriend] || [], [conversations, activeFriend]);
  const activeFriendData = FRIENDS.find((friend) => friend.id === activeFriend) || FRIENDS[0];

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setConversations((prev) => {
      const nextMessages = [...(prev[activeFriend] || []), { id: Date.now().toString(), from: 'ben', text }].slice(-50);
      return { ...prev, [activeFriend]: nextMessages };
    });
    setDraft('');
  };

  const handleClearChat = () => {
    setConversations((prev) => ({ ...prev, [activeFriend]: [] }));
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 72px)', backgroundColor: '#000', color: '#fff' }}>
      <aside style={{ width: '240px', borderRight: '1px solid #222', backgroundColor: '#09090b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #18181b', fontWeight: 600, color: '#f8fafc' }}>
          Kişiler
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {FRIENDS.map((friend) => (
            <Button
              key={friend.id}
              onClick={() => setActiveFriend(friend.id)}
              variant={activeFriend === friend.id ? 'secondary' : 'ghost'}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                borderRadius: 0,
                borderBottom: '1px solid #18181b',
                padding: '14px 16px',
                backgroundColor: activeFriend === friend.id ? '#111827' : '#09090b',
                color: '#f8fafc',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: friend.online ? '#22c55e' : '#6b7280' }} />
                <span>{friend.name}</span>
              </span>
            </Button>
          ))}
        </div>
      </aside>

      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #222', backgroundColor: '#050505' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{activeFriendData.name}</div>
            <div style={{ fontSize: '13px', color: activeFriendData.online ? '#22c55e' : '#6b7280' }}>
              {activeFriendData.online ? 'Çevrimiçi' : 'Çevrimdışı'}
            </div>
          </div>
          <Button onClick={handleClearChat} variant="ghost" style={{ padding: '10px 14px' }}>
            Sohbeti Temizle
          </Button>
        </div>

        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {activeMessages.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>Bu kişiyle henüz bir konuşma yok. Mesaj göndererek başlayabilirsin.</div>
          ) : (
            activeMessages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '14px', backgroundColor: msg.from === 'ben' ? '#111827' : '#0f172a' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>{msg.from}</div>
                <div style={{ fontSize: '15px', color: '#f8fafc' }}>{msg.text}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '16px', borderTop: '1px solid #222', backgroundColor: '#050505' }}>
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
            }}
          />
          <Button onClick={handleSend} disabled={!draft.trim()}>
            GÖNDER
          </Button>
        </div>
      </section>
    </div>
  );
}
