import { create } from 'zustand'

export type Phase = 'boot' | 'login' | 'desktop'
type Toggle = 'wifi' | 'bluetooth' | 'airdrop' | 'focus'

interface SystemState {
  phase: Phase
  userName: string
  avatar: string
  setPhase: (phase: Phase) => void

  controlCenterOpen: boolean
  setControlCenter: (open: boolean) => void

  wifi: boolean
  bluetooth: boolean
  airdrop: boolean
  focus: boolean
  toggle: (key: Toggle) => void

  brightness: number // 0.3 – 1
  volume: number // 0 – 1
  setBrightness: (v: number) => void
  setVolume: (v: number) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  phase: 'boot',
  userName: 'User',
  avatar: '🏕️',
  setPhase: (phase) => set({ phase, controlCenterOpen: false }),

  controlCenterOpen: false,
  setControlCenter: (controlCenterOpen) => set({ controlCenterOpen }),

  wifi: true,
  bluetooth: true,
  airdrop: false,
  focus: false,
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<SystemState>),

  brightness: 1,
  volume: 0.8,
  setBrightness: (brightness) => set({ brightness }),
  setVolume: (volume) => set({ volume }),
}))