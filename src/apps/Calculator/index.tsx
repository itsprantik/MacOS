import { useEffect, useRef, useState } from 'react'

type Op = '+' | '−' | '×' | '÷'

const compute = (a: number, b: number, op: Op) =>
  op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b

const toStr = (n: number) => (isFinite(n) ? parseFloat(n.toPrecision(10)).toString() : 'Error')

const pretty = (s: string) => {
  if (s === 'Error' || s.includes('e')) return s
  const [int, frac] = s.split('.')
  const neg = int.startsWith('-')
  const digits = neg ? int.slice(1) : int
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (neg ? '-' : '') + withCommas + (frac !== undefined ? '.' + frac : '')
}

const ROWS: { k: string; kind: 'fn' | 'num' | 'op'; span?: boolean }[] = [
  { k: 'AC', kind: 'fn' }, { k: '±', kind: 'fn' }, { k: '%', kind: 'fn' }, { k: '÷', kind: 'op' },
  { k: '7', kind: 'num' }, { k: '8', kind: 'num' }, { k: '9', kind: 'num' }, { k: '×', kind: 'op' },
  { k: '4', kind: 'num' }, { k: '5', kind: 'num' }, { k: '6', kind: 'num' }, { k: '−', kind: 'op' },
  { k: '1', kind: 'num' }, { k: '2', kind: 'num' }, { k: '3', kind: 'num' }, { k: '+', kind: 'op' },
  { k: '0', kind: 'num', span: true }, { k: '.', kind: 'num' }, { k: '=', kind: 'op' },
]

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [fresh, setFresh] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    root.current?.focus()
  }, [])

  const digit = (d: string) => {
    if (fresh || display === 'Error') {
      setDisplay(d)
    } else if (display.replace(/[-.]/g, '').length < 9) {
      setDisplay(display === '0' ? d : display + d)
    }
    setFresh(false)
  }

  const dot = () => {
    if (fresh || display === 'Error') setDisplay('0.')
    else if (!display.includes('.')) setDisplay(display + '.')
    setFresh(false)
  }

  const clear = () => {
    setDisplay('0')
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  const back = () => {
    if (fresh || display === 'Error') return
    setDisplay(display.length > 1 && display !== '-0' ? display.slice(0, -1) : '0')
  }

  const operator = (next: Op) => {
    if (display === 'Error') return
    const cur = parseFloat(display)
    if (acc !== null && op && !fresh) {
      const r = compute(acc, cur, op)
      setDisplay(toStr(r))
      if (!isFinite(r)) {
        setAcc(null)
        setOp(null)
        setFresh(true)
        return
      }
      setAcc(r)
    } else {
      setAcc(cur)
    }
    setOp(next)
    setFresh(true)
  }

  const equals = () => {
    if (acc === null || !op) return
    setDisplay(toStr(compute(acc, parseFloat(display), op)))
    setAcc(null)
    setOp(null)
    setFresh(true)
  }

  const press = (k: string) => {
    if (/^\d$/.test(k)) return digit(k)
    if (k === '.') return dot()
    if (k === 'AC') return clear()
    if (k === '=') return equals()
    if (k === '±' && display !== 'Error') return setDisplay(toStr(-parseFloat(display)))
    if (k === '%' && display !== 'Error') return setDisplay(toStr(parseFloat(display) / 100))
    if (['+', '−', '×', '÷'].includes(k)) operator(k as Op)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−', Enter: '=', Escape: 'AC' }
    if (e.key === 'Backspace') return back()
    const k = map[e.key] ?? e.key
    if (/^[\d.+=%]$/.test(k) || ['×', '÷', '−', '=', 'AC'].includes(k)) {
      e.preventDefault()
      press(k)
    }
  }

  const shown = pretty(display)
  const size = shown.length > 11 ? 34 : shown.length > 8 ? 44 : 58

  return (
    <div
      ref={root}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="w-full h-full bg-[#1c1c1e]/92 backdrop-blur-2xl pt-10 px-3 pb-3 flex flex-col outline-none select-none"
    >
      <div
        className="flex-1 flex items-end justify-end px-3 pb-2 text-white font-light tabular-nums overflow-hidden"
        style={{ fontSize: size }}
      >
        {shown}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {ROWS.map(({ k, kind, span }) => {
          const pending = kind === 'op' && k !== '=' && op === k && fresh
          const style =
            kind === 'fn'
              ? 'bg-[#a5a5a5] text-black active:bg-[#d4d4d2]'
              : kind === 'num'
                ? 'bg-[#333333] text-white active:bg-[#737373]'
                : pending
                  ? 'bg-white text-[#ff9f0a]'
                  : 'bg-[#ff9f0a] text-white active:bg-[#fcc78f]'
          return (
            <button
              key={k}
              onClick={() => press(k)}
              className={`h-[56px] rounded-full text-[24px] transition-colors ${style} ${span ? 'col-span-2 text-left pl-[22px]' : ''}`}
            >
              {k === 'AC' && display !== '0' && !fresh ? 'C' : k}
            </button>
          )
        })}
      </div>
    </div>
  )
}