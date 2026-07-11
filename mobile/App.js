import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  const [nick, setNick] = React.useState('çekirdekçi_42');
  const [channels, setChannels] = React.useState(['genel','oyun','müzik','yazılım','sohbet']);
  const [selected, setSelected] = React.useState('genel');
  const [newChannel, setNewChannel] = React.useState('');

  const addChannel = () => {
    const trimmed = newChannel.trim();
    if (!trimmed) return;
    if (!channels.includes(trimmed)) {
      setChannels(prev => [trimmed, ...prev]);
      setNewChannel('');
      setSelected(trimmed);
    }
  };

  const join = () => {
    // For now just show an alert; real join would call Supabase / signaling
    const msg = `Takma ad: ${nick}\nKanal: ${selected}`;
    if (typeof alert !== 'undefined') alert(msg);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.header}>Çekirdek'e Katıl</Text>
        <Text style={styles.hint}>Takma adını gir, bir kanal seç ve gerçek P2P sohbete başla.</Text>

        <Text style={styles.label}>TAKMA AD</Text>
        <TextInput value={nick} onChangeText={setNick} style={styles.input} placeholder="ör. çekirdekçi_42" placeholderTextColor="#777" />

        <Text style={[styles.label, {marginTop:12}]}>KANAL SEÇ</Text>
        <View style={styles.chipsRow}>
          {channels.map(ch => (
            <Pressable key={ch} onPress={() => setSelected(ch)} style={[styles.chip, selected===ch && styles.chipActive]}>
              <Text style={[styles.chipText, selected===ch && styles.chipTextActive]}># {ch}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.newChannelRow}>
          <TextInput value={newChannel} onChangeText={setNewChannel} style={styles.newChannelInput} placeholder="Yeni kanal oluştur" placeholderTextColor="#777" />
          <TouchableOpacity onPress={addChannel} style={styles.addBtn}><Text style={{color:'#fff'}}>+ Ekle</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.joinBtn} onPress={join}>
          <Text style={styles.joinBtnText}>#{selected} kanalına katıl</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 16,
  },
});



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1720',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  header: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#9ca3af', fontSize: 13, marginBottom: 12 },
  label: { color: '#9ca3af', fontSize: 12, marginTop: 8, marginBottom:4 },
  input: { backgroundColor: '#0b1220', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 0.5, borderColor: '#1f2937' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop:6 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#1f2937', marginRight: 8, marginTop:6 },
  chipActive: { backgroundColor: '#4338ca' },
  chipText: { color: '#e5e7eb' },
  chipTextActive: { color: '#fff' },
  newChannelRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  newChannelInput: { flex: 1, backgroundColor: '#0b1220', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 0.5, borderColor: '#1f2937' },
  addBtn: { marginLeft: 8, backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6 },
  joinBtn: { marginTop: 16, backgroundColor: '#065f46', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  joinBtnText: { color: '#d1fae5', fontWeight: '700' }
});
