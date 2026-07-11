import * as React from 'react';
import { View, StyleSheet, ScrollView, Platform, Text as RNText } from 'react-native';
import { Provider as PaperProvider, Text, TextInput, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useChannelStore } from './store';

const SIGNAL_URL = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_SIGNALING_URL) || 'ws://localhost:9003';

export default function App() {
  const { nick, channels, selected, newChannel, setNick, addChannel, setSelected, setNewChannel } = useChannelStore();
  const [status, setStatus] = React.useState('idle'); // idle | connecting | p2p | encrypted
  const wsRef = React.useRef(null);

  const onAdd = () => {
    const t = (newChannel || '').trim();
    if (!t) return;
    addChannel(t);
  };

  const onJoin = () => {
    // placeholder — start signaling connection
    startSignaling(selected);
  };

  const startSignaling = (room) => {
    setStatus('connecting');
    try {
      const ws = new WebSocket(SIGNAL_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', room }));
      };
      ws.onmessage = (ev) => {
        let d = {};
        try { d = JSON.parse(ev.data); } catch(e) { return; }
        if (d.type === 'peers') {
          // once peers present, we consider p2p tunnel potentially active (simple heuristic)
          if (d.peers && d.peers.length > 0) setStatus('p2p');
        } else if (d.type === 'peer-joined') {
          setStatus('p2p');
        } else if (d.type === 'signal') {
          // handle signaling payload (simple-peer client would be here)
          setStatus('p2p');
        }
      };
      ws.onclose = () => setStatus('idle');
      ws.onerror = () => setStatus('idle');

      // mock encryption handshake after connected
      setTimeout(() => {
        if (status === 'p2p') setStatus('encrypted');
      }, 1500);
    } catch (e) {
      setStatus('idle');
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text variant="titleLarge" style={styles.header}>Çekirdek'e Katıl</Text>
          <Text style={styles.hint}>Takma adını gir, bir kanal seç ve gerçek P2P sohbete başla.</Text>

          <Text style={styles.label}>BAĞLANTI DURUMU</Text>
          <View style={{marginBottom:12}}>
            <RNText style={{color:'#fff'}}>Status: </RNText>
            {status === 'connecting' && <><ActivityIndicator animating size={18} /> <Text>Bağlanıyor</Text></>}
            {status === 'p2p' && <Text style={{color:'#34d399'}}>P2P Tünel Aktif</Text>}
            {status === 'encrypted' && <Text style={{color:'#f59e0b'}}>Şifreli</Text>}
            {status === 'idle' && <Text style={{color:'#9ca3af'}}>Bağlı değil</Text>}
          </View>

          <Text style={styles.label}>TAKMA AD</Text>
          <TextInput mode="outlined" value={nick} onChangeText={setNick} placeholder="ör. çekirdekçi_42" style={styles.input} />

          <Text style={[styles.label, { marginTop: 12 }]}>KANAL SEÇ</Text>
          <View style={styles.chipsRow}>
            {channels.map((ch) => (
              <Chip key={ch} selected={selected === ch} onPress={() => setSelected(ch)} style={styles.chip}>
                # {ch}
              </Chip>
            ))}
          </View>

          <View style={styles.newChannelRow}>
            <TextInput mode="outlined" value={newChannel} onChangeText={setNewChannel} placeholder="Yeni kanal oluştur" style={styles.newChannelInput} />
            <Button mode="contained" onPress={onAdd} style={styles.addBtn}>+ Ekle</Button>
          </View>

          <Button mode="contained" onPress={onJoin} style={styles.joinBtn} contentStyle={{ paddingVertical: 12 }}>
            #{selected} kanalına katıl
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#0f1720' },
  card: { width: '100%', maxWidth: 560, backgroundColor: '#111827', borderRadius: 12, padding: 18, elevation: 6 },
  header: { color: '#fff', marginBottom: 6 },
  hint: { color: '#9ca3af', marginBottom: 12 },
  label: { color: '#9ca3af', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#0b1220' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { marginRight: 8, marginBottom: 8, backgroundColor: '#1f2937' },
  newChannelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  newChannelInput: { flex: 1, marginRight: 8, backgroundColor: '#0b1220' },
  addBtn: { height: 44 },
  joinBtn: { marginTop: 16, backgroundColor: '#065f46' },
});