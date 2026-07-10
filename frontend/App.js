import React, { useState } from 'react';
import Button from './src/components/Button';
import ReadyPanel from './src/components/ReadyPanel';
import AuthPanel from './src/components/AuthPanel';
import ChatScreen from './src/components/ChatScreen';

export default function App() {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div style={{ backgroundColor: '#000', color: '#fff', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          onClick={() => setMinimized(false)}
          style={{ padding: '12px 18px', minWidth: '180px', borderRadius: '999px' }}
        >
          Çekirdek Chat'i Geri Getir
        </Button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>Çekirdek Chat</span>
        <Button
          onClick={() => setMinimized(true)}
          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '999px' }}
          variant="ghost"
        >
          —
        </Button>
      </header>

      <AuthPanel />
      <ReadyPanel />
      <ChatScreen />
    </div>
  );
}
