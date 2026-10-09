import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { gridSize } from '../widgetGrid'

export type WidgetType =
  | 'calendar' | 'month' | 'upnext' | 'weather' | 'clock' | 'timer'
  | 'battery' | 'nowplaying' | 'news' | 'f1' | 'github' | 'glance'

export interface WidgetInstance {
  id: string
  type: WidgetType
  col: number
  row: number
}

export const WIDGET_SIZE: Record<WidgetType, { w: number; h: number }> = {
  calendar: { w: 1, h: 1 },
  month: { w: 2, h: 2 },
  upnext: { w: 2, h: 1 },
  weather: { w: 1, h: 1 },
  clock: { w: 1, h: 1 },
  timer: { w: 1, h: 1 },
  battery: { w: 1, h: 1 },
  nowplaying: { w: 2, h: 1 },
  news: { w: 2, h: 1 },
  f1: { w: 2, h: 1 },
  github: { w: 2, h: 1 },
  glance: { w: 2, h: 1 },
}

// nearest free spot for a widget of this size
function nearestFree(
  ws: WidgetInstance[], type: WidgetType, ignoreId: string | null, col: number, row: number,
) {
  const { cols, rows } = gridSize()
  const { w, h } = WIDGET_SIZE[type]

  const taken = new Set<string>()
  for (const o of ws) {
    if (o.id === ignoreId) continue
    const s = WIDGET_SIZE[o.type]
    for (let c = 0; c < s.w; c++) for (let r = 0; r < s.h; r++) taken.add(`${o.col + c},${o.row + r}`)
  }

  let best: { col: number; row: number } | null = null
  let bestD = Infinity
  for (let r = 0; r <= rows - h; r++) {
    for (let c = 0; c <= cols - w; c++) {
      let free = true
      for (let dc = 0; dc < w && free; dc++)
        for (let dr = 0; dr < h; dr++)
          if (taken.has(`${c + dc},${r + dr}`)) {
            free = false
            break
          }
      if (!free) continue
      const d = (c - col) ** 2 + (r - row) ** 2
      if (d < bestD) {
        bestD = d
        best = { col: c, row: r }
      }
    }
  }
  return (
    best ?? {
      col: Math.max(0, Math.min(col, cols - w)),
      row: Math.max(0, Math.min(row, rows - h)),
    }
  )
}

export function defaultWidgets(): WidgetInstance[] {
  const { cols } = gridSize()
  const right = Math.max(0, cols - 2)
  return [
    { id: 'w1', type: 'calendar', col: right, row: 0 },
    { id: 'w2', type: 'weather', col: right + 1, row: 0 },
    { id: 'w3', type: 'clock', col: right, row: 1 },
    { id: 'w4', type: 'battery', col: right + 1, row: 1 },
    { id: 'w5', type: 'glance', col: right, row: 2 },
  ]
}

interface WidgetState {
  widgets: WidgetInstance[]
  addWidget: (type: WidgetType) => void
  moveWidget: (id: string, col: number, row: number) => void
  removeWidget: (id: string) => void
  resetWidgets: () => void
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets(),

      addWidget: (type) =>
        set((s) => {
          const { cols } = gridSize()
          const pos = nearestFree(s.widgets, type, null, cols - WIDGET_SIZE[type].w, 0)
          return { widgets: [...s.widgets, { id: crypto.randomUUID(), type, ...pos }] }
        }),

      moveWidget: (id, col, row) =>
        set((s) => {
          const w = s.widgets.find((x) => x.id === id)
          if (!w) return s
          const pos = nearestFree(s.widgets, w.type, id, col, row)
          return { widgets: s.widgets.map((x) => (x.id === id ? { ...x, ...pos } : x)) }
        }),

      removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

      resetWidgets: () => set({ widgets: defaultWidgets() }),
    }),
    { name: 'webos-widgets-v2', version: 2 },
  ),
)