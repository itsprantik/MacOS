  import { useEffect, useRef, useState } from 'react'
  import type { FormEvent } from 'react'
  import { useSystemStore } from '../core/store/systemStore'
  import { useWallpaperStyle } from '../core/wallpaper'

  const PASSWORD = '' // Empty = any password works. Set e.g. 'admin' to enforce one.

  function useClock() {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
      const id = setInterval(() => {
        setNow(new Date())
      }, 1000)

      return () => clearInterval(id)
    }, [])

    return now
  }

  function StatusBar() {
    return (
      <div className="absolute top-0 right-0 flex items-center gap-3 px-5 py-2 text-white text-[13px] font-semibold">
        <span>U.S.</span>

        {/* Battery */}
        <svg
          width="18"
          height="12"
          viewBox="0 0 18 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        >
          <rect x=".5" y=".5" width="17" height="11" rx="2" />
          <path d="M3 4h1M6 4h1M9 4h1M12 4h1M3 6.5h1M6 6.5h1M9 6.5h1M12 6.5h1M5 9h8" />
        </svg>

        {/* Battery level */}
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect
            x=".5"
            y=".5"
            width="23"
            height="12"
            rx="3.5"
            fill="none"
            stroke="currentColor"
            opacity=".5"
          />
          <rect
            x="2"
            y="2"
            width="20"
            height="9"
            rx="2"
            fill="currentColor"
          />
          <path
            d="M25 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2z"
            fill="currentColor"
            opacity=".5"
          />
        </svg>

        {/* Wi-Fi */}
        <svg
          width="17"
          height="13"
          viewBox="0 0 17 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M1.5 4.6a10 10 0 0 1 14 0" />
          <path d="M4 7.3a6.4 6.4 0 0 1 9 0" />
          <path d="M6.5 10a2.8 2.8 0 0 1 4 0" />
          <circle
            cx="8.5"
            cy="11.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </div>
    )
  }

  export default function LoginScreen() {
    const { userName, avatar, setPhase } = useSystemStore()

    // IMPORTANT:
    // Hooks must be called inside the component.
    const wallpaper = useWallpaperStyle()

    const now = useClock()

    const inputRef = useRef<HTMLInputElement>(null)

    const [password, setPassword] = useState('')
    const [revealed, setRevealed] = useState(false)
    const [shake, setShake] = useState(false)
    const [unlocking, setUnlocking] = useState(false)

    // Keep the password input focused so typing works instantly.
    useEffect(() => {
      const focus = () => {
        setRevealed(true)
        inputRef.current?.focus()
      }

      window.addEventListener('mousedown', focus)

      return () => {
        window.removeEventListener('mousedown', focus)
      }
    }, [])

    const date = now
      .toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      .replace(',', '')

    const time = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(/\s?(AM|PM)/i, '')

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (PASSWORD && password !== PASSWORD) {
        setShake(true)
        setPassword('')

        setTimeout(() => {
          setShake(false)
        }, 400)

        return
      }

      setUnlocking(true)

      setTimeout(() => {
        setPhase('desktop')
      }, 500)
    }

    const isImage =
      avatar.startsWith('/') || avatar.startsWith('http')

    return (
      <div
        className={`
          fixed inset-0 overflow-hidden fade-in
          transition-all duration-500
          ${
            unlocking
              ? 'opacity-0 scale-105 blur-sm'
              : 'opacity-100'
          }
        `}
        style={wallpaper}
      >
        <StatusBar />

        {/* Date + Time */}
        <div className="absolute top-[6%] inset-x-0 text-center">
          <div className="text-[3vh] font-medium text-[#d6f4ff]/90 tracking-tight">
            {date}
          </div>

          <div
            className="mt-[0.5vh] leading-none tracking-tight"
            style={{
              fontSize: '14vh',
              fontWeight: 800,
              fontFamily:
                'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(210,234,255,0.65))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter:
                'drop-shadow(0 2px 14px rgba(0,60,160,0.25))',
            }}
          >
            {time}
          </div>
        </div>

        {/* User */}
        <div className="absolute bottom-[5%] inset-x-0 flex flex-col items-center">
          {isImage ? (
            <img
              src={avatar}
              alt=""
              className="w-[54px] h-[54px] rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-[54px] h-[54px] rounded-full bg-gradient-to-b from-[#b7e38f] to-[#4fb581] flex items-center justify-center text-[28px] shadow-lg">
              {avatar}
            </div>
          )}

          <div className="mt-2 text-[15px] font-semibold text-white">
            {userName}
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative mt-1.5 h-[28px] w-[220px] flex items-center justify-center"
          >
            {/* Hint */}
            <div
              className={`
                absolute whitespace-nowrap text-[13px] font-semibold
                text-[#a9bdf5] transition-opacity duration-200
                ${
                  revealed || password
                    ? 'opacity-0'
                    : 'opacity-100'
                }
              `}
            >
              Touch ID or Enter Password
            </div>

            {/* Password */}
            <div
              className={`
                relative transition-opacity duration-200
                ${
                  revealed || password
                    ? 'opacity-100'
                    : 'opacity-0'
                }
                ${shake ? 'shake' : ''}
              `}
            >
              <input
                ref={inputRef}
                autoFocus
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setRevealed(true)
                }}
                placeholder="Enter Password"
                className="
                  w-[190px] rounded-full
                  bg-white/25 backdrop-blur-md
                  px-4 py-1 pr-8
                  text-center text-[13px]
                  text-white placeholder-white/70
                  outline-none
                "
              />

              {password && (
                <button
                  type="submit"
                  className="
                    absolute right-1 top-1/2
                    -translate-y-1/2
                    w-5 h-5 rounded-full
                    bg-white/40 hover:bg-white/60
                    text-white text-[11px]
                    flex items-center justify-center
                  "
                >
                  →
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }