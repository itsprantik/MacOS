import { useEffect, useState } from 'react'
import { useSystemStore } from '../core/store/systemStore'

export default function LoginScreen() {
  const { userName, setPhase } = useSystemStore()
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo: any password works. Replace with real check later.
    // Example: if (password !== 'admin') { setShake(true); ... return }
    setPhase('desktop')
  }

  return (
    <div
      className="fixed inset-0 fade-in flex flex-col items-center justify-center text-white"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, #5b6ee1 0%, transparent 50%),' +
          'radial-gradient(circle at 80% 70%, #c850c0 0%, transparent 50%),' +
          '#1b1f3b',
      }}
    >
      {/* blur layer */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/20" />

      {/* date and time */}
      <div className="absolute top-16 text-center z-10">
        <div className="text-lg font-medium opacity-90">
          {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-7xl font-semibold tracking-tight">
          {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      {/* user */}
      <form
        onSubmit={handleLogin}
        className={`relative z-10 flex flex-col items-center ${shake ? 'shake' : ''}`}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-300 to-gray-500
          flex items-center justify-center text-4xl font-semibold shadow-xl">
          {userName[0]}
        </div>
        <div className="mt-3 text-xl font-medium">{userName}</div>

        <div className="mt-4 relative">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-56 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 pr-9
              text-sm placeholder-white/60 outline-none focus:bg-white/30"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
              bg-white/30 hover:bg-white/50 flex items-center justify-center text-xs"
          >
          <button type="submit" className="...same classes...">→</button>
          </button>
        </div>
        <div className="mt-3 text-xs opacity-60">Press Enter to log in</div>
      </form>

      {/* bottom actions */}
      <div className="absolute bottom-10 z-10 flex gap-8 text-xs opacity-80">
        <button onClick={() => setPhase('boot')} className="hover:opacity-100">
          Restart
        </button>
        <button onClick={() => setPhase('boot')} className="hover:opacity-100">
          Shut Down
        </button>
      </div>
    </div>
  )
}