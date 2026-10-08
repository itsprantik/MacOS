import { create } from 'zustand'
import { tracks } from '../../apps/Music/tracks'
import { useSystemStore } from './systemStore'

const audio = new Audio()
audio.preload = 'metadata'
audio.volume = useSystemStore.getState().volume
useSystemStore.subscribe((s) => {
  audio.volume = s.volume
})

type Repeat = 'off' | 'all' | 'one'

interface MusicState {
  currentIndex: number | null
  isPlaying: boolean
  progress: number
  duration: number
  shuffle: boolean
  repeat: Repeat
  playIndex: (i: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
}

export const useMusicStore = create<MusicState>((set, get) => {
  audio.addEventListener('timeupdate', () => set({ progress: audio.currentTime }))
  audio.addEventListener('loadedmetadata', () => set({ duration: audio.duration }))
  audio.addEventListener('play', () => set({ isPlaying: true }))
  audio.addEventListener('pause', () => set({ isPlaying: false }))
  audio.addEventListener('ended', () => {
    if (get().repeat === 'one') {
      audio.currentTime = 0
      audio.play()
    } else {
      get().next()
    }
  })

  return {
    currentIndex: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    shuffle: false,
    repeat: 'off',

    playIndex: (i) => {
      if (get().currentIndex === i) {
        get().toggle()
        return
      }
      audio.src = tracks[i].src
      audio.play().catch(() => {})
      set({ currentIndex: i, progress: 0, duration: 0 })
    },

    toggle: () => {
      if (get().currentIndex === null) {
        get().playIndex(0)
      } else if (audio.paused) {
        audio.play().catch(() => {})
      } else {
        audio.pause()
      }
    },

    next: () => {
      const { currentIndex, shuffle, repeat } = get()
      const cur = currentIndex ?? -1
      let n = (cur + 1) % tracks.length
      if (shuffle && tracks.length > 1) {
        do n = Math.floor(Math.random() * tracks.length)
        while (n === cur)
      } else if (repeat === 'off' && cur === tracks.length - 1) {
        audio.pause()
        audio.currentTime = 0
        return
      }
      set({ currentIndex: null }) // force reload even if same index
      get().playIndex(n)
    },

    prev: () => {
      const { currentIndex } = get()
      if (currentIndex === null) return
      if (audio.currentTime > 3) {
        audio.currentTime = 0
        return
      }
      set({ currentIndex: null })
      get().playIndex((currentIndex - 1 + tracks.length) % tracks.length)
    },

    seek: (t) => {
      audio.currentTime = t
      set({ progress: t })
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
    cycleRepeat: () =>
      set((s) => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  }
})