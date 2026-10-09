import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, ExternalLink, Trash2, Plus, Check } from 'lucide-react'
import { useCalendarStore } from '../../core/store/calendarStore'
import { useCalendarData } from '../../core/hooks/useCalendarData'
import { SOURCE_META, dayKey, eventDay, eventTime, type CalEvent, type Source } from '../../core/calendar/sources'
import { CAL_CONFIG } from '../../config/calendar'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SOURCES: Source[] = ['mine', 'f1', 'github', 'holiday']

export default function Calendar() {
  const today = new Date()
  const todayKey = dayKey(today)

  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(todayKey)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')

  const enabled = useCalendarStore((s) => s.enabled)
  const toggleSource = useCalendarStore((s) => s.toggleSource)
  const addEvent = useCalendarStore((s) => s.addEvent)
  const removeEvent = useCalendarStore((s) => s.removeEvent)

  // 6 weeks starting on the Sunday on/before the 1st
  const cells = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - cursor.getDay())
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }, [cursor])

  const years = Array.from(new Set([cells[0].getFullYear(), cells[41].getFullYear()]))
  const { events, loading, errors, refresh } = useCalendarData(years)

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>()
    events.forEach((e) => {
      const k = eventDay(e)
      const arr = m.get(k)
      if (arr) arr.push(e)
      else m.set(k, [e])
    })
    return m
  }, [events])

  const dayEvents = byDay.get(selected) ?? []
  const selectedLabel = new Date(`${selected}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1))
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(todayKey)
  }

  const add = () => {
    const t = title.trim()
    if (!t) return
    addEvent({ title: t, date: selected, time: time || undefined })
    setTitle('')
    setTime('')
  }

  const iconBtn =
    'w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10'

  return (
    <div className="w-full h-full flex bg-white/90 dark:bg-[#1c1c1e]/92 backdrop-blur-2xl text-neutral-900 dark:text-neutral-100 text-[13px]">
      {/* sidebar */}
      <aside className="w-[200px] shrink-0 bg-[#ececf0]/70 dark:bg-white/[0.04] border-r border-black/5 dark:border-white/10 pt-12 px-3 flex flex-col">
        <div className="px-1 mb-1 text-[11px] font-semibold text-neutral-400">Calendars</div>

        {SOURCES.map((s) => {
          const meta = SOURCE_META[s]
          const on = enabled[s]
          const label = s === 'holiday' ? `${meta.label} (${CAL_CONFIG.holidayCountry})` : meta.label
          return (
            <button
              key={s}
              onClick={() => toggleSource(s)}
              className="flex items-center gap-2 px-1 py-1.5 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/10"
              title={s === 'github' ? CAL_CONFIG.githubRepos.join(', ') : errors[s]}
            >
              <span
                className="w-3.5 h-3.5 rounded-[4px] flex items-center justify-center border"
                style={{ borderColor: meta.color, background: on ? meta.color : 'transparent' }}
              >
                {on && <Check size={10} strokeWidth={4} className="text-white" />}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {errors[s] && on && <span className="text-[10px] text-red-500">failed</span>}
            </button>
          )
        })}

        <div className="mt-auto pb-3 px-1 text-[11px] text-neutral-400 leading-snug">
          Synced from Jolpica (F1), GitHub and Nager.Date.
          <button
            onClick={refresh}
            className="mt-2 flex items-center gap-1.5 text-[12px] text-[#0a84ff] hover:underline"
          >
            <RotateCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </aside>

      {/* month */}
      <section className="flex-1 min-w-0 flex flex-col">
        <div className="h-[52px] shrink-0 flex items-center gap-2 px-5 border-b border-black/5 dark:border-white/10">
          <div className="text-[20px] font-bold">
            {cursor.toLocaleDateString('en-US', { month: 'long' })}{' '}
            <span className="font-normal text-neutral-400">{cursor.getFullYear()}</span>
          </div>
          <div className="flex-1" />
          <button className={iconBtn} onClick={() => shift(-1)}><ChevronLeft size={16} /></button>
          <button
            onClick={goToday}
            className="px-3 h-7 rounded-md bg-black/[0.06] dark:bg-white/10 text-[12px] font-medium"
          >
            Today
          </button>
          <button className={iconBtn} onClick={() => shift(1)}><ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-7 shrink-0 text-[11px] text-neutral-400 text-center py-1.5">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}>
          {cells.map((d) => {
            const k = dayKey(d)
            const inMonth = d.getMonth() === cursor.getMonth()
            const list = byDay.get(k) ?? []
            const isToday = k === todayKey

            return (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className={`flex flex-col gap-0.5 p-1 text-left overflow-hidden border-t border-l border-black/5 dark:border-white/10 ${
                  selected === k ? 'bg-[#0a84ff]/10' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`self-end w-6 h-6 text-[12px] flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[#ff3b30] text-white font-semibold' : inMonth ? '' : 'text-neutral-400'
                  }`}
                >
                  {d.getDate()}
                </span>
                {list.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className="text-[10px] leading-[14px] px-1 rounded-sm truncate border-l-2"
                    style={{ borderColor: SOURCE_META[e.source].color, background: `${SOURCE_META[e.source].color}22` }}
                  >
                    {e.title}
                  </span>
                ))}
                {list.length > 3 && <span className="text-[10px] text-neutral-500 px-1">+{list.length - 3} more</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* day panel */}
      <aside className="w-[250px] shrink-0 border-l border-black/5 dark:border-white/10 pt-12 px-4 pb-4 flex flex-col">
        <div className="text-[15px] font-semibold">{selectedLabel}</div>

        <div className="mt-3 flex-1 min-h-0 overflow-auto flex flex-col gap-2">
          {dayEvents.length === 0 && <div className="text-neutral-400">No events</div>}
          {dayEvents.map((e) => (
            <div
              key={e.id}
              className="rounded-lg p-2.5 border-l-4 bg-black/[0.04] dark:bg-white/[0.06]"
              style={{ borderColor: SOURCE_META[e.source].color }}
            >
              <div className="font-medium leading-snug">{e.title}</div>
              <div className="text-[11px] text-neutral-500">{eventTime(e)}</div>
              {e.subtitle && <div className="text-[11px] text-neutral-500 truncate">{e.subtitle}</div>}
              <div className="mt-1 flex items-center gap-3">
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#0a84ff]"
                  >
                    Open <ExternalLink size={10} />
                  </a>
                )}
                {e.source === 'mine' && (
                  <button
                    onClick={() => removeEvent(e.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-red-500"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-black/5 dark:border-white/10">
          <div className="text-[11px] font-semibold text-neutral-400 mb-1.5">New event</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Title"
            className="w-full h-8 rounded-md bg-black/[0.06] dark:bg-white/10 px-2 outline-none"
          />
          <div className="mt-1.5 flex gap-1.5">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 h-8 rounded-md bg-black/[0.06] dark:bg-white/10 px-2 outline-none"
            />
            <button
              onClick={add}
              className="px-3 h-8 rounded-md bg-[#0a84ff] text-white font-medium flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}