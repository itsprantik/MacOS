import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  ChevronLeft, ChevronRight, RotateCw, Search, Share, Plus, Copy, PanelLeft,
  Lock, Globe, X, Check,
} from 'lucide-react'
import { GOOGLE_CSE_ID } from '../../config/keys'
import { useWindowStore } from '../../core/store/windowStore'
import { useSystemStore } from '../../core/store/systemStore'
import { useUiStore } from '../../core/store/uiStore'
import { useWallpaperStyle } from '../../core/wallpaper'

/* ------------------------------- types -------------------------------- */

type Entry =
  | { kind: 'start' }
  | { kind: 'results'; q: string }
  | { kind: 'page'; url: string }

interface Tab {
  id: string
  hist: Entry[]
  idx: number
  title: string
  icon?: string
}

interface Fav {
  name: string
  url: string
}

interface Visit {
  url: string
  title: string
  at: number
}

type Section = 'Top Hit' | 'Switch to Tab' | 'Google Suggestions'

interface Row {
  section: Section
  title: string
  sub?: string
  icon: 'globe' | 'search'
  run: () => void
}

/* ----------------------------- constants ------------------------------ */

const DEFAULT_FAVS: Fav[] = [
  { name: 'Apple', url: 'https://www.apple.com' },
  { name: 'iCloud', url: 'https://www.icloud.com' },
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'Facebook', url: 'https://www.facebook.com' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
]

const SUGGESTED: Visit[] = [
  { url: 'https://en.wikipedia.org', title: 'Wikipedia', at: 0 },
  { url: 'https://github.com', title: 'GitHub', at: 0 },
  { url: 'https://news.ycombinator.com', title: 'Hacker News', at: 0 },
  { url: 'https://developer.mozilla.org', title: 'MDN Web Docs', at: 0 },
]

const FAVS_KEY = 'webos-safari-favs'
const HIST_KEY = 'webos-safari-history'
const DOCK_CLEARANCE = 120 // keep the native view from covering the Dock
const CORNER_GAP = 8 // leaves the window's resize corner clickable

// Electron bridge (undefined in a normal browser)
const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : undefined
const isElectron = !!electronAPI?.isElectron

/* ------------------------------ helpers ------------------------------- */

const looksLikeUrl = (t: string) =>
  /^https?:\/\//i.test(t) || (!/\s/.test(t) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(t))

const normalize = (t: string) => (/^https?:\/\//i.test(t) ? t : `https://${t}`)
const googleUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`
const wikiSearchUrl = (q: string) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`
const external = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return u
  }
}

const faviconFor = (u: string) => `https://www.google.com/s2/favicons?domain=${hostOf(u)}&sz=64`

const titleFor = (e: Entry) =>
  e.kind === 'page' ? hostOf(e.url) : e.kind === 'results' ? e.q : 'Start Page'

const makeTab = (entry: Entry = { kind: 'start' }): Tab => ({
  id: crypto.randomUUID(),
  hist: [entry],
  idx: 0,
  title: titleFor(entry),
})

const pageUrl = (t: Tab) => {
  const e = t.hist[t.idx]
  return e.kind === 'page' ? e.url : ''
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or blocked */
  }
}

function remember(url: string, title: string): Visit[] {
  const all = load<Visit[]>(HIST_KEY, [])
  if (!/^https?:/i.test(url)) return all
  const old = all.find((v) => v.url === url)
  const list = all.filter((v) => v.url !== url)
  list.unshift({ url, title: title || old?.title || hostOf(url), at: Date.now() })
  const trimmed = list.slice(0, 200)
  save(HIST_KEY, trimmed)
  return trimmed
}

async function fetchSuggestions(q: string): Promise<string[]> {
  if (isElectron && electronAPI.suggest) return electronAPI.suggest(q)
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`,
    )
    const json = await res.json()
    return Array.isArray(json?.[1]) ? json[1] : []
  } catch {
    return [] // blocked by CORS in a plain browser; works in Electron
  }
}

/* ------------------------------ Google CSE ----------------------------- */

let cseReady: Promise<void> | null = null

function loadCse(cx: string) {
  if (cseReady) return cseReady

  cseReady = new Promise<void>((resolve) => {
    ;(window as any).__gcse = { parsetags: 'explicit', callback: () => resolve() }

    if (document.querySelector('script[data-webos-google-cse]')) {
      resolve()
      return
    }

    const s = document.createElement('script')
    s.async = true
    s.dataset.webosGoogleCse = 'true'
    s.src = `https://cse.google.com/cse.js?cx=${cx}`
    document.head.appendChild(s)
  })

  return cseReady
}

/* ----------------------------- small pieces ---------------------------- */

function Favicon({ url, src, size = 16, className = '' }: { url: string; src?: string; size?: number; className?: string }) {
  const [bad, setBad] = useState(false)
  const s = src ?? faviconFor(url)
  useEffect(() => setBad(false), [s])

  if (!url && !src) return <Globe size={size} className={`text-neutral-400 ${className}`} />
  if (bad) return <Globe size={size} className={`text-neutral-400 ${className}`} />
  return (
    <img
      src={s}
      alt=""
      width={size}
      height={size}
      draggable={false}
      onError={() => setBad(true)}
      className={`rounded-[3px] ${className}`}
    />
  )
}

/* -------------------------------- Safari ------------------------------- */

export default function Safari() {
  const wallpaper = useWallpaperStyle()

  const [tabs, setTabs] = useState<Tab[]>(() => [makeTab()])
  const [activeId, setActiveId] = useState(() => tabs[0].id)

  const [addr, setAddr] = useState('')
  const [focused, setFocused] = useState(false)
  const [typed, setTyped] = useState(false)
  const [sel, setSel] = useState(-1)
  const [sugg, setSugg] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(0)
  const [snap, setSnap] = useState<string | null>(null)
  const [nav, setNav] = useState({ canGoBack: false, canGoForward: false })

  const [sidebar, setSidebar] = useState(false)
  const [overview, setOverview] = useState(false)
  const [editFavs, setEditFavs] = useState(false)
  const [newFav, setNewFav] = useState('')
  const [favs, setFavs] = useState<Fav[]>(() => load(FAVS_KEY, DEFAULT_FAVS))
  const [history, setHistory] = useState<Visit[]>(() => load(HIST_KEY, []))
  const [toast, setToast] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const browserAreaRef = useRef<HTMLDivElement | null>(null)
  const frozen = useRef(false)
  const activeIdRef = useRef(activeId)
  const focusedRef = useRef(false)
  const urlRef = useRef('')
  const openTabRef = useRef<(e?: Entry) => void>(() => {})

  activeIdRef.current = activeId
  focusedRef.current = focused

  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const entry = tab.hist[tab.idx]

  const patchTab = useCallback(
    (id: string, fn: (t: Tab) => Partial<Tab>) =>
      setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...fn(t) } : t))),
    [],
  )

  useEffect(() => save(FAVS_KEY, favs), [favs])

  /* ----------------------------- navigation ----------------------------- */

  const go = (e: Entry) =>
    patchTab(tab.id, (t) => ({
      hist: [...t.hist.slice(0, t.idx + 1), e],
      idx: t.idx + 1,
      title: titleFor(e),
      icon: undefined,
    }))

  const openTab = (e: Entry = { kind: 'start' }) => {
    const t = makeTab(e)
    setTabs((ts) => [...ts, t])
    setActiveId(t.id)
    setOverview(false)
  }
  openTabRef.current = openTab

  const closeTab = (id: string) => {
    if (tabs.length === 1) {
      const fresh = makeTab()
      setTabs([fresh])
      setActiveId(fresh.id)
      return
    }
    const i = tabs.findIndex((t) => t.id === id)
    const rest = tabs.filter((t) => t.id !== id)
    setTabs(rest)
    if (id === activeId) setActiveId(rest[Math.max(0, i - 1)].id)
  }

  const runSearch = (q: string) =>
    isElectron ? go({ kind: 'page', url: googleUrl(q) }) : go({ kind: 'results', q })

  const submit = (text: string) => {
    const t = text.trim()
    if (!t) return
    if (looksLikeUrl(t)) go({ kind: 'page', url: normalize(t) })
    else runSearch(t)
  }

  /* --------------------------- address dropdown -------------------------- */

  const rows: Row[] = (() => {
    const q = addr.trim()
    if (!q) return []
    const lq = q.toLowerCase()
    const out: Row[] = []

    if (looksLikeUrl(q)) {
      const url = normalize(q)
      out.push({ section: 'Top Hit', title: hostOf(url), sub: url, icon: 'globe', run: () => go({ kind: 'page', url }) })
    } else {
      const hit = history.find((v) => v.title.toLowerCase().includes(lq) || v.url.toLowerCase().includes(lq))
      if (hit) {
        out.push({
          section: 'Top Hit',
          title: hit.title || hostOf(hit.url),
          sub: hit.url,
          icon: 'globe',
          run: () => go({ kind: 'page', url: hit.url }),
        })
      } else {
        out.push({ section: 'Top Hit', title: q, icon: 'search', run: () => runSearch(q) })
      }
    }

    tabs
      .filter((t) => t.id !== activeId && (t.title.toLowerCase().includes(lq) || pageUrl(t).toLowerCase().includes(lq)))
      .slice(0, 2)
      .forEach((t) =>
        out.push({ section: 'Switch to Tab', title: t.title, sub: pageUrl(t), icon: 'globe', run: () => setActiveId(t.id) }),
      )

    if (typed) sugg.forEach((s) => out.push({ section: 'Google Suggestions', title: s, icon: 'search', run: () => runSearch(s) }))

    return out
  })()

  const showDrop = focused && addr.trim().length > 0 && rows.length > 0

  const pick = (r: Row) => {
    r.run()
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((i) => (rows.length ? (i + 1) % rows.length : -1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((i) => (rows.length ? (i <= 0 ? rows.length - 1 : i - 1) : -1))
    } else if (e.key === 'Enter') {
      if (sel >= 0 && rows[sel]) pick(rows[sel])
      else {
        submit(addr)
        inputRef.current?.blur()
      }
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  // Google suggestions while typing
  useEffect(() => {
    const q = addr.trim()
    if (!focused || !typed || !q || /^https?:\/\//i.test(q)) {
      setSugg([])
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const list = await fetchSuggestions(q)
        if (!cancelled) setSugg(list.slice(0, 6))
      } catch {
        if (!cancelled) setSugg([])
      }
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [addr, focused, typed])

  useEffect(() => setSel(-1), [addr])

  /* ------------------ address bar follows the active entry ------------------ */

  useEffect(() => {
    if (entry.kind === 'page') {
      setAddr(entry.url)
      setLoading(!isElectron) // in Electron the real load events drive this
    } else if (entry.kind === 'results') {
      setAddr(entry.q)
      setLoading(false)
    } else {
      setAddr('')
      setLoading(false)
    }
  }, [entry])

  /* ---------------- is the native view allowed on screen right now? ---------------- */

  const win = useWindowStore((s) => s.windows.find((w) => w.appId === 'safari'))
  const isActive = useWindowStore((s) => !!win && s.activeId === win.id)
  const controlCenterOpen = useSystemStore((s) => s.controlCenterOpen)
  const uiOverlay = useUiStore((s) => s.galleryOpen || s.menuOpen || !!s.contextMenu)

  const geo = win ? `${win.x},${win.y},${win.width},${win.height},${win.maximized}` : ''
  const live =
    isElectron &&
    entry.kind === 'page' &&
    !!win &&
    !win.minimized &&
    isActive &&
    !controlCenterOpen &&
    !uiOverlay &&
    !showDrop &&
    !overview

  /* ---------------------- Electron: navigate the native view ---------------------- */

  useEffect(() => {
    if (!isElectron || entry.kind !== 'page') return
    electronAPI.browser.navigate(entry.url).then((r: any) => {
      if (!r?.success) console.error('Navigation failed:', r?.error)
    })
  }, [entry])

  /* ---------------------- Electron: show, hide, position ---------------------- */

  useEffect(() => {
    if (!isElectron) return
    const api = electronAPI.browser

    if (!live) {
      if (entry.kind !== 'page') {
        frozen.current = false
        setSnap(null)
        api.hide()
      } else if (!frozen.current) {
        // something is covering Safari: keep a picture of the page, then hide the real view
        frozen.current = true
        api
          .snapshot()
          .then((url: string | null) => {
            if (url && frozen.current) setSnap(url)
          })
          .finally(() => {
            if (frozen.current) api.hide()
          })
      }
      return
    }

    frozen.current = false

    const sync = () => {
      const el = browserAreaRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const bottom = Math.min(r.bottom, window.innerHeight - DOCK_CLEARANCE) - CORNER_GAP
      const height = bottom - r.top
      if (r.width <= 0 || height <= 0) return
      api.setBounds({
        x: Math.round(r.left),
        y: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(height),
      })
    }
    const schedule = () => requestAnimationFrame(sync)

    schedule()
    const settle = window.setTimeout(sync, 350) // after the minimize/restore animation
    const clearSnap = window.setTimeout(() => setSnap(null), 150)

    const ro = new ResizeObserver(schedule)
    if (browserAreaRef.current) ro.observe(browserAreaRef.current)
    window.addEventListener('resize', schedule)

    return () => {
      clearTimeout(settle)
      clearTimeout(clearSnap)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [live, entry, geo, sidebar])

  /* ---------------------- Electron: events from the view ---------------------- */

  useEffect(() => {
    if (!isElectron) return

    const offs = [
      electronAPI.onBrowserUrl((url: string) => {
        if (!url) return
        urlRef.current = url
        if (!focusedRef.current) setAddr(url)
        setHistory(remember(url, ''))
      }),
      electronAPI.onBrowserLoading((v: boolean) => setLoading(v)),
      electronAPI.onBrowserNav((s: { canGoBack: boolean; canGoForward: boolean }) => setNav(s)),
      electronAPI.onBrowserTitle?.((title: string) => {
        patchTab(activeIdRef.current, () => ({ title }))
        setHistory(remember(urlRef.current, title))
      }),
      electronAPI.onBrowserFavicon?.((icon: string) => patchTab(activeIdRef.current, () => ({ icon }))),
      electronAPI.onBrowserNewTab?.((url: string) => openTabRef.current({ kind: 'page', url })),
    ]

    return () => offs.forEach((off: (() => void) | undefined) => off?.())
  }, [patchTab])

  // closing the Safari window removes the native view
  useEffect(() => {
    return () => {
      electronAPI?.browser?.destroy?.()
    }
  }, [])

  /* ------------------------------ Google CSE ------------------------------ */

  useEffect(() => {
    if (entry.kind !== 'results' || !GOOGLE_CSE_ID) return
    let cancelled = false

    loadCse(GOOGLE_CSE_ID).then(() => {
      if (cancelled) return
      const api = (window as any).google?.search?.cse?.element
      if (!api) return

      let el = api.getElement('webos')
      if (!el) {
        api.render({
          div: 'safari-cse',
          tag: 'searchresults-only',
          gname: 'webos',
          attributes: { linkTarget: '_self' },
        })
        el = api.getElement('webos')
      }
      el?.execute(entry.q)
    })

    return () => {
      cancelled = true
    }
  }, [entry, reload])

  const onResultsClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    const href = a.getAttribute('data-ctorig') || a.getAttribute('href') || ''
    if (!/^https?:\/\//i.test(href)) return
    e.preventDefault()
    e.stopPropagation()
    go({ kind: 'page', url: href })
  }

  /* ------------------------- back / forward / reload ------------------------- */

  const handleBack = async () => {
    if (isElectron && entry.kind === 'page' && nav.canGoBack) {
      await electronAPI.browser.back()
      return
    }
    // nothing earlier inside the page: go back to the start page
    if (isElectron) patchTab(tab.id, () => ({ idx: 0 }))
    else patchTab(tab.id, (t) => ({ idx: Math.max(0, t.idx - 1) }))
  }

  const handleForward = async () => {
    if (isElectron && entry.kind === 'page' && nav.canGoForward) {
      await electronAPI.browser.forward()
      return
    }
    patchTab(tab.id, (t) => ({ idx: Math.min(t.hist.length - 1, t.idx + 1) }))
  }

  const handleReload = async () => {
    if (entry.kind === 'start') return
    if (isElectron && entry.kind === 'page') {
      await electronAPI.browser.reload()
      return
    }
    if (entry.kind === 'page') setLoading(true)
    setReload((n) => n + 1)
  }

  const canBack = (entry.kind === 'page' && nav.canGoBack) || tab.idx > 0
  const canForward = (entry.kind === 'page' && nav.canGoForward) || tab.idx < tab.hist.length - 1

  const share = async () => {
    const url = entry.kind === 'page' ? urlRef.current || entry.url : ''
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setToast('Link copied')
    } catch {
      setToast('Could not copy link')
    }
    setTimeout(() => setToast(null), 1600)
  }

  const addFav = () => {
    const t = newFav.trim()
    if (!t || !looksLikeUrl(t)) return
    const url = normalize(t)
    setFavs((f) => [...f, { name: hostOf(url).split('.')[0], url }])
    setNewFav('')
  }

  /* -------------------------------- render -------------------------------- */

  const iconBtn =
    'w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.07] dark:hover:bg-white/15 ' +
    'disabled:opacity-30 disabled:hover:bg-transparent'

  const display =
    entry.kind === 'page' ? hostOf(addr) : entry.kind === 'results' ? addr : ''

  const recent = [...history, ...SUGGESTED]
    .filter((v, i, a) => a.findIndex((x) => x.url === v.url) === i)
    .slice(0, 4)

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-[#1e1e20] text-neutral-800 dark:text-neutral-100">
      {/* ============================ toolbar ============================ */}
      <div className="relative shrink-0 h-[52px] flex items-center gap-2 pl-[84px] pr-3 bg-[#f6f6f7]/95 dark:bg-[#2a2a2d]/95 border-b border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200">
        <button
          className={`${iconBtn} ${sidebar ? 'bg-black/[0.07] dark:bg-white/15' : ''}`}
          title="Show Sidebar"
          onClick={() => setSidebar((s) => !s)}
        >
          <PanelLeft size={17} />
        </button>

        <div className="flex rounded-lg bg-black/[0.05] dark:bg-white/10">
          <button className={iconBtn} disabled={!canBack} title="Back" onClick={handleBack}>
            <ChevronLeft size={18} />
          </button>
          <button className={iconBtn} disabled={!canForward} title="Forward" onClick={handleForward}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* address capsule */}
        <div className="relative flex-1 max-w-[600px] mx-auto">
          <div
            className={`relative h-8 rounded-[10px] flex items-center gap-2 px-2.5 transition-shadow ${
              focused
                ? 'bg-white dark:bg-black/50 ring-2 ring-[#0a84ff] shadow'
                : 'bg-black/[0.06] dark:bg-white/10'
            }`}
          >
            <span className="shrink-0 w-4 h-4 flex items-center justify-center text-neutral-400">
              {entry.kind === 'page' && !focused ? (
                <Favicon url={entry.url} src={tab.icon} />
              ) : (
                <Search size={13} />
              )}
            </span>

            <input
              ref={inputRef}
              value={focused ? addr : display}
              onChange={(e) => {
                setAddr(e.target.value)
                setTyped(true)
              }}
              onKeyDown={onKeyDown}
              onFocus={() => {
                setFocused(true)
                setTyped(false)
                setSel(-1)
                requestAnimationFrame(() => inputRef.current?.select())
              }}
              onBlur={() => {
                setFocused(false)
                if (typed) setAddr(entry.kind === 'page' ? urlRef.current || entry.url : entry.kind === 'results' ? entry.q : '')
                setTyped(false)
              }}
              placeholder="Search or enter website name"
              spellCheck={false}
              className={`flex-1 min-w-0 bg-transparent outline-none text-[13px] ${focused ? '' : 'text-center'}`}
            />

            {entry.kind === 'page' && !focused && /^https:/i.test(entry.url) && (
              <Lock size={11} className="text-neutral-400 shrink-0" />
            )}

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleReload}
              disabled={entry.kind === 'start'}
              title="Reload"
              className="shrink-0 text-neutral-500 disabled:opacity-30"
            >
              <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            {loading && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded overflow-hidden bg-[#0a84ff]/20">
                <div className="h-full w-1/3 bg-[#0a84ff] animate-pulse" />
              </div>
            )}
          </div>

          {/* suggestions */}
          {showDrop && (
            <div className="absolute left-0 right-0 top-[38px] z-50 rounded-2xl bg-white/90 dark:bg-[#2c2c30]/92 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-2xl py-1.5 text-[13px]">
              {rows.map((r, i) => (
                <div key={`${r.section}-${i}`}>
                  {r.section !== 'Top Hit' && rows[i - 1]?.section !== r.section && (
                    <div className="px-4 pt-2 pb-1 text-[11px] font-semibold text-neutral-400">{r.section}</div>
                  )}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault()
                      pick(r)
                    }}
                    onMouseEnter={() => setSel(i)}
                    className={`w-[calc(100%-12px)] mx-1.5 flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left ${
                      sel === i ? 'bg-[#0a84ff] text-white' : ''
                    }`}
                  >
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {r.icon === 'search' ? <Search size={13} /> : <Favicon url={r.sub ?? ''} />}
                    </span>
                    <span className="truncate">{r.title}</span>
                    {r.sub && (
                      <span className={`truncate text-[12px] ${sel === i ? 'text-white/70' : 'text-neutral-400'}`}>
                        — {r.sub}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={iconBtn} title="Share (copy link)" onClick={share} disabled={entry.kind !== 'page'}>
          <Share size={16} />
        </button>
        <button className={iconBtn} title="New Tab" onClick={() => openTab()}>
          <Plus size={17} />
        </button>
        <button
          className={`${iconBtn} ${overview ? 'bg-black/[0.07] dark:bg-white/15' : ''}`}
          title="Show Tab Overview"
          onClick={() => setOverview((o) => !o)}
        >
          <Copy size={15} />
        </button>
      </div>

      {/* ============================ tab bar ============================ */}
      <div className="shrink-0 h-[34px] flex items-center gap-1 px-2 bg-[#e9e9eb]/95 dark:bg-[#232326]/95 border-b border-black/10 dark:border-white/10">
        {tabs.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              setActiveId(t.id)
              setOverview(false)
            }}
            className={`group flex-1 min-w-[90px] h-[26px] flex items-center gap-1.5 px-2 rounded-md text-[12px] cursor-default ${
              t.id === activeId
                ? 'bg-white dark:bg-[#3a3a3e] shadow-sm'
                : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Favicon url={pageUrl(t)} src={t.icon} size={14} />
            <span className="flex-1 truncate">{t.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(t.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-neutral-500"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* ============================ content ============================ */}
      <div className="relative flex-1 min-h-0 flex">
        {sidebar && (
          <aside className="w-[210px] shrink-0 overflow-auto p-2 bg-[#f1f1f3]/95 dark:bg-[#26262a]/95 border-r border-black/10 dark:border-white/10 text-[12px]">
            <div className="px-2 pt-1 pb-1 text-[11px] font-semibold text-neutral-400">Favourites</div>
            {favs.map((f) => (
              <button
                key={f.url}
                onClick={() => go({ kind: 'page', url: f.url })}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Favicon url={f.url} size={14} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
            <div className="px-2 pt-3 pb-1 text-[11px] font-semibold text-neutral-400">History</div>
            {history.length === 0 && <div className="px-2 text-neutral-400">No history yet</div>}
            {history.slice(0, 40).map((v) => (
              <button
                key={v.url}
                onClick={() => go({ kind: 'page', url: v.url })}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Favicon url={v.url} size={14} />
                <span className="truncate">{v.title}</span>
              </button>
            ))}
          </aside>
        )}

        <div className="relative flex-1 min-w-0">
          {/* start page */}
          {entry.kind === 'start' && (
            <div className="absolute inset-0 overflow-auto" style={wallpaper}>
              <div className="min-h-full bg-white/60 dark:bg-black/50 backdrop-blur-2xl px-10 pt-10 pb-16">
                <div className="max-w-[760px] mx-auto">
                  <div className="text-[22px] font-bold">Favourites</div>

                  <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-x-4 gap-y-5">
                    {favs.map((f) => (
                      <div key={f.url} className="relative flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => !editFavs && go({ kind: 'page', url: f.url })}
                          className="w-[68px] h-[68px] rounded-[18px] bg-white dark:bg-[#3a3a3e] shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                        >
                          <Favicon url={f.url} size={38} className="rounded-lg" />
                        </button>
                        <span className="text-[11px] truncate w-full text-center">{f.name}</span>
                        {editFavs && (
                          <button
                            onClick={() => setFavs((fs) => fs.filter((x) => x.url !== f.url))}
                            className="absolute -top-1.5 right-2 w-5 h-5 rounded-full bg-neutral-700 text-white flex items-center justify-center"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {editFavs && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        addFav()
                      }}
                      className="mt-5 flex gap-2 max-w-[420px]"
                    >
                      <input
                        value={newFav}
                        onChange={(e) => setNewFav(e.target.value)}
                        placeholder="Add a website, e.g. reddit.com"
                        className="flex-1 h-8 rounded-lg bg-white/80 dark:bg-white/10 px-3 text-[13px] outline-none"
                      />
                      <button className="px-3 h-8 rounded-lg bg-[#0a84ff] text-white text-[13px] font-medium">Add</button>
                    </form>
                  )}

                  <div className="mt-10 text-[22px] font-bold">Suggestions</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {recent.map((v) => (
                      <button
                        key={v.url}
                        onClick={() => go({ kind: 'page', url: v.url })}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/10 shadow-sm text-left hover:bg-white dark:hover:bg-white/15"
                      >
                        <Favicon url={v.url} size={32} className="rounded-lg shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate">{v.title || hostOf(v.url)}</div>
                          <div className="text-[11px] text-neutral-500 truncate">{hostOf(v.url)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setEditFavs((e) => !e)}
                  className="fixed-corner absolute bottom-3 right-3 px-4 py-1 rounded-full bg-black/10 dark:bg-white/15 backdrop-blur text-[12px] font-medium"
                >
                  {editFavs ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>
          )}

          {/* page */}
          {entry.kind === 'page' &&
            (isElectron ? (
              // The real page is a native view placed over this box by main.cjs.
              // While something covers Safari, a snapshot picture is shown here instead.
              <div ref={browserAreaRef} id="electron-browser-area" className="absolute inset-0 bg-white">
                {snap && !live && (
                  <img
                    src={snap}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-cover object-top select-none"
                  />
                )}
              </div>
            ) : (
              <iframe
                key={`${entry.url}-${reload}`}
                src={entry.url}
                title="page"
                referrerPolicy="no-referrer"
                onLoad={() => setLoading(false)}
                className="absolute inset-0 w-full h-full border-0 bg-white"
              />
            ))}

          {/* results fallback (browser mode without a search engine ID) */}
          {entry.kind === 'results' && !GOOGLE_CSE_ID && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1e1e20] p-8">
              <div className="max-w-[460px] text-center">
                <div className="text-[18px] font-semibold">Search “{entry.q}”</div>
                <p className="mt-2 text-[13px] text-neutral-500">
                  To show Google results inside this window, add <code>VITE_GOOGLE_CSE_ID</code> to{' '}
                  <code>.env.local</code> and restart <code>npm run dev</code>.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => go({ kind: 'page', url: wikiSearchUrl(entry.q) })}
                    className="px-5 py-2 rounded-full bg-[#0a84ff] text-white text-[13px] font-medium"
                  >
                    Search Wikipedia here
                  </button>
                  <button
                    onClick={() => external(googleUrl(entry.q))}
                    className="px-5 py-2 rounded-full bg-[#4285f4] text-white text-[13px] font-medium"
                  >
                    Search on Google
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google CSE container */}
          <div
            id="safari-cse"
            onClickCapture={onResultsClick}
            className={`absolute inset-0 overflow-auto p-4 bg-white ${
              entry.kind === 'results' && GOOGLE_CSE_ID ? '' : 'hidden'
            }`}
          />

          {/* tab overview */}
          {overview && (
            <div className="absolute inset-0 z-30 overflow-auto bg-neutral-200/95 dark:bg-neutral-900/95 backdrop-blur-xl p-6">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
                {tabs.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveId(t.id)
                      setOverview(false)
                    }}
                    className={`group relative h-[150px] rounded-xl bg-white dark:bg-[#2c2c30] shadow-lg p-3 cursor-default ring-2 ${
                      t.id === activeId ? 'ring-[#0a84ff]' : 'ring-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-6">
                      <Favicon url={pageUrl(t)} src={t.icon} size={16} />
                      <span className="truncate text-[12px] font-medium">{t.title}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-neutral-400 truncate">{pageUrl(t) || 'Start Page'}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(t.id)
                      }}
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => openTab()}
                  className="h-[150px] rounded-xl border-2 border-dashed border-neutral-400/60 flex items-center justify-center text-neutral-500"
                >
                  <Plus size={28} />
                </button>
              </div>
            </div>
          )}

          {toast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-neutral-800/90 text-white text-[12px] flex items-center gap-1.5">
              <Check size={13} /> {toast}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}