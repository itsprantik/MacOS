import type { CSSProperties } from 'react'
import type { MenuItem } from '../core/store/uiStore'

export default function MenuPanel({
  items,
  onDone,
  className = '',
  style,
}: {
  items: MenuItem[]
  onDone: () => void
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`min-w-[210px] rounded-xl bg-neutral-800/75 backdrop-blur-2xl border border-white/15 shadow-2xl py-1 text-[13px] text-white ${className}`}
      style={style}
    >
      {items.map((it, i) =>
        it.divider ? (
          <div key={i} className="my-1 mx-3 h-px bg-white/15" />
        ) : (
          <button
            key={i}
            disabled={it.disabled}
            onClick={() => {
              onDone()
              it.onClick?.()
            }}
            className="block w-[calc(100%-8px)] mx-1 text-left px-3 py-[3px] rounded-md enabled:hover:bg-[#0a84ff] disabled:opacity-40"
          >
            {it.label}
          </button>
        ),
      )}
    </div>
  )
}