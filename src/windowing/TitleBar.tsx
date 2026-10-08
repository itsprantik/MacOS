import { useWindowStore } from '../core/store/windowStore'
import type { WindowState } from '../core/types'

function Light({
  color,
  glyph,
  label,
  active,
  onClick,
}: {
  color: string
  glyph: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-3 h-3 rounded-full flex items-center justify-center text-[9px] leading-none font-bold text-black/60"
      style={{ background: active ? color : '#6b6b70' }}
    >
      <span className="opacity-0 group-hover:opacity-100">{glyph}</span>
    </button>
  )
}

export default function TitleBar({
  win,
  active,
  onDragStart,
}: {
  win: WindowState
  active: boolean
  onDragStart: (e: React.PointerEvent) => void
}) {
  const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore.getState()

  return (
    <div
      onPointerDown={onDragStart}
      onDoubleClick={() => toggleMaximize(win.id)}
      className="absolute top-0 inset-x-0 h-10 z-20"
    >
      <div
        className="group inline-flex gap-2 p-3.5"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <Light color="#ff5f57" glyph="×" label="Close" active={active} onClick={() => closeWindow(win.id)} />
        <Light color="#febc2e" glyph="–" label="Minimize" active={active} onClick={() => minimizeWindow(win.id)} />
        <Light color="#28c840" glyph="+" label="Zoom" active={active} onClick={() => toggleMaximize(win.id)} />
      </div>
    </div>
  )
}