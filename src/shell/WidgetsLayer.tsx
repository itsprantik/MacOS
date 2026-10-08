import { useEffect, useState } from 'react'
import { Minus } from 'lucide-react'
import { useWidgetStore, WIDGET_SPAN, type WidgetInstance } from '../core/store/widgetStore'
import { useUiStore } from '../core/store/uiStore'
import { widgetTypes } from '../widgets'
import { CELL, GAP, STEP, MARGIN_X, MARGIN_TOP, gridSize } from '../core/widgetGrid'

export default function WidgetsLayer() {
  const widgets = useWidgetStore((s) => s.widgets)
  const editing = useUiStore((s) => s.galleryOpen)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)
  const [, bump] = useState(0)

  // re-clamp positions when the window is resized
  useEffect(() => {
    const on = () => bump((n) => n + 1)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const { cols, rows } = gridSize()

  const place = (w: WidgetInstance) => {
    const span = WIDGET_SPAN[w.type]
    const col = Math.min(w.col, Math.max(0, cols - span))
    const row = Math.min(w.row, rows - 1)
    return { col, row, x: MARGIN_X + col * STEP, y: MARGIN_TOP + row * STEP, span }
  }

  const startDrag = (e: React.PointerEvent, w: WidgetInstance) => {
    if (e.button !== 0) return
    const { x: baseX, y: baseY } = place(w)
    const startX = e.clientX
    const startY = e.clientY
    let moved = false

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (!moved && Math.hypot(dx, dy) < 4) return
      moved = true
      setDrag({ id: w.id, x: baseX + dx, y: baseY + dy })
    }

    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) {
        const x = baseX + ev.clientX - startX
        const y = baseY + ev.clientY - startY
        useWidgetStore
          .getState()
          .moveWidget(w.id, Math.round((x - MARGIN_X) / STEP), Math.round((y - MARGIN_TOP) / STEP))
      }
      setDrag(null)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none">
      {widgets.map((w) => {
        const def = widgetTypes[w.type]
        const Cmp = def.Component
        const p = place(w)
        const dragging = drag?.id === w.id

        return (
          <div
            key={w.id}
            onPointerDown={(e) => startDrag(e, w)}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const { openMenu, setGallery } = useUiStore.getState()
              openMenu(e.clientX, e.clientY, [
                { label: 'Remove Widget', onClick: () => useWidgetStore.getState().removeWidget(w.id) },
                { label: 'Edit Widgets…', onClick: () => setGallery(true) },
              ])
            }}
            className={`absolute pointer-events-auto touch-none select-none
              ${dragging ? 'z-10 scale-[1.03] cursor-grabbing drop-shadow-2xl' : 'transition-[left,top,transform] duration-200'}`}
            style={{
              left: dragging ? drag.x : p.x,
              top: dragging ? drag.y : p.y,
              width: p.span * CELL + (p.span - 1) * GAP,
            }}
          >
            <Cmp />

            {editing && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => useWidgetStore.getState().removeWidget(w.id)}
                className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-neutral-700/90 border border-white/30 flex items-center justify-center text-white shadow-lg"
                aria-label="Remove widget"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}