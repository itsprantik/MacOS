import {create  } from 'zustand'
export type Phase = 'boot' | 'login' | 'desktop'

interface SystemState {
  phase: Phase
  userName: string
  setPhase: (phase: Phase) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  phase: 'boot',
  userName: 'User',
  setPhase: (phase) => set({ phase }),
}))