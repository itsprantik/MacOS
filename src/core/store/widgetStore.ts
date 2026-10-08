import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WidgetType = 'calendar' | 'weather' | 'clock' | 'battery' | 'glance'
export interface WidgetInstance {
  id: string
  type: WidgetType
}

interface WidgetState {
  widgets: WidgetInstance[]
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
}

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: [
        { id: 'w1', type: 'calendar' },
        { id: 'w2', type: 'weather' },
        { id: 'w3', type: 'clock' },
        { id: 'w4', type: 'battery' },
        { id: 'w5', type: 'glance' },
      ],
      addWidget: (type) =>
        set((s) => ({ widgets: [...s.widgets, { id: crypto.randomUUID(), type }] })),
      removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),
    }),
    { name: 'webos-widgets' },
  ),
)