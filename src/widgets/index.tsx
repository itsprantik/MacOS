import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Moon, Navigation, Laptop } from 'lucide-react'
import { useBattery } from '../core/hooks/useBattery'
import type { WidgetType } from '../core/store/widgetStore'

// Weather is static for now. Edit these, or wire a live API later.
const CITY = 'Cupertino'
const WEATHER = { temp: 58, condition: 'Clear', high: 79, low: 53 }

function Card({
  children,
  wide = false,
  pad = true,
  className = '',
}: {
  children: ReactNode
  wide?: boolean
  pad?: boolean
  className?: string
}) {
  return (
    <div
      className={`${wide ? 'w-[330px]' : 'w-[158px]'} h-[158px] rounded-[28px] text-white overflow-hidden
        bg-gradient-to-b from-white/15 to-black/35 backdrop-blur-2xl border border-white/25
        shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${pad ? 'p-4' : 'p-2.5'} ${className}`}
    >
      {children}
    </div>
  )
}

export function CalendarWidget() {
  const now = new Date()
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="text-[13px] font-semibold uppercase tracking-wide">
          {now.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-[44px] font-light leading-none mt-0.5">{now.getDate()}</div>
      </div>
      <div className="text-[13px] text-white/60">No events today</div>
    </Card>
  )
}

export function WeatherWidget() {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="text-[15px] font-semibold flex items-center gap-1">
          {CITY} <Navigation size={11} fill="currentColor" />
        </div>
        <div className="text-[44px] font-light leading-none">{WEATHER.temp}°</div>
      </div>
      <div>
        <Moon size={15} />
        <div className="text-[13px] font-semibold mt-0.5">{WEATHER.condition}</div>
        <div className="text-[13px] font-semibold">
          H:{WEATHER.high}° L:{WEATHER.low}°
        </div>
      </div>
    </Card>
  )
}

export function ClockWidget() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60

  return (
    <Card pad={false} className="flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.18)" />
        {Array.from({ length: 60 }).map((_, i) => {
          const major = i % 5 === 0
          return (
            <line
              key={i}
              x1="50" y1={major ? 5 : 4.5} x2="50" y2={major ? 9 : 7}
              stroke="white" strokeWidth={major ? 1.4 : 0.6} opacity={major ? 0.9 : 0.5}
              transform={`rotate(${i * 6} 50 50)`}
            />
          )
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1
          const a = ((n * 30 - 90) * Math.PI) / 180
          return (
            <text
              key={n}
              x={50 + Math.cos(a) * 34} y={50 + Math.sin(a) * 34}
              fontSize="9" fontWeight="600" fill="white"
              textAnchor="middle" dominantBaseline="central"
            >
              {n}
            </text>
          )
        })}
        <line x1="50" y1="50" x2="50" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" transform={`rotate(${h * 30} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${m * 6} 50 50)`} />
        <line x1="50" y1="56" x2="50" y2="12" stroke="white" strokeWidth="0.8" transform={`rotate(${s * 6} 50 50)`} />
        <circle cx="50" cy="50" r="2.5" fill="white" />
      </svg>
    </Card>
  )
}

export function BatteryWidget() {
  const { level } = useBattery()
  const R = 26
  const C = 2 * Math.PI * R
  return (
    <Card className="flex flex-col justify-between">
      <div className="relative w-[62px] h-[62px]">
        <svg width="62" height="62" viewBox="0 0 62 62">
          <circle cx="31" cy="31" r={R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" />
          <circle
            cx="31" cy="31" r={R} fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - level)} transform="rotate(-90 31 31)"
          />
        </svg>
        <Laptop size={22} className="absolute inset-0 m-auto" />
      </div>
      <div className="text-[40px] font-light leading-none">{Math.round(level * 100)}%</div>
    </Card>
  )
}

export function GlanceWidget() {
  return (
    <Card wide className="flex items-center">
      <div>
        <div className="font-mono text-[11px] text-white/80">Your day at a glance</div>
        <div className="mt-2 text-[26px] leading-tight" style={{ fontFamily: '"New York", Georgia, serif' }}>
          You call the shots.
        </div>
      </div>
    </Card>
  )
}

export const widgetTypes: Record<
  WidgetType,
  { label: string; size: 'small' | 'medium'; Component: ComponentType }
> = {
  calendar: { label: 'Calendar', size: 'small', Component: CalendarWidget },
  weather: { label: 'Weather', size: 'small', Component: WeatherWidget },
  clock: { label: 'Clock', size: 'small', Component: ClockWidget },
  battery: { label: 'Batteries', size: 'small', Component: BatteryWidget },
  glance: { label: 'Day at a Glance', size: 'medium', Component: GlanceWidget },
}