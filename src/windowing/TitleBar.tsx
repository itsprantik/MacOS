import { useWindowStore } from '../core/store/windowStore'
import type { WindowState } from '../core/types'

function Light({
  color, glyph, label, active, onClick,
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

export default function TitleBar({ win, active }: { win: WindowState; active: boolean }) {
  const { closeWindow, minimizeWindow, toggleMaximize } = useWindowStore.getState()

  return (
    <div className="absolute top-0 left-0 z-40 pointer-events-none">
      <div className="group pointer-events-auto inline-flex gap-2 p-3.5">
        <Light color="#ff5f57" glyph="×" label="Close" active={active} onClick={() => closeWindow(win.id)} />
        <Light color="#febc2e" glyph="–" label="Minimize" active={active} onClick={() => minimizeWindow(win.id)} />
        <Light color="#28c840" glyph="+" label="Zoom" active={active} onClick={() => toggleMaximize(win.id)} />
      </div>
    </div>
  )
}