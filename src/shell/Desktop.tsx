import { useSystemStore } from '../core/store/systemStore'
import { wallpaperStyle } from '../core/wallpaper'

export default function Desktop() {
  const setPhase = useSystemStore((s) => s.setPhase)

  return (
    <div className="fixed inset-0 fade-in" style={wallpaperStyle}>
      {/* MenuBar, desktop icons, WindowManager and Dock go here */}

      <button
        onClick={() => setPhase('login')}
        className="absolute top-2 right-3 text-xs text-white/80 hover:text-white"
      >
        Log out
      </button>
    </div>
  )
}