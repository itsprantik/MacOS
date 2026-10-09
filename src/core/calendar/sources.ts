import { CAL_CONFIG } from '../../config/calendar'

export type Source = 'mine' | 'f1' | 'github' | 'holiday'

export interface CalEvent {
  id: string
  source: Source
  title: string
  subtitle?: string
  start: string // ISO string, or a local "YYYY-MM-DDTHH:mm:ss" for all-day / own events
  allDay: boolean
  url?: string
  round?: number // F1 round number
}

export const SOURCE_META: Record<Source, { label: string; color: string }> = {
  mine: { label: 'My Events', color: '#0a84ff' },
  f1: { label: 'Formula 1', color: '#e10600' },
  github: { label: 'GitHub Releases', color: '#8250df' },
  holiday: { label: 'Holidays', color: '#30d158' },
}

const pad = (n: number) => String(n).padStart(2, '0')
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const eventDay = (e: CalEvent) => dayKey(new Date(e.start))
export const eventTime = (e: CalEvent) =>
  e.allDay ? 'all-day' : new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

/* ---------- cache (memory + localStorage, 6 hours) ---------- */

const TTL = 6 * 60 * 60 * 1000
const PREFIX = 'webos-cal:'
const mem = new Map<string, Promise<CalEvent[]>>()

function readCache(key: string): { at: number; events: CalEvent[] } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(key: string, events: CalEvent[]) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), events }))
  } catch {
    /* storage full or blocked */
  }
}

export function clearCalendarCache() {
  mem.clear()
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

function cached(key: string, load: () => Promise<CalEvent[]>): Promise<CalEvent[]> {
  const hit = mem.get(key)
  if (hit) return hit

  const stored = readCache(key)
  if (stored && Date.now() - stored.at < TTL) {
    const p = Promise.resolve(stored.events)
    mem.set(key, p)
    return p
  }

  const p = load()
    .then((events) => {
      writeCache(key, events)
      return events
    })
    .catch((err) => {
      mem.delete(key)
      if (stored) return stored.events // old data beats nothing
      throw err
    })
  mem.set(key, p)
  return p
}

/* ---------- Formula 1 (Jolpica, free, no key) ---------- */

const F1_SESSIONS: [string, string][] = [
  ['FirstPractice', 'Practice 1'],
  ['SecondPractice', 'Practice 2'],
  ['ThirdPractice', 'Practice 3'],
  ['SprintQualifying', 'Sprint Qualifying'],
  ['SprintShootout', 'Sprint Shootout'],
  ['Sprint', 'Sprint'],
  ['Qualifying', 'Qualifying'],
]

export const fetchF1 = (year: number) =>
  cached(`f1:${year}`, async () => {
    const res = await fetch(`https://api.jolpi.ca/ergast/f1/${year}.json`)
    if (!res.ok) throw new Error(`F1 schedule unavailable (${res.status})`)

    const json = await res.json()
    const races: any[] = json?.MRData?.RaceTable?.Races ?? []
    const out: CalEvent[] = []

    for (const r of races) {
      const place = `${r.Circuit?.Location?.locality}, ${r.Circuit?.Location?.country}`
      const short = String(r.raceName).replace(' Grand Prix', ' GP')
      const stamp = (s: any) => `${s.date}T${s.time ?? '00:00:00Z'}`
      const round = Number(r.round)

      for (const [key, label] of F1_SESSIONS) {
        const s = r[key]
        if (!s?.date) continue
        out.push({
          id: `f1-${year}-${r.round}-${key}`,
          source: 'f1',
          title: `${short} · ${label}`,
          subtitle: place,
          start: stamp(s),
          allDay: false,
          round,
        })
      }

      out.push({
        id: `f1-${year}-${r.round}-race`,
        source: 'f1',
        title: `🏁 ${r.raceName}`,
        subtitle: `${r.Circuit?.circuitName} · ${place}`,
        start: stamp(r),
        allDay: false,
        url: r.url,
        round,
      })
    }
    return out
  })

/* ---------- GitHub releases (public API, 60 requests/hour without a token) ---------- */

export const fetchReleases = (repos: string[]) =>
  cached(`gh:${repos.join(',')}`, async () => {
    const results = await Promise.allSettled(
      repos.map(async (repo): Promise<CalEvent[]> => {
        const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=12`, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!res.ok) throw new Error(`${repo}: ${res.status}`)
        const list: any[] = await res.json()
        return list
          .filter((r) => !r.draft && r.published_at)
          .map((r) => ({
            id: `gh-${repo}-${r.id}`,
            source: 'github' as const,
            title: `${repo.split('/')[1]} ${r.tag_name}`,
            subtitle: r.prerelease ? `${repo} · Pre-release` : repo,
            start: r.published_at as string,
            allDay: false,
            url: r.html_url as string,
          }))
      }),
    )

    const ok = results.filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === 'fulfilled')
    if (!ok.length) throw new Error('GitHub releases unavailable (rate limit?)')
    return ok.flatMap((r) => r.value)
  })

/* ---------- public holidays (Nager.Date, free, no key) ---------- */

export const fetchHolidays = (year: number, country = CAL_CONFIG.holidayCountry) =>
  cached(`hol:${country}:${year}`, async () => {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`)
    if (!res.ok) throw new Error(`Holidays unavailable (${res.status})`)
    const list: any[] = await res.json()
    return list.map((h) => ({
      id: `hol-${country}-${h.date}-${h.name}`,
      source: 'holiday' as const,
      title: (h.localName || h.name) as string,
      subtitle: h.name as string,
      start: `${h.date}T00:00:00`,
      allDay: true,
    }))
  })