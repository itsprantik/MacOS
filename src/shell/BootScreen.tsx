import { useEffect, useState } from 'react'
import { useSystemStore } from '../core/store/systemStore'
import Logo from '../components/Logo'

const BOOT_DURATION = 4500 // ms

export default function BootScreen() {
  const setPhase = useSystemStore((s) => s.setPhase)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    let timeout: number

    const tick = (now: number) => {
      const p = Math.min((now - start) / BOOT_DURATION, 1)
      setProgress(p)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setFading(true)
        timeout = window.setTimeout(() => setPhase('login'), 700)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [setPhase])

  return (
    <div
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center
        transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <Logo className="w-20 h-24 text-white" />

      <div className="mt-16 w-48 h-1 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}   