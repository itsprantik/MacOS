import { useEffect, useMemo, useState } from 'react'
import { useCalendarStore } from '../store/calendarStore'
import { CAL_CONFIG } from '../../config/calendar'
import {
  clearCalendarCache, fetchF1, fetchHolidays, fetchReleases,
  type CalEvent, type Source,
} from '../calendar/sources'

interface Options {
  only?: Source[] // limit to these sources
  ignoreToggles?: boolean // widgets show their data even if the calendar toggle is off
}

const REMOTE: Source[] = ['f1', 'github', 'holiday']

// resolves with whatever succeeded, throws only if every request failed
async function gather(ps: Promise<CalEvent[]>[]) {
  const res = await Promise.allSettled(ps)
  const ok = res.filter((r): r is PromiseFulfilledResult<CalEvent[]> => r.status === 'fulfilled')
  if (!ok.length) throw (res[0] as PromiseRejectedResult).reason
  return ok.flatMap((r) => r.value)
}

export function useCalendarData(years: number[], opts: Options = {}) {
  const enabled = useCalendarStore((s) => s.enabled)
  const mine = useCalendarStore((s) => s.mine)

  const [remote, setRemote] = useState<Partial<Record<Source, CalEvent[]>>>({})
  const [errors, setErrors] = useState<Partial<Record<Source, string>>>({})
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  const yearsKey = years.join(',')
  const onlyKey = opts.only?.join(',') ?? '*'
  const ignore = !!opts.ignoreToggles

  const allowed = (s: Source) => onlyKey === '*' || onlyKey.split(',').includes(s)
  const active = (s: Source) => allowed(s) && (ignore || enabled[s])
  const activeKey = REMOTE.filter(active).join(',')

  useEffect(() => {
    let cancelled = false
    const ys = yearsKey.split(',').map(Number)
    const srcs = (activeKey ? activeKey.split(',') : []) as Source[]

    const jobs = srcs.map((source) => ({
      source,
      run:
        source === 'f1'
          ? gather(ys.map((y) => fetchF1(y)))
          : source === 'holiday'
            ? gather(ys.map((y) => fetchHolidays(y, CAL_CONFIG.holidayCountry)))
            : fetchReleases(CAL_CONFIG.githubRepos),
    }))

    setLoading(true)
    Promise.allSettled(jobs.map((j) => j.run)).then((res) => {
      if (cancelled) return
      const next: Partial<Record<Source, CalEvent[]>> = {}
      const errs: Partial<Record<Source, string>> = {}
      res.forEach((r, i) => {
        const src = jobs[i].source
        if (r.status === 'fulfilled') next[src] = r.value
        else errs[src] = String((r.reason as any)?.message ?? r.reason)
      })
      setRemote(next)
      setErrors(errs)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [yearsKey, activeKey, tick])

  const events = useMemo(() => {
    const all: CalEvent[] = []
    if (allowed('mine') && (ignore || enabled.mine)) all.push(...mine)
    REMOTE.forEach((s) => {
      if (active(s) && remote[s]) all.push(...remote[s]!)
    })
    return all.sort((a, b) => +new Date(a.start) - +new Date(b.start))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, mine, remote, onlyKey, ignore])

  const refresh = () => {
    clearCalendarCache()
    setTick((t) => t + 1)
  }

  return { events, loading, errors, refresh }
}