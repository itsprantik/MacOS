import type { AppProps } from '../core/types'

export default function Placeholder({ title }: AppProps) {
  return (
    <div className="w-full h-full bg-neutral-900/85 backdrop-blur-2xl flex flex-col items-center justify-center text-white/70">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="text-sm mt-1">This app is coming soon.</div>
    </div>
  )
}