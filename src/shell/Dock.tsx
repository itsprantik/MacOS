import { Fragment, useRef, useState } from 'react'
import { apps, iconPath } from '../core/appRegistry'
import { useWindowStore } from '../core/store/windowStore'

const BASE = 54
const GAP = 8
const MAX_SCALE = 1.7
const RANGE = 140
interface Entry {
  key: string
  title: string
  icon: string
  appId?: string
}

const entries: Entry[] = [
  ...apps.filter((a) => a.inDock).map((a) => ({ key: a.id, title: a.title, icon: a.icon, appId: a.id })),
  { key: 'trash', title: 'Trash', icon: iconPath('trash-empty') },
]

function DockIcon({ entry }: { entry: Entry }) {
  const [failed, setFailed] = useState(false)
    if (failed) {
    const term = entry.key === 'terminal'
    return (
      <div
        className={`w-full h-full rounded-[22%] flex items-center justify-center font-semibold shadow-inner
          ${term
            ? 'bg-gradient-to-b from-neutral-700 to-black text-white text-[17px] font-mono border border-white/20'
            : 'bg-gradient-to-b from-neutral-400 to-neutral-600 text-white text-xl'}`}
      >
        {term ? '>_' : entry.title[0]}
      </div>
    )
  }
  return (
    <img
      src={entry.icon}
      alt={entry.title}
      draggable={false}
      onError={() => setFailed(true)}
      className="w-full h-full object-contain"
    />
  )
}

export default function Dock() {
  const openApp = useWindowStore((s) => s.openApp)
  const runningKey = useWindowStore((s) => s.windows.map((w) => w.appId).join(','))
  const running = runningKey.split(',')

  const slots = useRef<(HTMLDivElement | null)[]>([])
  const [scales, setScales] = useState<number[]>(() => entries.map(() => 1))
  const [hover, setHover] = useState<number | null>(null)
  const [bounce, setBounce] = useState<string | null>(null)

  const onMove = (e: React.MouseEvent) => {
    let nearest = 0
    let nearestD = Infinity
    const next = entries.map((_, i) => {
      const el = slots.current[i]
      if (!el) return 1
      const r = el.getBoundingClientRect()
      const d = Math.abs(e.clientX - (r.left + r.width / 2))
      if (d < nearestD) {
        nearestD = d
        nearest = i
      }
      return d < RANGE ? 1 + (MAX_SCALE - 1) * Math.cos((d / RANGE) * (Math.PI / 2)) ** 2 : 1
    })
    setScales(next)
    setHover(nearest)
  }

  const onLeave = () => {
    setScales(entries.map(() => 1))
    setHover(null)
  }

  const launch = (entry: Entry) => {
    if (!entry.appId) return
    if (!running.includes(entry.appId)) {
      setBounce(entry.key)
      setTimeout(() => setBounce(null), 900)
    }
    openApp(entry.appId)
  }

  // neighbours get pushed apart like the real dock
  const extras = scales.map((s) => (s - 1) * BASE)
  const total = extras.reduce((a, b) => a + b, 0)
  const offsets = extras.map(
    (ex, i) => extras.slice(0, i).reduce((a, b) => a + b, 0) + ex / 2 - total / 2,
  )

  return (
    <div className="fixed bottom-2 inset-x-0 z-[900] flex justify-center pointer-events-none">
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="pointer-events-auto flex items-end py-2 rounded-[26px] bg-white/15 backdrop-blur-2xl border border-white/25 shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-[padding] duration-100"
        style={{ gap: GAP, paddingInline: 10 + total / 2 }}
      >
        {entries.map((entry, i) => (
          <Fragment key={entry.key}>
            {i === entries.length - 1 && <div className="w-px h-[44px] bg-white/30 self-center mx-1" />}

            <div
              ref={(el) => {
                slots.current[i] = el
              }}
              className="relative"
              style={{ width: BASE, height: BASE }}
            >
              {hover === i && scales[i] > 1.2 && (
                <div
                  className="absolute left-1/2 whitespace-nowrap px-3 py-1 rounded-md text-[12px] text-white bg-neutral-800/80 backdrop-blur-xl border border-white/15 pointer-events-none"
                  style={{
                    bottom: BASE * scales[i] + 10,
                    transform: `translateX(calc(-50% + ${offsets[i]}px))`,
                  }}
                >
                  {entry.title}
                </div>
              )}

              <div
                className="absolute inset-0 origin-bottom transition-transform duration-75 ease-out"
                style={{ transform: `translateX(${offsets[i]}px) scale(${scales[i]})` }}
              >
                <button
                  onClick={() => launch(entry)}
                  className={`w-full h-full ${bounce === entry.key ? 'dock-bounce' : ''}`}
                >
                  <DockIcon entry={entry} />
                </button>
              </div>

              {entry.appId && running.includes(entry.appId) && (
                <div
                  className="absolute -bottom-[6px] left-1/2 w-1 h-1 rounded-full bg-white/85"
                  style={{ transform: `translateX(calc(-50% + ${offsets[i]}px))` }}
                />
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
