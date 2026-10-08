import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useUiStore } from '../core/store/uiStore'
import { useWidgetStore, type WidgetType } from '../core/store/widgetStore'
import { widgetTypes } from '../widgets'

export default function WidgetGallery() {
  const galleryOpen = useUiStore((s) => s.galleryOpen)
  const setGallery = useUiStore((s) => s.setGallery)
  const addWidget = useWidgetStore((s) => s.addWidget)

  useEffect(() => {
    if (!galleryOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGallery(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [galleryOpen, setGallery])

  if (!galleryOpen) return null

  return (
    <div className="fixed inset-0 z-[1500] pointer-events-none flex items-center pl-[4vw]">
      <div className="pointer-events-auto w-[640px] max-w-[60vw] max-h-[78vh] flex flex-col rounded-3xl bg-neutral-900/75 backdrop-blur-3xl border border-white/15 shadow-2xl text-white">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Edit Widgets</div>
          <button
            onClick={() => setGallery(false)}
            className="px-4 py-1 rounded-full bg-[#0a84ff] text-sm font-medium"
          >
            Done
          </button>
        </div>

        <div className="px-6 pb-4 overflow-auto flex flex-wrap gap-7">
          {(Object.keys(widgetTypes) as WidgetType[]).map((type) => {
            const def = widgetTypes[type]
            const Cmp = def.Component
            return (
              <div key={type} className="flex flex-col items-center gap-2">
                <button onClick={() => addWidget(type)} className="relative">
                  <Cmp />
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#30d158] flex items-center justify-center shadow-lg">
                    <Plus size={14} strokeWidth={3} />
                  </span>
                </button>
                <div className="text-[12px] text-white/80">{def.label}</div>
              </div>
            )
          })}
        </div>

        <div className="px-6 pb-4 text-[12px] text-white/50">
          Click a widget to add it. Drag widgets on the desktop to move them, or click the − badge to remove one.
        </div>
      </div>
    </div>
  )
}