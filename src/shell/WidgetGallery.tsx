import { useEffect, useState, type ComponentType } from 'react'
import {
  Plus, Search, LayoutGrid, CalendarDays, Clock as ClockIcon, Cloud, Battery as BatteryIcon,
  Music, Newspaper, Flag, Code, Sparkles,
} from 'lucide-react'
import { useUiStore } from '../core/store/uiStore'
import { useWidgetStore, WIDGET_SIZE, type WidgetType } from '../core/store/widgetStore'
import { widgetTypes } from '../widgets'

const CAT_ICON: Record<string, ComponentType<{ size?: number }>> = {
  'All Widgets': LayoutGrid,
  Calendar: CalendarDays,
  Clock: ClockIcon,
  Weather: Cloud,
  Battery: BatteryIcon,
  Music,
  News: Newspaper,
  Sports: Flag,
  Developer: Code,
  Productivity: Sparkles,
}

const sizeLabel = (t: WidgetType) => {
  const { w, h } = WIDGET_SIZE[t]
  return h === 2 ? 'Large' : w === 2 ? 'Medium' : 'Small'
}

export default function WidgetGallery() {
  const galleryOpen = useUiStore((s) => s.galleryOpen)
  const setGallery = useUiStore((s) => s.setGallery)
  const addWidget = useWidgetStore((s) => s.addWidget)
  const [cat, setCat] = useState('All Widgets')
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!galleryOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGallery(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [galleryOpen, setGallery])

  if (!galleryOpen) return null

  const types = Object.keys(widgetTypes) as WidgetType[]
  const cats = ['All Widgets', ...Array.from(new Set(types.map((t) => widgetTypes[t].category)))]
  const query = q.trim().toLowerCase()

  const visible = types.filter((t) => {
    const d = widgetTypes[t]
    const inCat = cat === 'All Widgets' || d.category === cat
    const match = !query || d.label.toLowerCase().includes(query) || d.category.toLowerCase().includes(query)
    return inCat && match
  })
  const shownCats = Array.from(new Set(visible.map((t) => widgetTypes[t].category)))

  return (
    // the overlay itself lets clicks through, so you can still drag and remove widgets while it is open
    <div className="fixed inset-0 z-[1500] pointer-events-none flex items-center pl-[3vw]">
      <div className="pointer-events-auto relative w-[800px] max-w-[62vw] h-[580px] max-h-[84vh] rounded-[28px] bg-[#1c1c20]/85 backdrop-blur-3xl border border-white/15 shadow-2xl flex overflow-hidden text-white">
        {/* sidebar */}
        <aside className="w-[200px] shrink-0 bg-white/[0.06] p-3 pt-4 flex flex-col gap-0.5 overflow-y-auto">
          <div className="relative mb-3">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Widgets"
              className="w-full h-8 rounded-lg bg-white/10 pl-8 pr-2 text-[13px] outline-none placeholder-white/40"
            />
          </div>
          {cats.map((c) => {
            const Icon = CAT_ICON[c] ?? LayoutGrid
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] text-left ${
                  cat === c ? 'bg-white/15' : 'hover:bg-white/10'
                }`}
              >
                <Icon size={15} />
                {c}
              </button>
            )
          })}
        </aside>

        {/* main */}
        <main className="flex-1 min-w-0 overflow-y-auto p-5 pb-[70px]">
          {cat === 'All Widgets' && !query && (
            <div className="rounded-2xl bg-gradient-to-br from-[#4b3fd1]/60 to-[#c2409a]/50 border border-white/15 p-4 mb-6">
              <div className="text-[17px] font-semibold">What's New</div>
              <p className="mt-1 text-[13px] text-white/75 leading-relaxed">
                Widgets can now sync with Formula 1, GitHub releases and your calendar. Click a widget to add it,
                drag it anywhere on the desktop, and right-click to remove it.
              </p>
            </div>
          )}

          {visible.length === 0 && <div className="text-white/50 text-[13px]">No widgets found.</div>}

          {shownCats.map((c) => (
            <section key={c} className="mb-7">
              <h3 className="text-[13px] font-semibold text-white/60 mb-3">{c}</h3>
              <div className="flex flex-wrap gap-6">
                {visible
                  .filter((t) => widgetTypes[t].category === c)
                  .map((t) => {
                    const def = widgetTypes[t]
                    const Cmp = def.Component
                    return (
                      <div key={t} className="flex flex-col items-center gap-1.5">
                        <button onClick={() => addWidget(t)} className="relative">
                          <Cmp />
                          <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#30d158] flex items-center justify-center shadow-lg">
                            <Plus size={14} strokeWidth={3} />
                          </span>
                        </button>
                        <div className="text-[12px] font-medium">{def.label}</div>
                        <div className="text-[11px] text-white/45">{sizeLabel(t)}</div>
                      </div>
                    )
                  })}
              </div>
            </section>
          ))}
        </main>

        {/* footer */}
        <div className="absolute bottom-0 inset-x-0 h-[52px] bg-black/35 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-5">
          <span className="text-[12px] text-white/55">
            Drag a widget on the desktop to move it, or click its − badge to remove it.
          </span>
          <button
            onClick={() => setGallery(false)}
            className="px-4 py-1 rounded-full bg-[#7c5cff] text-[13px] font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}