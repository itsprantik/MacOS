import { useEffect, useState } from 'react'
import { Search, Timer as TimerIcon } from 'lucide-react'
import { useSystemStore } from '../core/store/systemStore'
import { useWindowStore } from '../core/store/windowStore'
import { useUiStore } from '../core/store/uiStore'
import { useTimerStore } from '../core/store/timerStore'
import { useMusicStore } from '../core/store/musicStore'
import { getApp } from '../core/appRegistry'
import { useBattery } from '../core/hooks/useBattery'
import { BatteryIcon, WifiIcon, ControlCenterIcon } from '../components/StatusIcons'
import MenuPanel from '../components/MenuPanel'

const MENUS = ['File', 'Edit', 'View', 'Window', 'Help']

const fmtDur = (sec: number) => {
  if (!isFinite(sec) || sec <= 0) return null
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h > 0 ? `${h} hr ${m} min` : `${m} min`
}

const fmtClock = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

export default function MenuBar() {
  const { controlCenterOpen, setControlCenter, wifi, setPhase, userName } = useSystemStore()
  const openApp = useWindowStore((s) => s.openApp)
  const setSettingsPage = useUiStore((s) => s.setSettingsPage)
  const activeTitle = useWindowStore((s) => {
    const w = s.windows.find((x) => x.id === s.activeId)
    return w ? getApp(w.appId)?.title : undefined
  })
  const timerRunning = useTimerStore((s) => s.running)
  const timerLeft = useTimerStore((s) => Math.ceil(s.remaining))
  const musicPlaying = useMusicStore((s) => s.isPlaying)
  const battery = useBattery()

  const [now, setNow] = useState(new Date())
  const [open, setOpen] = useState<null | 'apple' | 'battery'>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // tell Safari's native view to step aside while a menu is open
  useEffect(() => {
    useUiStore.getState().setMenuOpen(open !== null)
    return () => useUiStore.getState().setMenuOpen(false)
  }, [open])

  const clock =
    now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '') +
    '  ' +
    now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  const pct = Math.round(battery.level * 100)
  let status = ''
  if (battery.charging) {
    const t = fmtDur(battery.chargingTime)
    status = pct >= 100 ? 'Fully Charged' : t ? `Charging · ${t} until full` : 'Charging'
  } else {
    const t = fmtDur(battery.dischargingTime)
    status = t ? `${t} remaining` : `${pct}% remaining`
  }

  const divider = <div className="my-2 h-px bg-white/15" />

  return (
    <>
      {open && <div className="fixed inset-0 z-[999]" onMouseDown={() => setOpen(null)} />}

      <div className="fixed top-0 inset-x-0 h-7 z-[1000] flex items-center justify-between px-2 text-white text-[13px] bg-black/10 backdrop-blur-xl [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
        {/* left */}
        <div className="flex items-center gap-0.5">
          <div className="relative">
            <button
              onClick={() => setOpen(open === 'apple' ? null : 'apple')}
              className="px-2.5 h-6 rounded hover:bg-white/15 flex items-center"
            >
              <img src="/logo.png" alt="" draggable={false} className="h-[15px] invert mix-blend-screen" />
            </button>
            {open === 'apple' && (
              <MenuPanel
                className="absolute top-7 left-0"
                onDone={() => setOpen(null)}
                items={[
                  { label: 'About This Mac', onClick: () => openApp('about')},
                  {
                    label: 'About the Creator…',
                    onClick: () => {
                      setSettingsPage('creator')
                      openApp('settings')
                    },
                  },
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
          {timerRunning && (
            <button
              onClick={() => openApp('clock')}
              className="flex items-center gap-1 px-1.5 h-5 rounded hover:bg-white/15 tabular-nums"
            >
              <TimerIcon size={13} /> {fmtClock(timerLeft)}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setOpen(open === 'battery' ? null : 'battery')}
              className={`px-1.5 h-6 rounded flex items-center ${open === 'battery' ? 'bg-white/30' : 'hover:bg-white/15'}`}
            >
              <BatteryIcon level={battery.level} />
            </button>

            {open === 'battery' && (
              <div className="absolute top-7 right-0 w-[280px] rounded-xl bg-neutral-800/80 backdrop-blur-2xl border border-white/15 shadow-2xl p-3.5 text-[13px] text-white [text-shadow:none]">
                <div className="flex justify-between font-semibold">
                  <span>Battery</span>
                  {battery.supported && <span className="font-normal text-white/80">{pct}%</span>}
                </div>

                {battery.supported ? (
                  <>
                    <div className="mt-1 text-white/70">
                      Power Source: {battery.charging ? 'Power Adapter' : 'Battery'}
                    </div>
                    <div className="text-white/70">{status}</div>
                  </>
                ) : (
                  <div className="mt-1 text-white/60">
                    Battery details aren't available in this browser. Chrome and Edge support them.
                  </div>
                )}

                {musicPlaying && (
                  <>
                    {divider}
                    <div className="text-[12px] font-semibold text-white/80">Using Significant Energy</div>
                    <div className="mt-1">Music</div>
                  </>
                )}

                {divider}
                <button
                  onClick={() => {
                    setOpen(null)
                    openApp('settings')
                  }}
                  className="-mx-1.5 px-1.5 py-[3px] rounded-md w-[calc(100%+12px)] text-left hover:bg-[#0a84ff]"
                >
                  Battery Settings…
                </button>
              </div>
            )}
          </div>

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