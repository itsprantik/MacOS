import { useSystemStore } from '../core/store/systemStore'
import { useUiStore } from '../core/store/uiStore'
import { useWallpaperStyle } from '../core/wallpaper'
import MenuBar from './MenuBar'
import Dock from './Dock'
import ControlCenter from './ControlCenter'
import ContextMenu from './ContextMenu'
import WidgetsLayer from './WidgetsLayer'
import WidgetGallery from './WidgetGallery'
import WindowManager from '../windowing/WindowManager'
import { useIsDark } from '../core/theme'
export default function Desktop() {
  const dark = useIsDark()
  const wallpaper = useWallpaperStyle()
  const brightness = useSystemStore((s) => s.brightness)
  const { openMenu, setGallery } = useUiStore()

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (e.target !== e.currentTarget) return // only on the bare desktop
    openMenu(e.clientX, e.clientY, [
      { label: 'New Folder', disabled: true },
      { divider: true },
      { label: 'Change Wallpaper…', disabled: true },
      { label: 'Edit Widgets…', onClick: () => setGallery(true) },
    ])
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden fade-in"
      style={wallpaper}
      onContextMenu={onContextMenu}
    >
    <div
    className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-500 ${dark ? 'opacity-30' : 'opacity-0'}`}
    />
      <WidgetsLayer />
      <WindowManager />
      <MenuBar />
      <Dock />
      <ControlCenter />
      <WidgetGallery />
      <ContextMenu />

      {/* brightness slider overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[5000] bg-black"
        style={{ opacity: (1 - brightness) * 0.8 }}
      />
    </div>
  )
}