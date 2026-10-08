import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { gridSize } from '../widgetGrid'

export type WidgetType = 'calendar' | 'weather' | 'clock' | 'battery' | 'glance'
export interface WidgetInstance {
  id: string
  type: WidgetType
  col: number
  row: number
}

export const WIDGET_SPAN: Record<WidgetType, number> = {
  calendar: 1,
  weather: 1,
  clock: 1,
  battery: 1,
  glance: 2,
}

// nearest free grid cell to (col,row) that fits this widget
function nearestFree(ws: WidgetInstance[], type: WidgetType, ignoreId: string | null, col: number, row: number) {
  const { cols, rows } = gridSize()
  const span = WIDGET_SPAN[type]
  const taken = new Set<string>()
  for (const w of ws) {
    if (w.id === ignoreId) continue
    for (let c = 0; c < WIDGET_SPAN[w.type]; c++) taken.add(`${w.col + c},${w.row}`)
  }

  let best: { col: number; row: number } | null = null
  let bestD = Infinity
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - span; c++) {
      let free = true
      for (let k = 0; k < span; k++) {
        if (taken.has(`${c + k},${r}`)) {
          free = false
          break
        }
      }
      if (!free) continue
      const d = (c - col) ** 2 + (r - row) ** 2
      if (d < bestD) {
        bestD = d
        best = { col: c, row: r }
      }
    }
  }
  return best ?? { col: Math.max(0, Math.min(col, cols - span)), row: Math.max(0, Math.min(row, rows - 1)) }
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
          const pos = nearestFree(s.widgets, type, null, cols - WIDGET_SPAN[type], 0)
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