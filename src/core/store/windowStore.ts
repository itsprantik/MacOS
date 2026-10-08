import { create } from 'zustand'
import { getApp } from '../appRegistry'
import type { WindowState } from '../types'

interface WindowStore {
  windows: WindowState[]
  activeId: string | null
  topZ: number
  openApp: (appId: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
}

const topVisible = (ws: WindowState[]) => {
  const visible = ws.filter((w) => !w.minimized)
  if (!visible.length) return null
  return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeId: null,
  topZ: 10,

  openApp: (appId) => {
    const app = getApp(appId)
    if (!app) return
    const { windows, topZ } = get()
    const existing = windows.find((w) => w.appId === appId)

    if (app.singleInstance && existing) {
      set({
        windows: windows.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, zIndex: topZ + 1 } : w,
        ),
        activeId: existing.id,
        topZ: topZ + 1,
      })
      return
    }

    const offset = (windows.length % 8) * 28
    const win: WindowState = {
      id: crypto.randomUUID(),
      appId,
      x: 140 + offset,
      y: 60 + offset,
      width: app.defaultSize.width,
      height: app.defaultSize.height,
      zIndex: topZ + 1,
      minimized: false,
      maximized: false,
    }
    set({ windows: [...windows, win], activeId: win.id, topZ: topZ + 1 })
  },

  closeWindow: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id)
      return { windows, activeId: s.activeId === id ? topVisible(windows) : s.activeId }
    }),

  focusWindow: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, zIndex: s.topZ + 1 } : w)),
      activeId: id,
      topZ: s.topZ + 1,
    })),

  minimizeWindow: (id) =>
    set((s) => {
      const windows = s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w))
      return { windows, activeId: s.activeId === id ? topVisible(windows) : s.activeId }
    }),

  toggleMaximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    })),

  moveWindow: (id, x, y) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)) })),

  resizeWindow: (id, width, height) =>
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, width, height } : w)) })),
}))