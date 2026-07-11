import { supabase } from './supabaseClient';

const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302',
];

// TURN servers (fallback for NAT traversal)
const TURN_SERVERS = [
  {
    urls: 'turn:turnserver.example.com:3478',
    username: 'user',
    credential: 'pass',
  },
];

export class P2PSignaling {
  constructor(userId, username) {
    this.userId = userId;
    this.username = username;
    this.roomId = null;
    this.signalChannel = null;
    this.peers = new Map();
    this.callbacks = {};
  }

  async joinRoom(roomId) {
    try {
      this.roomId = roomId;

      // Register in room
      const { error: insertError } = await supabase
        .from('p2p_peers')
        .insert([
          {
            room_id: roomId,
            user_id: this.userId,
            username: this.username,
            status: 'connected',
          },
        ]);

      if (insertError) throw insertError;

      // Subscribe to signaling channel
      this.signalChannel = supabase
        .channel(`room:${roomId}:signals`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'p2p_signals' },
          (payload) => this._handleSignalMessage(payload.new)
        )
        .subscribe();

      if (this.callbacks.onJoined) {
        this.callbacks.onJoined();
      }

      return true;
    } catch (err) {
      console.error('Room joining hatası:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError(err);
      }
      return false;
    }
  }

  async leaveRoom() {
    try {
      if (this.signalChannel) {
        await this.signalChannel.unsubscribe();
      }

      // Update status
      await supabase
        .from('p2p_peers')
        .update({ status: 'disconnected' })
        .eq('room_id', this.roomId)
        .eq('user_id', this.userId);

      this.peers.forEach((peer) => {
        if (peer) peer.destroy();
      });
      this.peers.clear();

      return true;
    } catch (err) {
      console.error('Room leaving hatası:', err);
      return false;
    }
  }

  async sendSignal(targetUserId, signalData) {
    try {
      const { error } = await supabase.from('p2p_signals').insert([
        {
          room_id: this.roomId,
          from_user_id: this.userId,
          to_user_id: targetUserId,
          signal_type: signalData.type,
          signal_data: signalData,
        },
      ]);

      if (error) throw error;
    } catch (err) {
      console.error('Signal gönderme hatası:', err);
    }
  }

  async _handleSignalMessage(signalMsg) {
    try {
      if (signalMsg.to_user_id !== this.userId) return;

      const fromUserId = signalMsg.from_user_id;
      const signalData = signalMsg.signal_data;

      if (this.callbacks.onSignal) {
        this.callbacks.onSignal(fromUserId, signalData);
      }
    } catch (err) {
      console.error('Signal işleme hatası:', err);
    }
  }

  getIceServers() {
    return {
      iceServers: [...STUN_SERVERS.map(url => ({ urls: url })), ...TURN_SERVERS],
    };
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }
}

