import { useSystemStore } from '../core/store/systemStore'

export default function Desktop() {
  const setPhase = useSystemStore((s) => s.setPhase)

  return (
    <div
      className="fixed inset-0 fade-in"
      style={{
        background:
          'radial-gradient(circle at 15% 25%, #6a82fb 0%, transparent 55%),' +
          'radial-gradient(circle at 85% 75%, #fc5c7d 0%, transparent 55%),' +
          '#2b2f5a',
      }}
    >
      {/* MenuBar goes here */}
      {/* Desktop icons + WindowManager go here */}
      {/* Dock goes here */}

      <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xl">
        Desktop ready
      </div>

      <button
        onClick={() => setPhase('login')}
        className="absolute top-2 right-3 text-xs text-white/70 hover:text-white"
      >
        Log out
      </button>
    </div>
  )
}            