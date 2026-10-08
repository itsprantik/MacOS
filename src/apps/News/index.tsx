import { useEffect, useState } from 'react'
import {
  Newspaper, Briefcase, Cpu, FlaskConical, HeartPulse, Trophy, Clapperboard,
  Search, RotateCw, X, ExternalLink,
} from 'lucide-react'
import { topHeadlines, searchNews, clearNewsCache, NewsError, type Article } from './api'
import { NEWS_API_KEY } from '../../config/keys'

const CATEGORIES = [
  { id: 'general', label: 'Today', icon: Newspaper },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'entertainment', label: 'Entertainment', icon: Clapperboard },
]

const REGIONS: [string, string][] = [
  ['us', 'United States'], ['in', 'India'], ['gb', 'United Kingdom'], ['au', 'Australia'],
  ['ca', 'Canada'], ['de', 'Germany'], ['fr', 'France'], ['jp', 'Japan'],
]

const RED = '#fa233b'

const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`
}

const friendly = (e: NewsError) => {
  switch (e.code) {
    case 'corsNotAllowed':
      return "NewsAPI's free plan only allows browser requests from localhost. Run the app with npm run dev, or use a small proxy for deployment."
    case 'apiKeyInvalid':
    case 'apiKeyMissing':
    case 'apiKeyDisabled':
      return 'Your API key was rejected. Check VITE_NEWS_API_KEY in .env.local, then restart the dev server.'
    case 'rateLimited':
    case 'maximumResultsReached':
      return "You've used today's free requests (100 per day). Try again tomorrow."
    default:
      return e.message
  }
}

function Thumb({ src, className = '' }: { src: string | null; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-neutral-500 ${className}`}>
        <Newspaper size={28} />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

export default function News() {
  const [category, setCategory] = useState('general')
  const [region, setRegion] = useState(() => localStorage.getItem('webos-news-region') ?? 'us')
  const [search, setSearch] = useState<string | null>(null)
  const [box, setBox] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<NewsError | null>(null)
  const [open, setOpen] = useState<Article | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!NEWS_API_KEY) return
    let cancelled = false
    setLoading(true)
    setError(null)

    const job = search ? searchNews(search) : topHeadlines(region, category)
    job
      .then((a) => !cancelled && setArticles(a))
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof NewsError ? e : new NewsError('error', String(e)))
        setArticles([])
      })
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [category, region, search, tick])

  const title = search ? `Results for “${search}”` : CATEGORIES.find((c) => c.id === category)!.label
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const [lead, ...rest] = articles

  const muted = 'text-neutral-500 dark:text-neutral-400'
  const hover = 'hover:bg-black/5 dark:hover:bg-white/10'

  return (
    <div className="relative w-full h-full flex bg-white/90 dark:bg-[#1c1c1e]/92 backdrop-blur-2xl text-neutral-900 dark:text-neutral-100 text-[13px]">
      {/* sidebar */}
      <aside className="w-[190px] shrink-0 bg-[#ececf0]/70 dark:bg-white/[0.04] border-r border-black/5 dark:border-white/10 pt-12 px-2.5 flex flex-col gap-0.5">
        <div className="px-2 mb-1 text-[11px] font-semibold text-neutral-400">News</div>
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setCategory(id)
              setSearch(null)
              setBox('')
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left ${
              !search && category === id ? 'bg-black/10 dark:bg-white/15 font-medium' : hover
            }`}
          >
            <Icon size={16} color={RED} />
            {label}
          </button>
        ))}
      </aside>

      {/* main */}
      <section className="flex-1 min-w-0 flex flex-col">
        <div className="h-[52px] shrink-0 flex items-center gap-2 px-5 border-b border-black/5 dark:border-white/10">
          <div className="flex-1" />
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value)
              localStorage.setItem('webos-news-region', e.target.value)
            }}
            className="h-7 rounded-md bg-black/[0.06] dark:bg-white/10 px-2 text-[12px] outline-none"
          >
            {REGIONS.map(([code, name]) => (
              <option key={code} value={code} className="text-black">{name}</option>
            ))}
          </select>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (box.trim()) setSearch(box.trim())
            }}
            className="relative"
          >
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={box}
              onChange={(e) => setBox(e.target.value)}
              placeholder="Search news"
              className="w-[160px] h-7 rounded-md bg-black/[0.06] dark:bg-white/10 pl-6 pr-2 text-[12px] outline-none"
            />
          </form>
          <button
            title="Refresh"
            onClick={() => {
              clearNewsCache()
              setTick((n) => n + 1)
            }}
            className={`w-7 h-7 rounded-md flex items-center justify-center ${hover}`}
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[28px] font-bold" style={{ color: search ? undefined : RED }}>{title}</h1>
            <span className={`text-[14px] ${muted}`}>{search ? '' : today}</span>
          </div>

          {!NEWS_API_KEY ? (
            <div className="mt-6 max-w-[460px] rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] p-5">
              <div className="text-[15px] font-semibold">Connect a news source</div>
              <ol className={`mt-2 list-decimal pl-5 space-y-1 ${muted}`}>
                <li>Get a free key at newsapi.org</li>
                <li>Create <code>.env.local</code> in your project folder</li>
                <li>Add <code>VITE_NEWS_API_KEY=your_key</code></li>
                <li>Restart <code>npm run dev</code></li>
              </ol>
            </div>
          ) : error ? (
            <div className="mt-6 max-w-[520px] rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 p-5">
              {friendly(error)}
            </div>
          ) : loading && !articles.length ? (
            <div className="mt-5 grid grid-cols-3 gap-5 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[170px] rounded-xl bg-black/[0.06] dark:bg-white/10" />
              ))}
            </div>
          ) : !articles.length ? (
            <div className={`mt-10 text-center ${muted}`}>No stories found.</div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-x-5 gap-y-6">
              {lead && (
                <button
                  onClick={() => setOpen(lead)}
                  className="col-span-3 grid grid-cols-[1.4fr_1fr] gap-5 text-left"
                >
                  <Thumb src={lead.urlToImage} className="w-full aspect-[16/9] rounded-xl" />
                  <div className="flex flex-col justify-center">
                    <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: RED }}>
                      {lead.source.name}
                    </div>
                    <div className="mt-1 text-[22px] font-bold leading-tight line-clamp-4">{lead.title}</div>
                    <div className={`mt-2 line-clamp-3 ${muted}`}>{lead.description}</div>
                    <div className={`mt-2 text-[12px] ${muted}`}>{timeAgo(lead.publishedAt)}</div>
                  </div>
                </button>
              )}

              {rest.map((a) => (
                <button key={a.url} onClick={() => setOpen(a)} className="text-left">
                  <Thumb src={a.urlToImage} className="w-full aspect-[16/10] rounded-lg" />
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wide truncate" style={{ color: RED }}>
                    {a.source.name}
                  </div>
                  <div className="mt-0.5 text-[14px] font-semibold leading-snug line-clamp-3">{a.title}</div>
                  <div className={`mt-1 text-[11px] ${muted}`}>{timeAgo(a.publishedAt)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* reader */}
      {open && (
        <div
          className="absolute inset-0 z-30 bg-black/40 flex justify-center p-6"
          onMouseDown={() => setOpen(null)}
        >
          <div
            className="w-full max-w-[640px] max-h-full overflow-auto rounded-2xl bg-white dark:bg-[#2a2a2d] shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Thumb src={open.urlToImage} className="w-full aspect-[16/9]" />
              <button
                onClick={() => setOpen(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-6">
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: RED }}>
                {open.source.name}
              </div>
              <h2 className="mt-1 text-[24px] font-bold leading-tight">{open.title}</h2>
              <div className={`mt-2 text-[12px] ${muted}`}>
                {open.author ? `${open.author} · ` : ''}
                {new Date(open.publishedAt).toLocaleString()}
              </div>
              {open.description && <p className="mt-4 text-[15px] leading-relaxed">{open.description}</p>}
              {open.content && (
                <p className={`mt-3 leading-relaxed ${muted}`}>
                  {open.content.replace(/\s*\[\+\d+ chars\]$/, '')}…
                </p>
              )}
              <a
                href={open.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] font-medium"
                style={{ background: RED }}
              >
                Read the full story at {open.source.name} <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}