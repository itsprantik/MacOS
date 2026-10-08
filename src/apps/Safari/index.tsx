import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, ExternalLink, Search, X } from 'lucide-react'
import { GOOGLE_CSE_ID } from '../../config/keys'

type Entry = { kind: 'start' } | { kind: 'results'; q: string } | { kind: 'page'; url: string }

const FAVORITES = [
  { name: 'Google', url: 'https://www.google.com', color: '#4285f4', embed: false },
  { name: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000', embed: false },
  { name: 'Gmail', url: 'https://mail.google.com', color: '#ea4335', embed: false },
  { name: 'GitHub', url: 'https://github.com', color: '#24292f', embed: false },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page', color: '#636466', embed: true },
  { name: 'Google News', url: 'https://news.google.com', color: '#1a73e8', embed: false },
]

const looksLikeUrl = (t: string) =>
  /^https?:\/\//i.test(t) || (!/\s/.test(t) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(t))
const normalize = (t: string) => (/^https?:\/\//i.test(t) ? t : `https://${t}`)
const external = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
const googleUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`

// loads Google's Programmable Search script once
let cseReady: Promise<void> | null = null
function loadCse(cx: string) {
  if (cseReady) return cseReady
  cseReady = new Promise<void>((resolve) => {
    ;(window as any).__gcse = { parsetags: 'explicit', callback: () => resolve() }
    const s = document.createElement('script')
    s.async = true
    s.src = `https://cse.google.com/cse.js?cx=${cx}`
    document.head.appendChild(s)
  })
  return cseReady
}

const Wordmark = () => (
  <div className="text-[64px] font-medium tracking-tight select-none">
    {[['G', '#4285f4'], ['o', '#ea4335'], ['o', '#fbbc05'], ['g', '#4285f4'], ['l', '#34a853'], ['e', '#ea4335']].map(
      ([ch, c], i) => (
        <span key={i} style={{ color: c }}>{ch}</span>
      ),
    )}
  </div>
)

export default function Safari() {
  const [hist, setHist] = useState<Entry[]>([{ kind: 'start' }])
  const [idx, setIdx] = useState(0)
  const [addr, setAddr] = useState('')
  const [startQ, setStartQ] = useState('')
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState(true)

  const entry = hist[idx]

  const go = (e: Entry) => {
    setHist((h) => [...h.slice(0, idx + 1), e])
    setIdx((i) => i + 1)
  }

  const submit = (text: string) => {
    const t = text.trim()
    if (!t) return
    go(looksLikeUrl(t) ? { kind: 'page', url: normalize(t) } : { kind: 'results', q: t })
  }

  // keep the address bar and loading bar in sync with the current entry
  useEffect(() => {
    setAddr(entry.kind === 'page' ? entry.url : entry.kind === 'results' ? entry.q : '')
    setLoading(entry.kind === 'page')
  }, [entry])

  // run the Google search inside the app
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
          attributes: { linkTarget: '_blank' },
        })
        el = api.getElement('webos')
      }
      el?.execute(entry.q)
    })
    return () => {
      cancelled = true
    }
  }, [entry, reload])

  const externalTarget =
    entry.kind === 'page' ? entry.url : entry.kind === 'results' ? googleUrl(entry.q) : 'https://www.google.com'

  const navBtn =
    'w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e20]">
      {/* toolbar */}
      <div className="relative shrink-0 h-[52px] flex items-center gap-1.5 pl-[84px] pr-3 bg-[#f4f4f5] dark:bg-[#2a2a2d] border-b border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-200">
        <button className={navBtn} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          <ChevronLeft size={18} />
        </button>
        <button
          className={navBtn}
          disabled={idx >= hist.length - 1}
          onClick={() => setIdx((i) => Math.min(hist.length - 1, i + 1))}
        >
          <ChevronRight size={18} />
        </button>

        <div className="relative flex-1 max-w-[640px] mx-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(addr)}
            onFocus={(e) => e.currentTarget.select()}
            placeholder="Search Google or enter website name"
            spellCheck={false}
            className="w-full h-8 rounded-lg bg-black/[0.06] dark:bg-white/10 pl-8 pr-3 text-[13px] outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-[#0a84ff]/60"
          />
        </div>

        <button
          className={navBtn}
          title="Reload"
          disabled={entry.kind === 'start'}
          onClick={() => {
            setReload((n) => n + 1)
            if (entry.kind === 'page') setLoading(true)
          }}
        >
          <RotateCw size={15} />
        </button>
        <button className={navBtn} title="Open in a new browser tab" onClick={() => external(externalTarget)}>
          <ExternalLink size={15} />
        </button>

        {loading && <div className="absolute bottom-0 left-0 h-[2px] w-1/3 bg-[#0a84ff] animate-pulse" />}
      </div>

      {/* embedding notice */}
      {note && entry.kind === 'page' && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 text-[12px] bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100">
          <span className="flex-1">
            Many sites (including Google itself) refuse to be shown inside another page. If this one is blank, open it in a new tab.
          </span>
          <button className="underline" onClick={() => external(entry.url)}>Open in new tab</button>
          <button onClick={() => setNote(false)}><X size={14} /></button>
        </div>
      )}

      {/* content */}
      <div className="relative flex-1 min-h-0">
        {entry.kind === 'start' && (
          <div className="absolute inset-0 overflow-auto flex flex-col items-center pt-[8vh] px-6 bg-white dark:bg-[#1e1e20] text-neutral-800 dark:text-neutral-200">
            <Wordmark />
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(startQ)
              }}
              className="mt-6 w-full max-w-[560px] relative"
            >
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                value={startQ}
                onChange={(e) => setStartQ(e.target.value)}
                placeholder="Search Google or type a URL"
                className="w-full h-11 rounded-full border border-neutral-300 dark:border-white/20 bg-white dark:bg-white/5 pl-11 pr-4 text-[15px] outline-none shadow-sm hover:shadow-md focus:shadow-md"
              />
            </form>

            <div className="mt-12 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Favorites</div>
            <div className="mt-4 grid grid-cols-6 gap-5">
              {FAVORITES.map((f) => (
                <button
                  key={f.name}
                  onClick={() => (f.embed ? go({ kind: 'page', url: f.url }) : external(f.url))}
                  className="flex flex-col items-center gap-1.5 w-[84px]"
                >
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[22px] font-semibold shadow"
                    style={{ background: f.color }}
                  >
                    {f.name[0]}
                  </span>
                  <span className="text-[12px] truncate w-full text-center">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {entry.kind === 'page' && (
          <iframe
            key={`${entry.url}-${reload}`}
            src={entry.url}
            title="page"
            referrerPolicy="no-referrer"
            onLoad={() => setLoading(false)}
            className="absolute inset-0 w-full h-full border-0 bg-white"
          />
        )}

        {entry.kind === 'results' && !GOOGLE_CSE_ID && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-[#1e1e20] p-8">
            <div className="max-w-[460px] text-center text-neutral-700 dark:text-neutral-200">
              <div className="text-[18px] font-semibold">Search “{entry.q}”</div>
              <p className="mt-2 text-[13px] text-neutral-500">
                To show Google results inside this window, add <code>VITE_GOOGLE_CSE_ID</code> to <code>.env.local</code>.
                Until then, open the search on Google:
              </p>
              <button
                onClick={() => external(googleUrl(entry.q))}
                className="mt-4 px-5 py-2 rounded-full bg-[#4285f4] text-white text-[13px] font-medium"
              >
                Search on Google
              </button>
            </div>
          </div>
        )}

        {/* always mounted so Google's widget keeps a stable container */}
        <div
          id="safari-cse"
          className={`absolute inset-0 overflow-auto p-4 bg-white ${
            entry.kind === 'results' && GOOGLE_CSE_ID ? '' : 'hidden'
          }`}
        />
      </div>
    </div>
  )
}