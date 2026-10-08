import { useMemo, useState, type CSSProperties } from 'react'
import {
  Search, House, ListMusic, Shuffle, Repeat, Repeat1, SkipBack, SkipForward,
  Play, Pause, Volume2, Music2,
} from 'lucide-react'
import { tracks, type Track } from './tracks'
import { useMusicStore } from '../../core/store/musicStore'
import { useSystemStore } from '../../core/store/systemStore'

const RED = '#fa233b'

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function Cover({ src, className = '' }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={`bg-gradient-to-br from-[#fa233b] to-[#ff8a9a] flex items-center justify-center text-white ${className}`}>
        <Music2 size={18} />
      </div>
    )
  }
  return (
    <img src={src} alt="" draggable={false} onError={() => setFailed(true)} className={`object-cover ${className}`} />
  )
}

function NavItem({
  icon: Icon, label, active, onClick,
}: {
  icon: typeof House
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] text-left ${active ? 'bg-black/10 font-medium' : 'hover:bg-black/5'}`}
    >
      <Icon size={16} color={RED} />
      {label}
    </button>
  )
}

function AlbumCard({ track, index }: { track: Track; index: number }) {
  const playIndex = useMusicStore((s) => s.playIndex)
  return (
    <button onClick={() => playIndex(index)} className="w-[150px] shrink-0 text-left group">
      <div className="relative w-[150px] h-[150px] rounded-lg overflow-hidden shadow-md">
        <Cover src={track.cover} className="w-full h-full" />
        <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play size={30} fill="white" className="text-white" />
        </span>
      </div>
      <div className="mt-2 text-[13px] font-medium truncate">{track.title}</div>
      <div className="text-[12px] text-neutral-500 truncate">{track.artist}</div>
    </button>
  )
}

function Row({ title, subtitle, items }: { title: string; subtitle: string; items: { t: Track; i: number }[] }) {
  return (
    <section className="mt-6">
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <p className="text-[12px] text-neutral-500">{subtitle}</p>
      <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
        {items.map(({ t, i }) => (
          <AlbumCard key={t.id} track={t} index={i} />
        ))}
      </div>
    </section>
  )
}

function SongList({ items }: { items: { t: Track; i: number }[] }) {
  const currentIndex = useMusicStore((s) => s.currentIndex)
  const isPlaying = useMusicStore((s) => s.isPlaying)
  const playIndex = useMusicStore((s) => s.playIndex)

  if (!items.length) return <p className="mt-6 text-sm text-neutral-500">No songs found.</p>

  return (
    <div className="mt-4 flex flex-col">
      {items.map(({ t, i }, row) => {
        const current = currentIndex === i
        return (
          <button
            key={t.id}
            onClick={() => playIndex(i)}
            className={`flex items-center gap-3 px-2 py-1.5 rounded-lg text-left hover:bg-black/[0.07] ${row % 2 === 0 ? 'bg-black/[0.035]' : ''}`}
          >
            <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
              <Cover src={t.cover} className="w-full h-full" />
              {current && isPlaying && (
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Volume2 size={16} className="text-white" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate" style={{ color: current ? RED : undefined }}>
                {t.title}
              </div>
              <div className="text-[12px] text-neutral-500 truncate">{t.artist}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PlayerBar() {
  const {
    currentIndex, isPlaying, progress, duration, shuffle, repeat,
    toggle, next, prev, seek, toggleShuffle, cycleRepeat,
  } = useMusicStore()
  const { volume, setVolume } = useSystemStore()
  const track = currentIndex !== null ? tracks[currentIndex] : null
  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <div className="absolute bottom-3 left-[212px] right-3 h-[54px] rounded-full bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.18)] flex items-center gap-3 px-4 text-neutral-800">
      <div className="flex items-center gap-3.5">
        <button onClick={toggleShuffle} style={{ color: shuffle ? RED : '#737373' }}><Shuffle size={15} /></button>
        <button onClick={prev}><SkipBack size={18} fill="currentColor" /></button>
        <button onClick={toggle}>
          {isPlaying ? <Pause size={23} fill="currentColor" /> : <Play size={23} fill="currentColor" />}
        </button>
        <button onClick={next}><SkipForward size={18} fill="currentColor" /></button>
        <button onClick={cycleRepeat} style={{ color: repeat !== 'off' ? RED : '#737373' }}>
          {repeat === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
        </button>
      </div>

      <div className="flex-1 min-w-0 h-[40px] rounded-lg bg-black/[0.04] flex items-center gap-3 px-2">
        {track && <Cover src={track.cover} className="w-8 h-8 rounded shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold truncate text-center">
            {track ? `${track.title} — ${track.artist}` : 'Not Playing'}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 tabular-nums">
            <span>{fmt(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={progress}
              onChange={(e) => seek(+e.target.value)}
              className="range-thin flex-1"
              style={{ '--v': `${pct}%` } as CSSProperties}
            />
            <span>-{fmt(duration - progress)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 size={15} className="text-neutral-500" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(+e.target.value)}
          className="range-thin w-20"
          style={{ '--v': `${volume * 100}%` } as CSSProperties}
        />
      </div>
    </div>
  )
}

export default function MusicApp() {
  const [view, setView] = useState<'home' | 'songs'>('home')
  const [query, setQuery] = useState('')

  const all = useMemo(() => tracks.map((t, i) => ({ t, i })), [])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(({ t }) => !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q))
  }, [all, query])

  return (
    <div className="relative w-full h-full flex bg-white/85 backdrop-blur-2xl text-neutral-900">
      {/* sidebar */}
      <aside className="w-[200px] shrink-0 bg-white/50 border-r border-black/5 pt-12 px-3 flex flex-col gap-0.5">
        <div className="relative mb-3">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value) setView('songs')
            }}
            placeholder="Search"
            className="w-full rounded-lg bg-black/[0.06] pl-7 pr-2 py-1 text-[13px] outline-none placeholder-neutral-400"
          />
        </div>
        <NavItem icon={House} label="Home" active={view === 'home'} onClick={() => { setView('home'); setQuery('') }} />
        <div className="mt-4 mb-1 px-2 text-[11px] font-semibold text-neutral-400">Library</div>
        <NavItem icon={ListMusic} label="Songs" active={view === 'songs'} onClick={() => setView('songs')} />
      </aside>

      {/* main */}
      <main className="flex-1 overflow-y-auto pt-12 pb-24 px-7">
        {view === 'home' ? (
          <>
            <h1 className="text-[28px] font-bold">Home</h1>
            <Row title="Top Picks for You" subtitle="Listen Again" items={all} />
            <Row title="Recently Added" subtitle="Just for you" items={[...all].reverse()} />
          </>
        ) : (
          <>
            <h1 className="text-[28px] font-bold">Songs</h1>
            <SongList items={filtered} />
          </>
        )}
      </main>

      <PlayerBar />
    </div>
  )
}