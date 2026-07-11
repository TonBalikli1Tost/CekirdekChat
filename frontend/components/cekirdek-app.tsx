"use client"

import { useCallback, useState } from "react"
import { useCekirdekRoom } from "@/hooks/use-cekirdek-room"
import { JoinScreen } from "@/components/join-screen"
import { ChatRoom } from "@/components/chat-room"
import { colorFromName } from "@/lib/img"

const PRESET_CHANNELS = ["genel", "oyun", "müzik", "yazılım", "sohbet"]

import { LOGO_DATA_URI } from "./logo-data"

export function CekirdekApp() {
  const room = useCekirdekRoom()
  const [profile, setProfile] = useState<{ name: string; color: string; avatar?: string } | null>(null)
  const [channels, setChannels] = useState<string[]>(PRESET_CHANNELS)
  const [currentChannel, setCurrentChannel] = useState("genel")

  const handleJoin = useCallback(
    (p: { name: string; color: string; avatar?: string }, ch: string) => {
      setProfile(p)
      setCurrentChannel(ch)
      if (!channels.includes(ch)) setChannels((prev) => [...prev, ch])
      room.join(p, ch)
    },
    [room, channels],
  )

  const handleSwitchChannel = useCallback(
    (ch: string) => {
      if (ch === currentChannel || !profile) return
      setCurrentChannel(ch)
      if (!channels.includes(ch)) setChannels((prev) => [...prev, ch])
      room.join(profile, ch)
    },
    [currentChannel, profile, room, channels],
  )

  const handleLeave = useCallback(() => {
    room.leave()
    setProfile(null)
    setCurrentChannel("genel")
    setChannels(PRESET_CHANNELS)
  }, [room])

  // Katılım ekranı
  if (!profile || room.status === "idle") {
    return (
      <div className="relative">
        <JoinScreen onJoin={handleJoin} />
        <img src={LOGO_DATA_URI} alt="Çekirdek logo" style={{ position: 'fixed', bottom: 12, right: 12, width: 40, height: 40, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.5)', zIndex: 9999 }} />
      </div>
    )
  }

  // Bağlanıyor yükleme ekranı
  if (room.status === "connecting") {
    return (
      <div className="flex h-dvh items-center justify-center bg-dc-bg-dark relative">
        <div className="flex flex-col items-center gap-4 text-dc-muted">
          <div className="size-10 animate-spin rounded-full border-2 border-dc-muted border-t-dc-brand" />
          <p className="text-sm">
            <span className="text-dc-brand font-medium">#{currentChannel}</span> kanalına bağlanıyor…
          </p>
        </div>
        <img src={LOGO_DATA_URI} alt="Çekirdek logo" style={{ position: 'fixed', bottom: 12, right: 12, width: 40, height: 40, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.5)', zIndex: 9999 }} />
      </div>
    )
  }

  return (
    <ChatRoom
      room={room.room}
      allChannels={channels}
      status={room.status}
      members={room.members}
      messages={room.messages}
      voiceOn={room.voiceOn}
      muted={room.muted}
      selfProfile={profile}
      onSend={room.sendMessage}
      onStartVoice={room.startVoice}
      onStopVoice={room.stopVoice}
      onToggleMute={room.toggleMute}
      onSwitchChannel={handleSwitchChannel}
      onLeave={handleLeave}
    />
  )
}
