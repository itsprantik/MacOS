import { create } from 'zustand'

export type Phase = 'boot' | 'login' | 'desktop'

interface SystemState {
  phase: Phase
  userName: string
  avatar: string // an emoji, or an image path like '/avatar.png'
  setPhase: (phase: Phase) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  phase: 'boot',
  userName: 'User',
  avatar: '🏕️',
  setPhase: (phase) => set({ phase }),
}))