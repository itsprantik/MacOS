import { useEffect, useState, type ReactNode } from 'react'
import {
  Wifi, Bluetooth, Volume2, Sun, Image as ImageIcon, Settings as Cog, User, ExternalLink, Check,
} from 'lucide-react'
import { useSystemStore } from '../../core/store/systemStore'
import { useUiStore } from '../../core/store/uiStore'
import { useWidgetStore } from '../../core/store/widgetStore'
import { wallpapers } from '../../core/wallpaper'
import Switch from '../../components/Switch'
import { creator } from '../../config/creator'

const PAGES = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, color: '#0a84ff' },
  { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, color: '#0a84ff' },
  { id: 'sound', label: 'Sound', icon: Volume2, color: '#ff3b30' },
  { id: 'displays', label: 'Displays', icon: Sun, color: '#0a84ff' },
  { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon, color: '#32ade6' },
  { id: 'general', label: 'General', icon: Cog, color: '#8e8e93' },
]
const CREATOR_PAGE = { id: 'creator', label: 'About the Creator', icon: User, color: '#ff9f0a' }

function Group({ children }: { children: ReactNode }) {
  return <div className="bg-white rounded-xl divide-y divide-neutral-200 shadow-sm mb-5">{children}</div>
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-[13px]">
      <span>{label}</span>
      <div className="flex items-center gap-2 text-neutral-500">{children}</div>
    </div>
  )
}

/* ---------- pages ---------- */

function WifiPage() {
  const { wifi, toggle } = useSystemStore()
  return (
    <>
      <Group>
        <Row label="Wi-Fi"><Switch on={wifi} onChange={() => toggle('wifi')} /></Row>
      </Group>
      {wifi && (
        <Group>
          <Row label="Home"><span className="text-[#0a84ff]">Connected</span><Check size={14} className="text-[#0a84ff]" /></Row>
        </Group>
      )}
    </>
  )
}

function BluetoothPage() {
  const { bluetooth, toggle } = useSystemStore()
  return (
    <Group>
      <Row label="Bluetooth"><Switch on={bluetooth} onChange={() => toggle('bluetooth')} /></Row>
    </Group>
  )
}

function SoundPage() {
  const { volume, setVolume } = useSystemStore()
  return (
    <Group>
      <Row label="Output volume">
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => setVolume(+e.target.value)} className="w-56 accent-[#0a84ff]" />
        <span className="w-10 text-right tabular-nums">{Math.round(volume * 100)}%</span>
      </Row>
    </Group>
  )
}

function DisplaysPage() {
  const { brightness, setBrightness } = useSystemStore()
  return (
    <Group>
      <Row label="Brightness">
        <input type="range" min={0.3} max={1} step={0.01} value={brightness}
          onChange={(e) => setBrightness(+e.target.value)} className="w-56 accent-[#0a84ff]" />
      </Row>
    </Group>
  )
}

function WallpaperPage() {
  const { wallpaperId, setWallpaper } = useSystemStore()
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {wallpapers.map((w) => (
          <button key={w.id} onClick={() => setWallpaper(w.id)} className="text-left">
            <div
              className={`relative aspect-[16/10] rounded-xl border-2 ${wallpaperId === w.id ? 'border-[#0a84ff]' : 'border-transparent'} shadow`}
              style={w.style}
            >
              {wallpaperId === w.id && (
                <span className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[#0a84ff] flex items-center justify-center text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="mt-1.5 text-[12px] text-center">{w.name}</div>
          </button>
        ))}
      </div>
      <p className="mt-5 text-[12px] text-neutral-500">
        Want your own? Put an image in <code>public/wallpapers</code> and add it to the list in <code>core/wallpaper.ts</code>.
      </p>
    </>
  )
}

function GeneralPage() {
  const { userName, setUserName } = useSystemStore()
  const resetWidgets = useWidgetStore((s) => s.resetWidgets)
  return (
    <>
      <Group>
        <Row label="Name">
          <input value={userName} onChange={(e) => setUserName(e.target.value)}
            className="text-right bg-transparent outline-none text-neutral-800 w-44" />
        </Row>
        <Row label="Version"><span>WebOS 1.0</span></Row>
        <Row label="Display"><span>{window.screen.width} × {window.screen.height}</span></Row>
        <Row label="Language"><span>{navigator.language}</span></Row>
      </Group>
      <Group>
        <Row label="Reset widgets">
          <button onClick={resetWidgets} className="px-3 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800">Reset</button>
        </Row>
        <Row label="Erase all saved data">
          <button
            onClick={() => {
              if (confirm('Erase files, widgets and settings saved in this browser?')) {
                localStorage.clear()
                location.reload()
              }
            }}
            className="px-3 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600"
          >
            Erase…
          </button>
        </Row>
      </Group>
    </>
  )
}

interface GhProfile {
  public_repos: number
  followers: number
  following: number
}

function CreatorPage() {
  const [gh, setGh] = useState<GhProfile | null>(null)
  const hasUser = !!creator.githubUsername && creator.githubUsername !== 'your-github-username'
  const profileUrl = `https://github.com/${creator.githubUsername}`

  useEffect(() => {
    if (!hasUser) return
    fetch(`https://api.github.com/users/${creator.githubUsername}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setGh)
      .catch(() => {})
  }, [hasUser])

  return (
    <>
      <div className="flex flex-col items-center text-center mb-6">
        {hasUser ? (
          <img src={`https://github.com/${creator.githubUsername}.png`} alt=""
            className="w-24 h-24 rounded-full shadow-lg object-cover bg-neutral-200" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffb347] to-[#ff7e5f] shadow-lg flex items-center justify-center text-4xl text-white font-semibold">
            {creator.name[0]}
          </div>
        )}
        <div className="mt-3 text-[22px] font-bold">{creator.name}</div>
        <div className="text-[13px] text-neutral-500">{creator.tagline}</div>

        {hasUser && (
          <a href={profileUrl} target="_blank" rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-900 text-white text-[13px] hover:bg-neutral-700">
            GitHub · @{creator.githubUsername} <ExternalLink size={13} />
          </a>
        )}

        {gh && (
          <div className="mt-3 flex gap-5 text-[12px] text-neutral-600">
            <span><b className="text-neutral-900">{gh.public_repos}</b> repos</span>
            <span><b className="text-neutral-900">{gh.followers}</b> followers</span>
            <span><b className="text-neutral-900">{gh.following}</b> following</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="text-[14px] font-semibold mb-1.5">About me</div>
        {creator.about.map((p, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-neutral-700 mb-2 last:mb-0">{p}</p>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="text-[14px] font-semibold mb-1.5">Why I built WebOS</div>
        {creator.why.map((p, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-neutral-700 mb-2 last:mb-0">{p}</p>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="text-[14px] font-semibold mb-2">Built with</div>
        <div className="flex flex-wrap gap-2">
          {creator.stack.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full bg-neutral-100 text-[12px] text-neutral-700">{s}</span>
          ))}
        </div>
      </div>

      {creator.links.length > 0 && (
        <Group>
          {creator.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#0a84ff] hover:bg-neutral-50">
              {l.label} <ExternalLink size={13} />
            </a>
          ))}
        </Group>
      )}

      {!hasUser && (
        <p className="text-[12px] text-neutral-400 text-center">
          Set your details in <code>src/config/creator.ts</code>.
        </p>
      )}
    </>
  )
}

const RENDER: Record<string, () => ReactNode> = {
  wifi: () => <WifiPage />,
  bluetooth: () => <BluetoothPage />,
  sound: () => <SoundPage />,
  displays: () => <DisplaysPage />,
  wallpaper: () => <WallpaperPage />,
  general: () => <GeneralPage />,
  creator: () => <CreatorPage />,
}

export default function Settings() {
  const page = useUiStore((s) => s.settingsPage)
  const setPage = useUiStore((s) => s.setSettingsPage)
  const current = [...PAGES, CREATOR_PAGE].find((p) => p.id === page) ?? PAGES[0]

  const item = (p: typeof CREATOR_PAGE) => {
    const Icon = p.icon
    return (
      <button
        key={p.id}
        onClick={() => setPage(p.id)}
        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-left
          ${page === p.id ? 'bg-[#0a84ff] text-white' : 'hover:bg-black/5'}`}
      >
        <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-white shrink-0" style={{ background: p.color }}>
          <Icon size={13} />
        </span>
        {p.label}
      </button>
    )
  }

  return (
    <div className="w-full h-full flex bg-[#f5f5f7]/95 backdrop-blur-2xl text-neutral-900">
      <aside className="w-[220px] shrink-0 bg-[#e8e8ed]/70 border-r border-black/5 pt-12 px-2.5 flex flex-col gap-0.5">
        {PAGES.map(item)}
        <div className="my-2 h-px bg-black/10" />
        {item(CREATOR_PAGE)}
      </aside>

      <main className="flex-1 overflow-y-auto pt-12 px-8 pb-8">
        {current.id !== 'creator' && <h1 className="text-[22px] font-bold mb-4">{current.label}</h1>}
        {RENDER[current.id]()}
      </main>
    </div>
  )
}