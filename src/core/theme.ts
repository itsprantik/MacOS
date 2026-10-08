import { useEffect, useState } from 'react'
import { useSystemStore } from './store/systemStore'

export function useIsDark() {
  const theme = useSystemStore((s) => s.theme)
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = (e: MediaQueryListEvent) => setPrefersDark(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return theme === 'dark' || (theme === 'auto' && prefersDark)
}

// call once in <App />: puts a "dark" class on <html>
export function useApplyTheme() {
  const dark = useIsDark()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
}