import { useEffect, useRef, useState } from 'react'
import { useTimerStore } from '../../core/store/timerStore'

const pad = (n: number) => String(n).padStart(2, '0')

const fmtTimer = (sec: number) => {
  const t = Math.ceil(sec)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const fmtWatch = (ms: number) =>
  `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)}.${pad(Math.floor(ms / 10) % 100)}`

function Field({
  label, value, max, onChange,
}: { label: string; value: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value || '0', 10) || 0)))}
        className="w-[96px] h-[84px] rounded-2xl bg-black/[0.05] dark:bg-white/10 text-center text-[44px] font-light outline-none focus:ring-2 focus:ring-[#ff9f0a]/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-[12px] text-neutral-500">{label}</span>
    </div>
  )
}

const circleBtn =
  'w-[76px] h-[76px] rounded-full text-[14px] font-medium flex items-center justify-center transition-opacity active:opacity-70'

const PRESETS: [string, number][] = [
  ['1 min', 60], ['5 min', 300], ['10 min', 600], ['15 min', 900], ['30 min', 1800], ['1 hr', 3600],
]

function TimerView() {
  const { total, remaining, running, finished, setTotal, start, pause, reset } = useTimerStore()
  const [h, setH] = useState(Math.floor(total / 3600))
  const [m, setM] = useState(Math.floor((total % 3600) / 60))
  const [s, setS] = useState(total % 60)

  const inSession = running || finished || remaining < total

  const setAll = (sec: number) => {
    setH(Math.floor(sec / 3600))
    setM(Math.floor((sec % 3600) / 60))
    setS(sec % 60)
  }

  const begin = () => {
    const sec = h * 3600 + m * 60 + s
    if (sec <= 0) return
    setTotal(sec)
    start()
  }

  if (!inSession) {
    return (
      <div className="flex flex-col items-center gap-6 pt-6">
        <div className="flex gap-3">
          <Field label="hr" value={h} max={23} onChange={setH} />
          <Field label="min" value={m} max={59} onChange={setM} />
          <Field label="sec" value={s} max={59} onChange={setS} />
        </div>

        <div className="flex flex-wrap justify-center gap-2 px-6">
          {PRESETS.map(([label, sec]) => (
            <button
              key={label}
              onClick={() => setAll(sec)}
              className="px-3 py-1 rounded-full bg-black/[0.06] dark:bg-white/10 text-[12px] hover:bg-black/10 dark:hover:bg-white/20"
            >
              {label}
            </button>
          ))}
        </div>

        <button onClick={begin} className={`${circleBtn} bg-[#30d158]/25 text-[#30d158]`}>Start</button>
      </div>
    )
  }

  const R = 90
  const C = 2 * Math.PI * R
  const frac = total ? remaining / total : 0

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="relative w-[220px] h-[220px]">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r={R} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="8" />
          <circle
            cx="110" cy="110" r={R} fill="none" stroke="#ff9f0a" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 110 110)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[48px] font-light tabular-nums">{finished ? '00:00' : fmtTimer(remaining)}</div>
          {finished && <div className="text-[13px] text-[#ff9f0a] font-medium">Time's up</div>}
        </div>
      </div>

      <div className="flex gap-10">
        <button onClick={reset} className={`${circleBtn} bg-black/10 dark:bg-white/15`}>
          {finished ? 'Done' : 'Cancel'}
        </button>
        {!finished && (
          <button
            onClick={running ? pause : start}
            className={`${circleBtn} ${running ? 'bg-[#ff9f0a]/25 text-[#ff9f0a]' : 'bg-[#30d158]/25 text-[#30d158]'}`}
          >
            {running ? 'Pause' : 'Resume'}
          </button>
        )}
      </div>
    </div>
  )
}

function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const base = useRef(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(performance.now() - base.current), 33)
    return () => clearInterval(id)
  }, [running])

  return {
    elapsed, running, laps,
    toggle: () => {
      if (!running) base.current = performance.now() - elapsed
      setRunning((r) => !r)
    },
    lap: () => setLaps((l) => [elapsed, ...l]),
    reset: () => {
      setRunning(false)
      setElapsed(0)
      setLaps([])
    },
  }
}

function StopwatchView({ sw }: { sw: ReturnType<typeof useStopwatch> }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-6 min-h-0">
      <div className="text-[56px] font-light tabular-nums">{fmtWatch(sw.elapsed)}</div>

      <div className="flex gap-10">
        <button
          onClick={sw.running ? sw.lap : sw.reset}
          disabled={!sw.running && sw.elapsed === 0}
          className={`${circleBtn} bg-black/10 dark:bg-white/15 disabled:opacity-40`}
        >
          {sw.running ? 'Lap' : 'Reset'}
        </button>
        <button
          onClick={sw.toggle}
          className={`${circleBtn} ${sw.running ? 'bg-[#ff453a]/25 text-[#ff453a]' : 'bg-[#30d158]/25 text-[#30d158]'}`}
        >
          {sw.running ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="w-full max-w-[340px] overflow-y-auto max-h-[160px] px-4 text-[13px] tabular-nums">
        {sw.laps.map((l, i) => (
          <div key={i} className="flex justify-between py-1.5 border-b border-black/10 dark:border-white/10">
            <span className="text-neutral-500">Lap {sw.laps.length - i}</span>
            <span>{fmtWatch(l - (sw.laps[i + 1] ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Clock() {
  const [tab, setTab] = useState<'timer' | 'stopwatch'>('timer')
  const sw = useStopwatch()

  return (
    <div className="w-full h-full flex flex-col items-center bg-white/90 dark:bg-[#1c1c1e]/92 backdrop-blur-2xl text-neutral-900 dark:text-neutral-100">
      <div className="mt-2 inline-flex rounded-lg bg-black/[0.06] dark:bg-white/10 p-0.5 gap-0.5">
        {(['timer', 'stopwatch'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-1 rounded-md text-[13px] capitalize ${
              tab === t ? 'bg-white dark:bg-white/20 shadow-sm' : 'text-neutral-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'timer' ? <TimerView /> : <StopwatchView sw={sw} />}
    </div>
  )
}