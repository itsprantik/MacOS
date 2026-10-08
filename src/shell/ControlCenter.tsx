import type { CSSProperties, ReactNode } from 'react'
import {
  Wifi, Bluetooth, Radio, Moon, LayoutList, Cast, Sun, Volume2,
  Contrast, Calculator, Timer, Camera, SkipBack, SkipForward, Play, Pause,
} from 'lucide-react'
import { useSystemStore } from '../core/store/systemStore'
import { useMusicStore } from '../core/store/musicStore'
import { useWindowStore } from '../core/store/windowStore'
import { tracks } from '../apps/Music/tracks'
import { useIsDark } from '../core/theme'

const glass =
  'bg-white/[0.14] backdrop-blur-2xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'

function Round({
  on = false,
  onClick,
  children,
}: {
  on?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`w-[60px] h-[60px] justify-self-center rounded-full flex items-center justify-center transition-colors
        ${on ? 'bg-white text-[#0a84ff] shadow-md' : `${glass} text-white`}`}
    >
      {children}
    </button>
  )
}

function Pill({
  on,
  icon,
  label,
  sub,
  onClick,
}: {
  on: boolean
  icon: ReactNode
  label: string
  sub?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`col-span-2 rounded-[30px] flex items-center gap-2.5 px-2.5 text-left ${glass}`}
    >
      <span
        className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 transition-colors
          ${on ? 'bg-white text-[#0a84ff]' : 'bg-white/20 text-white'}`}
      >
        {icon}
      </span>
      <span className="text-white">
        <div className="text-[13px] font-semibold leading-tight">{label}</div>
        {sub && <div className="text-[11px] text-white/60 leading-tight">{sub}</div>}
      </span>
    </button>
  )
}

function Slider({
  label,
  left,
  right,
  value,
  min = 0,
  onChange,
}: {
  label: string
  left: ReactNode
  right: ReactNode
  value: number
  min?: number
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (1 - min)) * 100
  return (
    <div className={`col-span-4 rounded-[24px] px-3.5 py-2 text-white ${glass}`}>
      <div className="text-[12px] font-semibold mb-0.5">{label}</div>
      <div className="flex items-center gap-2">
        {left}
        <input
          type="range"
          min={min}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="cc-slider flex-1"
          style={{ '--v': `${pct}%` } as CSSProperties}
        />
        {right}
      </div>
    </div>
  )
}

function NowPlaying() {
  const { currentIndex, isPlaying, toggle, next, prev } = useMusicStore()
  const openApp = useWindowStore((s) => s.openApp)
  const track = currentIndex !== null ? tracks[currentIndex] : null

  return (
    <div className={`col-span-2 row-span-2 rounded-[28px] p-3 flex flex-col justify-between text-white ${glass}`}>
      <button
        onClick={() => openApp('music')}
        className="w-11 h-11 rounded-lg overflow-hidden bg-gradient-to-br from-[#fa233b] to-[#ff8a9a]"
      >
        {track && <img src={track.cover} alt="" className="w-full h-full object-cover" />}
      </button>
      <div>
        <div className="text-[13px] font-semibold truncate">{track?.title ?? 'Not Playing'}</div>
        <div className="text-[11px] text-white/60 truncate">{track?.artist ?? 'Music'}</div>
      </div>
      <div className="flex items-center justify-center gap-5">
        <button onClick={prev}><SkipBack size={18} fill="currentColor" /></button>
        <button onClick={toggle}>
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        <button onClick={next}><SkipForward size={18} fill="currentColor" /></button>
      </div>
    </div>
  )
}

export default function ControlCenter() {
  const s = useSystemStore()
  const openApp = useWindowStore((st) => st.openApp)
const dark = useIsDark()

  return (
    <>
      {s.controlCenterOpen && (
        <div className="fixed inset-0 z-[999]" onMouseDown={() => s.setControlCenter(false)} />
      )}

      <div
        className={`fixed top-9 right-2 z-[1100] w-[336px] origin-top-right transition duration-200
          ${s.controlCenterOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="grid grid-cols-4 auto-rows-[60px] gap-2.5">
          <Pill on={s.wifi} icon={<Wifi size={20} />} label="Wi-Fi" sub={s.wifi ? 'Home' : 'Off'} onClick={() => s.toggle('wifi')} />
          <NowPlaying />

          <Round on={s.bluetooth} onClick={() => s.toggle('bluetooth')}><Bluetooth size={22} /></Round>
          <Round on={s.airdrop} onClick={() => s.toggle('airdrop')}><Radio size={22} /></Round>

          <Pill on={s.focus} icon={<Moon size={20} />} label="Focus" onClick={() => s.toggle('focus')} />
          <Round><LayoutList size={20} /></Round>
          <Round><Cast size={20} /></Round>

          <Slider
            label="Display"
            left={<Sun size={13} />}
            right={<Sun size={16} />}
            value={s.brightness}
            min={0.3}
            onChange={s.setBrightness}
          />
          <Slider
            label="Sound"
            left={<Volume2 size={13} />}
            right={<Volume2 size={16} />}
            value={s.volume}
            onChange={s.setVolume}
          />

          <Round on={dark} onClick={() => s.setTheme(dark ? 'light' : 'dark')}><Contrast size={20} /></Round>
<Round onClick={() => { openApp('calculator'); s.setControlCenter(false) }}><Calculator size={20} /></Round>
<Round onClick={() => { openApp('clock'); s.setControlCenter(false) }}><Timer size={20} /></Round>
<Round><Camera size={20} /></Round>
        </div>

        <div className="mt-3 flex justify-center">
          <span className={`px-3.5 py-1 rounded-full text-[11px] font-medium text-white ${glass}`}>
            Edit Controls
          </span>
        </div>
      </div>
    </>
  )
}                               