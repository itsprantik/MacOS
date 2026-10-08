import { useSystemStore } from './core/store/systemStore'
import { useApplyTheme } from './core/theme'
import BootScreen from './shell/BootScreen'
import LoginScreen from './shell/LoginScreen'
import Desktop from './shell/Desktop'

export default function App() {
  const phase = useSystemStore((s) => s.phase)
  useApplyTheme()

  return (
    <>
      {phase === 'boot' && <BootScreen />}
      {phase === 'login' && <LoginScreen />}
      {phase === 'desktop' && <Desktop />}
    </>
  )
}