export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="currentColor" className={className}>
      {/* apple body */}
      <path d="M50 38 C38 28, 10 32, 10 66 C10 94, 30 116, 42 116 C46 116, 48 114, 50 114 C52 114, 54 116, 58 116 C70 116, 90 94, 90 66 C90 32, 62 28, 50 38 Z" />
      {/* leaf */}
      <path d="M52 30 C52 14, 62 4, 76 2 C78 18, 68 30, 52 30 Z" />
    </svg>
  )
}