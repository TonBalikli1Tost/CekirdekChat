import create from 'zustand';

export const useChannelStore = create((set) => ({
  nick: 'cekirdekçi_42',
  channels: ['genel', 'oyun', 'müzik', 'yazılım', 'sohbet'],
  selected: 'genel',
  newChannel: '',
  setNick: (n) => set({ nick: n }),
  addChannel: (c) => set((s) => ({ channels: s.channels.includes(c) ? s.channels : [c, ...s.channels], selected: c, newChannel: '' })),
  setSelected: (s) => set({ selected: s }),
  setNewChannel: (c) => set({ newChannel: c }),
}));
