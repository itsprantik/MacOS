import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Moon, Navigation, Laptop, Play, Pause, SkipForward, Code, Newspaper, RotateCcw } from 'lucide-react'
import { useBattery } from '../core/hooks/useBattery'
import { useCalendarData } from '../core/hooks/useCalendarData'
import { useWindowStore } from '../core/store/windowStore'
import { useMusicStore } from '../core/store/musicStore'
import { useTimerStore } from '../core/store/timerStore'
import { tracks } from '../apps/Music/tracks'
import { topHeadlines, type Article } from '../apps/News/api'
import { NEWS_API_KEY } from '../config/keys'
import { dayKey, eventDay, SOURCE_META, type CalEvent } from '../core/calendar/sources'
import { CELL, GAP } from '../core/widgetGrid'
import type { WidgetType } from '../core/store/widgetStore'

// Weather is static for now. Edit these, or ask me to wire a live API.
const CITY = 'Cupertino'
const WEATHER = { temp: 58, condition: 'Clear', high: 79, low: 53 }

const dim = (n: number) => n * CELL + (n - 1) * GAP
const open = (id: string) => useWindowStore.getState().openApp(id)

function useNow(ms = 60000) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

const ago = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d < 60 ? `${d}d ago` : `${Math.round(d / 30)}mo ago`
}

const when = (e: CalEvent, now: Date) => {
  const k = eventDay(e)
  const tomorrow = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  if (k === dayKey(now)) {
    return e.allDay ? 'Today' : new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  if (k === tomorrow) return 'Tomorrow'
  return new Date(e.start).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}

function Card({
  children, w = 1, h = 1, pad = true, className = '', onClick,
}: {
  children: ReactNode
  w?: number
  h?: number
  pad?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[28px] text-white overflow-hidden bg-gradient-to-b from-white/15 to-black/35 backdrop-blur-2xl border border-white/25 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${
        pad ? 'p-4' : 'p-2.5'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: dim(w), height: dim(h) }}
    >
      {children}
    </div>
  )
}

/* ---------------- calendar ---------------- */

export function CalendarWidget() {
  const now = useNow()
  const { events } = useCalendarData([now.getFullYear()])
  const todays = events.filter((e) => eventDay(e) === dayKey(now))
  const first = todays[0]

  return (
    <Card onClick={() => open('calendar')} className="flex flex-col justify-between">
      <div>
        <div className="text-[13px] font-semibold uppercase tracking-wide text-[#ff453a]">
          {now.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-[44px] font-light leading-none mt-0.5">{now.getDate()}</div>
      </div>
      <div className="text-[12px] leading-tight">
        {first ? (
          <>
            <div className="font-semibold line-clamp-2">{first.title}</div>
            {todays.length > 1 && <div className="text-white/60">+{todays.length - 1} more</div>}
          </>
        ) : (
          <span className="text-white/60">No events today</span>
        )}
      </div>
    </Card>
  )
}

export function MonthWidget() {
  const now = useNow()
  const y = now.getFullYear()
  const m = now.getMonth()
  const { events } = useCalendarData([y])

  const marked = useMemo(() => {
    const s = new Set<string>()
    events.forEach((e) => s.add(eventDay(e)))
    return s
  }, [events])

  const first = new Date(y, m, 1)
  const cells = Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - first.getDay() + i))
  const rows = cells.slice(35).every((d) => d.getMonth() !== m) ? 5 : 6
  const todayKey = dayKey(now)

  return (
    <Card w={2} h={2} onClick={() => open('calendar')} className="flex flex-col">
      <div className="text-[15px] font-semibold text-[#ff453a]">
        {now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}{' '}
        <span className="text-white/50 font-normal">{y}</span>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-white/60">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div
        className="mt-1 flex-1 grid grid-cols-7 text-center text-[13px]"
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {cells.slice(0, rows * 7).map((d) => {
          const k = dayKey(d)
          const inMonth = d.getMonth() === m
          return (
            <div key={k} className="flex flex-col items-center justify-center">
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  k === todayKey ? 'bg-[#ff453a] font-semibold' : ''
                } ${inMonth ? '' : 'text-white/30'}`}
              >
                {d.getDate()}
              </span>
              <span className={`w-1 h-1 rounded-full ${marked.has(k) && inMonth ? 'bg-white/70' : 'bg-transparent'}`} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export function UpNextWidget() {
  const now = useNow()
  const { events } = useCalendarData([now.getFullYear(), now.getFullYear() + 1])
  const todayKey = dayKey(now)
  const upcoming = events
    .filter((e) => (e.allDay ? eventDay(e) >= todayKey : +new Date(e.start) >= now.getTime()))
    .slice(0, 3)

  return (
    <Card w={2} onClick={() => open('calendar')} className="flex flex-col">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[#ff453a]">Up Next</div>
      <div className="mt-2 flex flex-col gap-2">
        {upcoming.length === 0 && <div className="text-white/60 text-[13px]">Nothing coming up</div>}
        {upcoming.map((e) => (
          <div key={e.id} className="flex items-center gap-2.5">
            <span className="w-1 h-7 rounded-full shrink-0" style={{ background: SOURCE_META[e.source].color }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{e.title}</div>
              <div className="text-[11px] text-white/60 truncate">{e.subtitle ?? SOURCE_META[e.source].label}</div>
            </div>
            <div className="text-[12px] text-white/70 shrink-0">{when(e, now)}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ---------------- F1 + GitHub ---------------- */

export function F1Widget() {
  const now = useNow(30000)
  const y = now.getFullYear()
  const { events, errors, loading } = useCalendarData([y, y + 1], { only: ['f1'], ignoreToggles: true })

  const next = events
    .filter((e) => e.id.endsWith('-race'))
    .find((e) => +new Date(e.start) + 2 * 3600 * 1000 > now.getTime())

  const ms = next ? +new Date(next.start) - now.getTime() : 0
  const days = Math.floor(ms / 86400000)
  const hrs = Math.floor((ms % 86400000) / 3600000)

  return (
    <Card w={2} pad={false} onClick={() => open('calendar')} className="flex">
      <div className="w-1.5 rounded-full bg-[#e10600] my-1 ml-1 shrink-0" />
      <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
        {next ? (
          <>
            <div>
              <div className="text-[11px] font-bold tracking-wide text-[#ff5a52]">
                F1 · NEXT RACE · ROUND {next.round}
              </div>
              <div className="mt-1 text-[18px] font-semibold leading-tight line-clamp-2">
                {next.title.replace('🏁 ', '')}
              </div>
              <div className="text-[12px] text-white/60 truncate">{next.subtitle}</div>
            </div>
            <div className="text-[12px] text-white/70">
              {new Date(next.start).toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </div>
          </>
        ) : (
          <div className="text-[13px] text-white/60 m-auto text-center">
            {loading ? 'Loading F1 schedule…' : errors.f1 ?? 'No upcoming races'}
          </div>
        )}
      </div>
      {next && (
        <div className="w-[84px] shrink-0 flex flex-col items-center justify-center">
          {ms <= 0 ? (
            <div className="text-[18px] font-bold text-[#ff5a52]">LIVE</div>
          ) : (
            <>
              <div className="text-[40px] font-light leading-none">{days > 0 ? days : hrs}</div>
              <div className="text-[11px] text-white/60 uppercase">{days > 0 ? (days === 1 ? 'day' : 'days') : 'hours'}</div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

export function GitHubWidget() {
  const now = useNow(60000)
  const { events, errors, loading } = useCalendarData([now.getFullYear()], { only: ['github'], ignoreToggles: true })
  const latest = events
    .filter((e) => +new Date(e.start) <= now.getTime())
    .sort((a, b) => +new Date(b.start) - +new Date(a.start))
    .slice(0, 3)

  return (
    <Card w={2} className="flex flex-col">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#b794ff]">
        <Code size={13} /> Latest releases
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {latest.length === 0 && (
          <div className="text-white/60 text-[13px]">{loading ? 'Loading releases…' : errors.github ?? 'No releases found'}</div>
        )}
        {latest.map((e) => {
          const [name, ...rest] = e.title.split(' ')
          return (
            <a
              key={e.id}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-1 -mx-1"
            >
              <span className="text-[13px] font-medium truncate flex-1">{name}</span>
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/15">{rest.join(' ')}</span>
              <span className="text-[11px] text-white/60 w-[58px] text-right">{ago(e.start)}</span>
            </a>
          )
        })}
      </div>
    </Card>
  )
}

/* ---------------- music / timer / news ---------------- */

export function NowPlayingWidget() {
  const currentIndex = useMusicStore((s) => s.currentIndex)
  const isPlaying = useMusicStore((s) => s.isPlaying)
  const toggle = useMusicStore((s) => s.toggle)
  const next = useMusicStore((s) => s.next)
  const track = currentIndex !== null ? tracks[currentIndex] : null
  const [bad, setBad] = useState(false)
  useEffect(() => setBad(false), [track?.cover])

  return (
    <Card w={2} pad={false} className="flex items-center gap-3">
      <button
        onClick={() => open('music')}
        className="w-[134px] h-[134px] rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-[#fa233b] to-[#ff8a9a]"
      >
        {track && !bad && (
          <img src={track.cover} alt="" onError={() => setBad(true)} className="w-full h-full object-cover" />
        )}
      </button>
      <div className="flex-1 min-w-0 h-full py-1.5 pr-2 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#ff6b7d]">Now Playing</div>
          <div className="mt-1 text-[16px] font-semibold leading-tight line-clamp-2">{track?.title ?? 'Not Playing'}</div>
          <div className="text-[12px] text-white/60 truncate">{track?.artist ?? 'Open Music to start'}</div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggle}>
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={next}><SkipForward size={20} fill="currentColor" /></button>
        </div>
      </div>
    </Card>
  )
}

const fmtTimer = (s: number) => {
  const t = Math.ceil(s)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = t % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}

export function TimerWidget() {
  const { remaining, running, finished, start, pause, reset } = useTimerStore()
  return (
    <Card className="flex flex-col justify-between">
      <button onClick={() => open('clock')} className="text-left text-[12px] font-semibold uppercase tracking-wide text-[#ff9f0a]">
        {finished ? "Time's up" : 'Timer'}
      </button>
      <div className="text-[34px] font-light leading-none tabular-nums">{finished ? '0:00' : fmtTimer(remaining)}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={running ? pause : start}
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            running ? 'bg-[#ff9f0a]/30 text-[#ff9f0a]' : 'bg-[#30d158]/30 text-[#30d158]'
          }`}
        >
          {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button onClick={reset} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <RotateCcw size={15} />
        </button>
      </div>
    </Card>
  )
}

export function NewsWidget() {
  const [item, setItem] = useState<Article | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!NEWS_API_KEY) return
    let cancelled = false
    topHeadlines(localStorage.getItem('webos-news-region') ?? 'us', 'general')
      .then((a) => !cancelled && setItem(a[0] ?? null))
      .catch((e) => !cancelled && setErr(String(e?.message ?? e)))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card w={2} onClick={() => open('news')} className="flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-[#ff6b7d]">
        <Newspaper size={13} /> Top Story{item ? ` · ${item.source.name}` : ''}
      </div>
      {!NEWS_API_KEY ? (
        <div className="text-[13px] text-white/60">Add VITE_NEWS_API_KEY to see headlines.</div>
      ) : item ? (
        <div className="text-[17px] font-semibold leading-snug line-clamp-3">{item.title}</div>
      ) : (
        <div className="text-[13px] text-white/60">{err ?? 'Loading headlines…'}</div>
      )}
      <div className="text-[11px] text-white/50">{item ? ago(item.publishedAt) : ' '}</div>
    </Card>
  )
}

/* ---------------- original widgets ---------------- */

export function WeatherWidget() {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="text-[15px] font-semibold flex items-center gap-1">
          {CITY} <Navigation size={11} fill="currentColor" />
        </div>
        <div className="text-[44px] font-light leading-none">{WEATHER.temp}°</div>
      </div>
      <div>
        <Moon size={15} />
        <div className="text-[13px] font-semibold mt-0.5">{WEATHER.condition}</div>
        <div className="text-[13px] font-semibold">H:{WEATHER.high}° L:{WEATHER.low}°</div>
      </div>
    </Card>
  )
}

export function ClockWidget() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60

  return (
    <Card pad={false} className="flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.18)" />
        {Array.from({ length: 60 }).map((_, i) => {
          const major = i % 5 === 0
          return (
            <line
              key={i}
              x1="50" y1={major ? 5 : 4.5} x2="50" y2={major ? 9 : 7}
              stroke="white" strokeWidth={major ? 1.4 : 0.6} opacity={major ? 0.9 : 0.5}
              transform={`rotate(${i * 6} 50 50)`}
            />
          )
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1
          const a = ((n * 30 - 90) * Math.PI) / 180
          return (
            <text
              key={n}
              x={50 + Math.cos(a) * 34} y={50 + Math.sin(a) * 34}
              fontSize="9" fontWeight="600" fill="white" textAnchor="middle" dominantBaseline="central"
            >
              {n}
            </text>
          )
        })}
        <line x1="50" y1="50" x2="50" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" transform={`rotate(${h * 30} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${m * 6} 50 50)`} />
        <line x1="50" y1="56" x2="50" y2="12" stroke="white" strokeWidth="0.8" transform={`rotate(${s * 6} 50 50)`} />
        <circle cx="50" cy="50" r="2.5" fill="white" />
      </svg>
    </Card>
  )
}

export function BatteryWidget() {
  const { level } = useBattery()
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <Card className="flex flex-col justify-between">
      <div className="relative w-[62px] h-[62px]">
        <svg width="62" height="62" viewBox="0 0 62 62">
          <circle cx="31" cy="31" r={R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" />
          <circle
            cx="31" cy="31" r={R} fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - level)} transform="rotate(-90 31 31)"
          />
        </svg>
        <Laptop size={22} className="absolute inset-0 m-auto" />
      </div>
      <div className="text-[40px] font-light leading-none">{Math.round(level * 100)}%</div>
    </Card>
  )
}

export function GlanceWidget() {
  return (
    <Card w={2} className="flex items-center">
      <div>
        <div className="font-mono text-[11px] text-white/80">Your day at a glance</div>
        <div className="mt-2 text-[26px] leading-tight" style={{ fontFamily: '"New York", Georgia, serif' }}>
          You call the shots.
        </div>
      </div>
    </Card>
  )
}

/* ---------------- registry ---------------- */

export interface WidgetDef {
  label: string
  category: string
  description: string
  Component: ComponentType
}

export const widgetTypes: Record<WidgetType, WidgetDef> = {
  calendar: { label: 'Today', category: 'Calendar', description: "Today's date and first event", Component: CalendarWidget },
  month: { label: 'Month', category: 'Calendar', description: 'Month view with event dots', Component: MonthWidget },
  upnext: { label: 'Up Next', category: 'Calendar', description: 'Your next three events', Component: UpNextWidget },
  clock: { label: 'Clock', category: 'Clock', description: 'Analog clock', Component: ClockWidget },
  timer: { label: 'Timer', category: 'Clock', description: 'Start and pause your timer', Component: TimerWidget },
  weather: { label: 'Weather', category: 'Weather', description: 'Current conditions', Component: WeatherWidget },
  battery: { label: 'Batteries', category: 'Battery', description: 'Battery level', Component: BatteryWidget },
  nowplaying: { label: 'Now Playing', category: 'Music', description: 'Control your music', Component: NowPlayingWidget },
  news: { label: 'Top Story', category: 'News', description: 'Headline from NewsAPI', Component: NewsWidget },
  f1: { label: 'Next Race', category: 'Sports', description: 'Formula 1 countdown', Component: F1Widget },
  github: { label: 'Releases', category: 'Developer', description: 'Latest GitHub releases', Component: GitHubWidget },
  glance: { label: 'Day at a Glance', category: 'Productivity', description: 'A line for your day', Component: GlanceWidget },
}