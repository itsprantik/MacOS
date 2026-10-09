import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalEvent, Source } from '../calendar/sources'

interface CalendarState {
  enabled: Record<Source, boolean>
  mine: CalEvent[]
  toggleSource: (s: Source) => void
  addEvent: (e: { title: string; date: string; time?: string; note?: string }) => void
  removeEvent: (id: string) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      enabled: { mine: true, f1: true, github: true, holiday: true },
      mine: [],

      toggleSource: (s) => set((st) => ({ enabled: { ...st.enabled, [s]: !st.enabled[s] } })),

      addEvent: ({ title, date, time, note }) =>
        set((st) => ({
          mine: [
            ...st.mine,
            {
              id: crypto.randomUUID(),
              source: 'mine',
              title,
              subtitle: note || undefined,
              start: `${date}T${time || '00:00'}:00`,
              allDay: !time,
            },
          ],
        })),

      removeEvent: (id) => set((st) => ({ mine: st.mine.filter((e) => e.id !== id) })),
    }),
    { name: 'webos-calendar' },
  ),
)