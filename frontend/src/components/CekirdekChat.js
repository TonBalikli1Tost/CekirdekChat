import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { supabase } from '../services/supabaseClient';
import { Mic, MicOff, Send, Hash, Radio, Circle } from 'lucide-react';


const initialParticipants = [
  { id: '1', username: 'Kaptan_Cekirdek', isMuted: false, isSpeaking: true },
  { id: '2', username: 'Yazilimci_Dost', isMuted: true, isSpeaking: false },
];

const channelList = ['genel', 'oyun', 'müzik', 'yazılım', 'sohbet'];

export default function CekirdekChat({ user, username, channel }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Boşta');
  const [participants, setParticipants] = useState(initialParticipants);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (username) {
      setParticipants((prev) => [
        { id: 'you', username, isMuted, isSpeaking: true },
        ...initialParticipants.filter((item) => item.username !== username),
      ]);
    }
  }, [username, isMuted]);

  useEffect(() => {
    if (!supabase || !user) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) {
          console.error('Mesajlar yükleme hatası:', error);
          return;
        }

        setMessages(data || []);
      } catch (err) {
        console.error('Mesaj yükleme hatası:', err);
      }
    };

    loadMessages();

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload?.new) {
            setMessages((prev) => {
              const next = [...prev, payload.new];
              return next.length > 50 ? next.slice(-50) : next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      clearInterval(pollingRef.current);
    };
  }, [user]);

  const handleIncomingMessage = (newMsg) => {
    setMessages((oldMsgs) => {
      const updated = [...oldMsgs, newMsg];
      return updated.length > 50 ? updated.slice(-50) : updated;
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const myMessage = {
      id: Math.random().toString(36).slice(2),
      sender: user.email || user.id || 'Sen',
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (peerRef.current && peerRef.current.connected) {
      peerRef.current.send(JSON.stringify(myMessage));
    }

    handleIncomingMessage(myMessage);
    setInputMessage('');

    try {
      await supabase.from('messages').insert([{ ...myMessage, created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error('Mesaj kaydetme hatası:', err);
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setIsMuted((prev) => !prev);
  };

  const cleanupPeer = () => {
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch (err) {
        console.error('Peer kapatılamadı:', err);
      }
      peerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    clearInterval(pollingRef.current);
    setStatus('Boşta');
  };

  const startP2PConnection = async (isInitiator) => {
    setLoading(true);
    setStatus('Eş Aranıyor...');
    cleanupPeer();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const peer = new Peer({ initiator: isInitiator, trickle: false, stream });

      peer.on('signal', async (data) => {
        try {
          await supabase.from('discovery').insert([
            {
              signal: JSON.stringify(data),
              role: isInitiator ? 'offer' : 'answer',
            },
          ]);
        } catch (err) {
          console.error('Sinyal ekleme hatası:', err);
        }
      });

      peer.on('stream', (remoteStream) => {
        setStatus('Bağlandı');
        if (!audioRef.current) {
          const audio = document.createElement('audio');
          audio.autoplay = true;
          audioRef.current = audio;
        }
        audioRef.current.srcObject = remoteStream;
        audioRef.current.play().catch(() => {});
      });

      peer.on('connect', () => {
        setStatus('Bağlandı');
      });

      peer.on('data', (data) => {
        try {
          const receivedMsg = JSON.parse(data.toString());
          handleIncomingMessage({
            ...receivedMsg,
            id: receivedMsg.id || Math.random().toString(36).slice(2),
            sender: receivedMsg.sender || 'Eş',
            timestamp: receivedMsg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        } catch (err) {
          console.error('P2P gelen mesaj hatası:', err);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer hata:', err);
        setStatus('Boşta');
      });

      peerRef.current = peer;

      if (!isInitiator) {
        const { data, error } = await supabase
          .from('discovery')
          .select('signal, role')
          .eq('role', 'offer')
          .order('id', { ascending: false })
          .limit(1);

        if (error || !data?.length) {
          setStatus('Boşta');
          setLoading(false);
          return;
        }

        const offer = JSON.parse(data[0].signal);
        peer.signal(offer);
      }

      if (isInitiator) {
        pollingRef.current = setInterval(async () => {
          try {
            const { data } = await supabase
              .from('discovery')
              .select('signal, role')
              .eq('role', 'answer')
              .order('id', { ascending: false })
              .limit(1);

            if (data?.length) {
              const answer = JSON.parse(data[0].signal);
              peer.signal(answer);
              clearInterval(pollingRef.current);
            }
          } catch (err) {
            console.error('Answer kontrol hatası:', err);
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Mikrofon veya P2P hatası:', err);
      setStatus('Boşta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#313338] text-[#dbdee1] overflow-hidden">
      <div className="hidden md:flex w-72 flex-col bg-[#2b2d31]">
        <div className="h-16 border-b border-[#1f2023] flex items-center px-4 font-bold text-white">⚛️ Çekirdek P2P</div>
        <div className="p-4 space-y-3">
          <div className="rounded-2xl bg-[#25272b] p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-[#7b7f87]">Oda</div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">#{channel}</div>
                <div className="text-[12px] text-[#949ba4]">NAT uyumlu, doğrudan bağlantı</div>
              </div>
              <Circle size={10} className="text-green-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#25272b] p-4 space-y-3">
            <div className="text-xs uppercase tracking-[0.24em] text-[#7b7f87]">Katılımcılar</div>
            {participants.map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between rounded-xl bg-[#2e3034] p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#5865f2] grid place-items-center text-sm font-bold">{userItem.username[0]}</div>
                  <div>
                    <div className="text-sm text-white">{userItem.username}</div>
                    <div className="text-[11px] text-[#7b7f87]">{userItem.isSpeaking ? 'Konuşuyor' : 'Hazır'}</div>
                  </div>
                </div>
                <div className={`text-xs font-semibold ${userItem.isMuted ? 'text-red-400' : 'text-green-400'}`}>
                  {userItem.isMuted ? 'Susturuldu' : 'Açık'}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-[#1f2023]">
          <button
            onClick={() => startP2PConnection(true)}
            className="w-full mb-3 rounded-2xl bg-[#248046] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f6939] transition"
          >
            <Radio size={16} className="inline mr-2" />Eş Ara
          </button>
          <button
            onClick={() => startP2PConnection(false)}
            className="w-full rounded-2xl border border-[#42454a] bg-[#1f2226] px-4 py-3 text-sm font-semibold text-[#dbdee1] hover:border-[#5b626b] transition"
          >
            <Hash size={16} className="inline mr-2" />Karşıdan Katıl
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-[#1f2023] bg-[#313338] px-4 py-3">
          <div className="flex items-center gap-3">
            <Hash size={22} className="text-[#8fa1b3]" />
            <div>
              <div className="text-sm font-semibold">#{channel}</div>
              <div className="text-[12px] text-[#7b7f87]">{status}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="rounded-full border border-[#42454a] bg-[#25282c] p-2 text-[#dbdee1] hover:bg-[#2f3338] transition">
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <span className={`rounded-full px-3 py-1 text-[12px] ${status === 'Bağlandı' ? 'bg-[#264d2f] text-[#74d89f]' : 'bg-[#222529] text-[#9ca3af]'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4 bg-[#0f1114]">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#1f2023] bg-[#16181d] p-8 text-center text-[#9ca3af]">
                <div className="text-4xl">💬</div>
                <div className="text-lg font-semibold text-white">Henüz mesaj yok</div>
                <p className="max-w-sm text-sm">Bağlanıp mesaj gönderin. Son 50 mesaj burada saklanır.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`rounded-3xl p-4 ${msg.sender === user.email || msg.sender === user.id ? 'bg-[#1d2530] self-end' : 'bg-[#202530]'}`}>
                  <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.24em] text-[#7b7f87]">
                    <span>{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#e5e9f0]">{msg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-[#1f2023] bg-[#25282c] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Mesaj yaz..."
              className="flex-1 rounded-3xl border border-[#42454a] bg-[#181b1f] px-4 py-3 text-sm text-[#e5e9f0] placeholder:text-[#6d7380] outline-none focus:border-[#4f7dcb]"
            />
            <button
              onClick={sendMessage}
              className="inline-flex h-12 items-center justify-center rounded-3xl bg-[#248046] px-5 text-sm font-semibold text-white transition hover:bg-[#1d6b39]"
            >
              <Send size={16} className="mr-2" /> Gönder
            </button>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex w-72 flex-col bg-[#2b2d31] p-4">
        <div className="text-xs uppercase tracking-[0.24em] text-[#7b7f87] mb-3">Katılımcılar</div>
        <div className="space-y-3">
          {participants.map((item) => (
            <div key={item.id} className="rounded-3xl bg-[#25282b] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-[#5865f2] grid place-items-center text-sm font-bold text-white">{item.username[0]}</div>
                  <div>
                    <div className="font-semibold text-white">{item.username}</div>
                    <div className="text-[12px] text-[#7b7f87]">{item.isMuted ? 'Susturuldu' : 'Açık'}</div>
                  </div>
                </div>
                {item.isMuted ? <MicOff size={16} className="text-red-400" /> : <Circle size={16} className="text-green-400" />}
              </div>
              {item.isSpeaking && <div className="mt-3 rounded-2xl bg-[#1f262f] px-3 py-2 text-[12px] text-[#8ef7c4]">Konuşuyor</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
