import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useSystemStore } from '../core/store/systemStore'
import { useWindowStore } from '../core/store/windowStore'
import { getApp } from '../core/appRegistry'
import { useBattery } from '../core/hooks/useBattery'
import { BatteryIcon, WifiIcon, ControlCenterIcon } from '../components/StatusIcons'
import MenuPanel from '../components/MenuPanel'
import { useUiStore } from '../core/store/uiStore'

const MENUS = ['File', 'Edit', 'View', 'Window', 'Help']

export default function MenuBar() {
  const setSettingsPage = useUiStore((s) => s.setSettingsPage)
  const { controlCenterOpen, setControlCenter, wifi, setPhase, userName } = useSystemStore()
  const openApp = useWindowStore((s) => s.openApp)
  const activeTitle = useWindowStore((s) => {
    const w = s.windows.find((x) => x.id === s.activeId)
    return w ? getApp(w.appId)?.title : undefined
  })
  const { level } = useBattery()
  const [now, setNow] = useState(new Date())
  const [appleOpen, setAppleOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const clock =
    now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '') +
    '  ' +
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <>
      {appleOpen && <div className="fixed inset-0 z-[999]" onMouseDown={() => setAppleOpen(false)} />}

      <div className="fixed top-0 inset-x-0 h-7 z-[1000] flex items-center justify-between px-2 text-white text-[13px] bg-black/10 backdrop-blur-xl [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
        {/* left */}
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <button
              onClick={() => setAppleOpen((o) => !o)}
              className="px-2.5 h-6 rounded hover:bg-white/15 flex items-center"
            >
              <img src="/logo.png" alt="" draggable={false} className="h-[15px] invert mix-blend-screen" />
            </button>
            {appleOpen && (
              <MenuPanel
                className="absolute top-7 left-0"
                onDone={() => setAppleOpen(false)}
                items={[
                  { label: 'About the Creator…', onClick: () => { setSettingsPage('creator'); openApp('settings') } },
                  { label: 'About This Mac', disabled: true },
                  { divider: true },
                  { label: 'System Settings…', onClick: () => openApp('settings') },
                  { divider: true },
                  { label: 'Restart…', onClick: () => setPhase('boot') },
                  { label: 'Shut Down…', onClick: () => setPhase('boot') },
                  { divider: true },
                  { label: `Log Out ${userName}…`, onClick: () => setPhase('login') },
                ]}
              />
            )}
          </div>
          <span className="px-2.5 font-bold">{activeTitle ?? 'Finder'}</span>
          {MENUS.map((m) => (
            <span key={m} className="px-2.5 h-6 flex items-center rounded hover:bg-white/15">
              {m}
            </span>
          ))}
        </div>

        {/* right */}
        <div className="flex items-center gap-3.5 pr-1">
          <BatteryIcon level={level} />
          <WifiIcon off={!wifi} />
          <Search size={14} strokeWidth={2.4} />
          <button
            onClick={() => setControlCenter(!controlCenterOpen)}
            className={`px-1.5 h-5 rounded-md flex items-center ${controlCenterOpen ? 'bg-white/30' : 'hover:bg-white/15'}`}
          >
            <ControlCenterIcon />
          </button>
          <span className="font-medium whitespace-pre">{clock}</span>
        </div>
      </div>
    </>
  )
}