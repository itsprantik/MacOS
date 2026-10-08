import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Phase = 'boot' | 'login' | 'desktop'
type Toggle = 'wifi' | 'bluetooth' | 'airdrop' | 'focus'

interface SystemState {
  phase: Phase
  userName: string
  avatar: string
  setPhase: (phase: Phase) => void
  setUserName: (name: string) => void

  wallpaperId: string
  setWallpaper: (id: string) => void

  theme: 'light' | 'dark' | 'auto'
  setTheme: (t: SystemState['theme']) => void

  controlCenterOpen: boolean
  setControlCenter: (open: boolean) => void

  wifi: boolean
  bluetooth: boolean
  airdrop: boolean
  focus: boolean
  toggle: (key: Toggle) => void

  brightness: number
  volume: number
  setBrightness: (v: number) => void
  setVolume: (v: number) => void
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      phase: 'boot',
      userName: 'User',
      avatar: '🏕️',

      setPhase: (phase) =>
        set({
          phase,
          controlCenterOpen: false,
        }),

      setUserName: (userName) =>
        set({ userName }),

      wallpaperId: 'tahoe',

      setWallpaper: (wallpaperId) =>
        set({ wallpaperId }),

      theme: 'light',

      setTheme: (theme) =>
        set({ theme }),

      controlCenterOpen: false,

      setControlCenter: (controlCenterOpen) =>
        set({ controlCenterOpen }),

      wifi: true,
      bluetooth: true,
      airdrop: false,
      focus: false,

      toggle: (key) =>
        set((s) => ({
          [key]: !s[key],
        }) as Partial<SystemState>),

      brightness: 1,
      volume: 0.8,

      setBrightness: (brightness) =>
        set({ brightness }),

      setVolume: (volume) =>
        set({ volume }),
    }),
    {
      name: 'webos-system',

      partialize: (s) => ({
        wallpaperId: s.wallpaperId,
        userName: s.userName,
        brightness: s.brightness,
        volume: s.volume,
        theme: s.theme,
      }),
    },
  ),
)