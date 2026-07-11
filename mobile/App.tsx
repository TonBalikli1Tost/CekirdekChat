import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Pressable,
  TouchableOpacity,
  Alert,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';

type Props = {};

const defaultChannels = ['genel', 'oyun', 'müzik', 'yazılım', 'sohbet'];

const App: React.FC<Props> = () => {
  const [nick, setNick] = React.useState<string>('çekirdekçi_42');
  const [channels, setChannels] = React.useState<string[]>(defaultChannels);
  const [selected, setSelected] = React.useState<string>('genel');
  const [newChannel, setNewChannel] = React.useState<string>('');

  const { width } = useWindowDimensions();
  const isNarrow = width < 360;

  const addChannel = () => {
    const trimmed = newChannel.trim();
    if (!trimmed) return;
    if (!channels.includes(trimmed)) {
      setChannels((prev) => [trimmed, ...prev]);
      setNewChannel('');
      setSelected(trimmed);
    }
  };

  const join = () => {
    const msg = `Takma ad: ${nick}\nKanal: ${selected}`;
    Alert.alert('Katılma Bilgisi', msg);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <ScrollView contentContainerStyle={[styles.scroll, isNarrow && styles.scrollNarrow]} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, isNarrow && styles.cardNarrow]}>
          <Text style={styles.header}>Çekirdek'e Katıl</Text>
          <Text style={styles.hint}>Takma adını gir, bir kanal seç ve gerçek P2P sohbete başla.</Text>

          <Text style={styles.label}>TAKMA AD</Text>
          <TextInput
            value={nick}
            onChangeText={setNick}
            style={styles.input}
            placeholder="ör. çekirdekçi_42"
            placeholderTextColor="#777"
            accessibilityLabel="takma-ad-input"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>KANAL SEÇ</Text>
          <View style={styles.chipsRow}>
            {channels.map((ch) => (
              <Pressable
                key={ch}
                onPress={() => setSelected(ch)}
                style={({ pressed }) => [
                  styles.chip,
                  selected === ch && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: selected === ch }}
              >
                <Text style={[styles.chipText, selected === ch && styles.chipTextActive]}># {ch}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.newChannelRow}>
            <TextInput
              value={newChannel}
              onChangeText={setNewChannel}
              style={styles.newChannelInput}
              placeholder="Yeni kanal oluştur"
              placeholderTextColor="#777"
              accessibilityLabel="yeni-kanal-input"
            />
            <TouchableOpacity onPress={addChannel} style={styles.addBtn} accessibilityRole="button">
              <Text style={styles.addBtnText}>+ Ekle</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.joinBtn} onPress={join} accessibilityRole="button">
            <Text style={styles.joinBtnText}>#{selected} kanalına katıl</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f1720',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  scrollNarrow: {
    paddingHorizontal: 10,
  },
  card: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  cardNarrow: {
    padding: 14,
  },
  header: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  hint: { color: '#9ca3af', fontSize: 13, marginBottom: 12 },
  label: { color: '#9ca3af', fontSize: 12, marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#0b1220', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 0.5, borderColor: '#1f2937' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#1f2937', marginRight: 8, marginTop: 6 },
  chipActive: { backgroundColor: '#4338ca' },
  chipText: { color: '#e5e7eb' },
  chipTextActive: { color: '#fff' },
  chipPressed: { opacity: 0.85 },
  newChannelRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  newChannelInput: { flex: 1, backgroundColor: '#0b1220', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 0.5, borderColor: '#1f2937' },
  addBtn: { marginLeft: 8, backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  joinBtn: { marginTop: 16, backgroundColor: '#065f46', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  joinBtnText: { color: '#d1fae5', fontWeight: '700' },
});
