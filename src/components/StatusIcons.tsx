export function BatteryIcon({ level = 1 }: { level?: number }) {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13">
      <rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".5" />
      <rect x="2" y="2" width={Math.max(2, 20 * level)} height="9" rx="2" fill="currentColor" />
      <path d="M25 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2z" fill="currentColor" opacity=".5" />
    </svg>
  )
}

export function WifiIcon({ off = false }: { off?: boolean }) {
  return (
    <svg width="17" height="13" viewBox="0 0 17 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity={off ? 0.4 : 1}>
      <path d="M1.5 4.6a10 10 0 0 1 14 0" />
      <path d="M4 7.3a6.4 6.4 0 0 1 9 0" />
      <path d="M6.5 10a2.8 2.8 0 0 1 4 0" />
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function ControlCenterIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="5" rx="2.5" />
      <circle cx="4" cy="3.5" r="1.3" fill="currentColor" stroke="none" />
      <rect x="1" y="8" width="14" height="5" rx="2.5" />
      <circle cx="12" cy="10.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}