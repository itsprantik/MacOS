import { create } from 'zustand'

function beep() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    ;[0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      const at = ctx.currentTime + t
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.3, at + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.25)
      o.start(at)
      o.stop(at + 0.3)
    })
  } catch {
    /* audio not available */
  }
}

interface TimerState {
  total: number // seconds
  remaining: number // seconds
  running: boolean
  finished: boolean
  endAt: number | null
  setTotal: (sec: number) => void
  start: () => void
  pause: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  total: 300,
  remaining: 300,
  running: false,
  finished: false,
  endAt: null,

  setTotal: (sec) => {
    if (get().running) return
    set({ total: sec, remaining: sec, finished: false })
  },

  start: () => {
    const s = get()
    const remaining = s.remaining > 0 ? s.remaining : s.total
    if (remaining <= 0) return
    set({ running: true, finished: false, remaining, endAt: Date.now() + remaining * 1000 })
  },

  pause: () => {
    const s = get()
    if (!s.running || !s.endAt) return
    set({ running: false, remaining: Math.max(0, (s.endAt - Date.now()) / 1000), endAt: null })
  },

  reset: () => set((s) => ({ running: false, finished: false, endAt: null, remaining: s.total })),
}))

setInterval(() => {
  const s = useTimerStore.getState()
  if (!s.running || !s.endAt) return
  const rem = Math.max(0, (s.endAt - Date.now()) / 1000)
  if (rem <= 0) {
    useTimerStore.setState({ remaining: 0, running: false, finished: true, endAt: null })
    beep()
  } else {
    useTimerStore.setState({ remaining: rem })
  }
}, 200)