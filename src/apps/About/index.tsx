import { useEffect, useState } from 'react'
import { useBattery } from '../../core/hooks/useBattery'
import { useSystemStore } from '../../core/store/systemStore'
import { useWindowStore } from '../../core/store/windowStore'
import { useUiStore } from '../../core/store/uiStore'

interface SysInfo {
  hostname?: string
  platform?: string
  osVersion?: string
  arch?: string
  cpuModel?: string
  cpuCores?: number
  memTotal?: number
  uptime?: number
  versions?: { electron?: string; chrome?: string }
  displays?: { w: number; h: number; scale: number }[]
}

const PLATFORM: Record<string, string> = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }

function gpuName() {
  try {
    const gl = document.createElement('canvas').getContext('webgl') as WebGLRenderingContext | null
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    if (!gl || !ext) return 'Unknown'
    const raw = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
    // "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 ..., D3D11)" → "NVIDIA GeForce RTX 3060"
    const m = raw.match(/^ANGLE \(([^,]*),\s*([^,]*?)(?:\s+Direct3D.*|\s+OpenGL.*)?,/)
    return m ? m[2].trim() : raw
  } catch {
    return 'Unknown'
  }
}

const uptimeText = (s?: number) => {
  if (!s) return '—'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return d > 0 ? `${d} day${d > 1 ? 's' : ''}, ${h} hr` : h > 0 ? `${h} hr, ${m} min` : `${m} min`
}

export default function About() {
  const userName = useSystemStore((s) => s.userName)
  const openApp = useWindowStore((s) => s.openApp)
  const setSettingsPage = useUiStore((s) => s.setSettingsPage)
  const battery = useBattery()
  const [info, setInfo] = useState<SysInfo>({})

  useEffect(() => {
    const api = (window as any).electronAPI
    if (api?.system?.info) api.system.info().then(setInfo).catch(() => {})
  }, [])

  const nav = navigator as any
  const gb = info.memTotal
    ? `${Math.round(info.memTotal / 2 ** 30)} GB`
    : nav.deviceMemory
      ? `${nav.deviceMemory}+ GB`
      : '—'
  const d = info.displays?.[0]
  const osName = info.platform ? `${PLATFORM[info.platform] ?? info.platform} ${info.osVersion ?? ''}`.trim() : nav.userAgentData?.platform ?? 'Browser'

  const rows: [string, string][] = [
    ['Name', info.hostname ?? `${userName}'s WebOS`],
    ['Processor', info.cpuModel ? `${info.cpuModel} (${info.cpuCores} cores)` : `${nav.hardwareConcurrency ?? '—'} logical cores`],
    ['Memory', gb],
    ['Graphics', gpuName()],
    ['Display', d ? `${d.w} × ${d.h}${d.scale > 1 ? ` @${d.scale}x` : ''}` : `${screen.width} × ${screen.height}`],
    ['System', osName + (info.arch ? ` (${info.arch})` : '')],
    ['Battery', battery.supported ? `${Math.round(battery.level * 100)}%${battery.charging ? ', charging' : ''}` : 'Not available'],
    ['Network', navigator.onLine ? 'Online' : 'Offline'],
    ['Engine', info.versions?.electron ? `Electron ${info.versions.electron} · Chrome ${info.versions.chrome}` : 'Web browser'],
    ['Uptime', uptimeText(info.uptime)],
  ]

  return (
    <div className="w-full h-full flex flex-col items-center bg-white/85 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl text-neutral-900 dark:text-neutral-100 pt-10 px-5 pb-5">
      <div className="w-[96px] h-[96px] rounded-[26px] bg-gradient-to-br from-[#5b8cff] via-[#7a5cff] to-[#c850c0] shadow-xl flex items-center justify-center">
        <img src="/logo.png" alt="" draggable={false} className="h-[44px] invert mix-blend-screen" />
      </div>

      <div className="mt-3 text-[26px] font-bold tracking-tight leading-none">WebOS</div>
      <div className="mt-1 text-[12px] text-neutral-500">Version 1.0</div>

      <div className="mt-5 w-full grid grid-cols-[84px_1fr] gap-x-3 gap-y-1.5 text-[12px] leading-snug">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <div className="text-right font-semibold text-neutral-500">{label}</div>
            <div className="break-words">{value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setSettingsPage('general')
          openApp('settings')
        }}
        className="mt-auto px-4 py-1.5 rounded-lg bg-black/[0.07] dark:bg-white/10 text-[12px] font-medium hover:bg-black/10 dark:hover:bg-white/15"
      >
        More Info…
      </button>
    </div>
  )
}