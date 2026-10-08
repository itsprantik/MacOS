import type { CSSProperties } from 'react'
import { useWindowStore } from '../core/store/windowStore'
import { getApp } from '../core/appRegistry'
import type { WindowState } from '../core/types'
import Placeholder from '../apps/Placeholder'
import TitleBar from './TitleBar'

const MENUBAR_H = 28
const DOCK_SPACE = 92
const MIN_W = 640
const MIN_H = 320

export default function AppWindow({ win }: { win: WindowState }) {
  const active = useWindowStore((s) => s.activeId === win.id)
  const { focusWindow, moveWindow, resizeWindow } = useWindowStore.getState()

  const app = getApp(win.appId)
  if (!app) return null
  const Content = app.component ?? Placeholder

  const track = (move: (e: PointerEvent) => void) => {
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const startDrag = (e: React.PointerEvent) => {
    focusWindow(win.id)
    if (win.maximized) return
    const dx = e.clientX - win.x
    const dy = e.clientY - win.y
    track((ev) => moveWindow(win.id, ev.clientX - dx, Math.max(MENUBAR_H, ev.clientY - dy)))
  }

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation()
    focusWindow(win.id)
    const sx = e.clientX
    const sy = e.clientY
    const sw = win.width
    const sh = win.height
    track((ev) =>
      resizeWindow(win.id, Math.max(MIN_W, sw + ev.clientX - sx), Math.max(MIN_H, sh + ev.clientY - sy)),
    )
  }

  const frame: CSSProperties = win.maximized
    ? { left: 0, top: MENUBAR_H, width: '100%', height: `calc(100% - ${MENUBAR_H + DOCK_SPACE}px)` }
    : { left: win.x, top: win.y, width: win.width, height: win.height }

  return (
    <div
      onPointerDown={() => focusWindow(win.id)}
      className={`win-in absolute rounded-[14px] overflow-hidden border border-white/25 origin-bottom
        transition-[transform,opacity,box-shadow] duration-300
        ${win.minimized ? 'opacity-0 scale-50 translate-y-[40vh] pointer-events-none' : 'opacity-100 pointer-events-auto'}
        ${active ? 'shadow-[0_24px_70px_rgba(0,0,0,0.5)]' : 'shadow-[0_8px_24px_rgba(0,0,0,0.3)]'}`}
      style={{ ...frame, zIndex: win.zIndex }}
    >
      <TitleBar win={win} active={active} onDragStart={startDrag} />
      <div className="w-full h-full">
        <Content title={app.title} />
      </div>
      {!win.maximized && (
        <div onPointerDown={startResize} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30" />
      )}
    </div>
  )
}