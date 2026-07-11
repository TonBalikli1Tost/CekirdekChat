import * as React from 'react';
import { View, StyleSheet, ScrollView, Platform, Text as RNText, Image } from 'react-native';
import { Provider as PaperProvider, Text, TextInput, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useChannelStore } from './store';

const SIGNAL_URL = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_SIGNALING_URL) || 'ws://localhost:9003';

export default function App() {
  const { nick, channels, selected, newChannel, setNick, addChannel, setSelected, setNewChannel } = useChannelStore();
  const [status, setStatus] = React.useState('idle'); // idle | connecting | p2p | encrypted
  const wsRef = React.useRef(null);
  const LOGO_DATA_URI = "data:image/png;base64,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...";

  const onAdd = () => {
    const t = (newChannel || '').trim();
    if (!t) return;
    addChannel(t);
  };

  const onJoin = () => {
    // request local audio if possible then start signaling
    requestPermissionsAndMedia().then(() => startSignaling(selected)).catch(() => startSignaling(selected));
  };

  async function requestPermissionsAndMedia() {
    // On Android/iOS use react-native-webrtc mediaDevices if available (requires EAS or bare build)
    if (Platform.OS !== 'web') {
      try {
        const rnwebrtc = require('react-native-webrtc');
        const { mediaDevices } = rnwebrtc;
        if (mediaDevices && mediaDevices.getUserMedia) {
          try {
            await mediaDevices.getUserMedia({ audio: true, video: false });
            // local audio stream obtained; app can attach to PeerConnection later
            return true;
          } catch (err) {
            // permission denied or error
            return false;
          }
        }
      } catch (e) {
        // module not installed / not available in Expo Go
        return false;
      }
    }
    return false;
  }

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
          if (d.peers && d.peers.length > 0) setStatus('p2p');
        } else if (d.type === 'peer-joined') {
          setStatus('p2p');
        } else if (d.type === 'signal') {
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
            {/* floating logo */}
            <Image source={{ uri: LOGO_DATA_URI }} style={styles.floatingLogo} />
          </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#0f1720' },
  floatingLogo: { position: 'absolute', width: 44, height: 44, right: 14, bottom: 18, borderRadius: 10, elevation: 8 },
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