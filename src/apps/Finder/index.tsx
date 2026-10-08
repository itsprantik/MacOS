import { useMemo, useRef, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Folder, FolderPlus, FileText, Trash2, LayoutGrid, List,
  Search, House, Monitor, Download, Music2, Image as ImageIcon, AppWindow, X,
} from 'lucide-react'
import { useFsStore, childrenOf, pathOf, PROTECTED, type FsNode } from '../../core/store/fsStore'
import { useSystemStore } from '../../core/store/systemStore'
import { useWindowStore } from '../../core/store/windowStore'
import { useMusicStore } from '../../core/store/musicStore'
import { useUiStore } from '../../core/store/uiStore'

const SIDEBAR = [
  { id: 'home', icon: House },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'downloads', label: 'Downloads', icon: Download },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'pictures', label: 'Pictures', icon: ImageIcon },
  { id: 'applications', label: 'Applications', icon: AppWindow },
]

const kindLabel = (n: FsNode) =>
  n.kind === 'folder' ? 'Folder' : n.kind === 'audio' ? 'MP3 Audio' : n.kind === 'app' ? 'Application' : 'Text Document'

function AppIcon({ src, size }: { src?: string; size: number }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <AppWindow size={size} color="#8e8e93" strokeWidth={1.3} />
  return (
    <img src={src} alt="" draggable={false} onError={() => setFailed(true)} style={{ width: size, height: size }} />
  )
}

function ItemIcon({ node, size }: { node: FsNode; size: number }) {
  if (node.kind === 'folder') return <Folder size={size} fill="#5ac8fa" color="#3aa8e0" strokeWidth={1.2} />
  if (node.kind === 'audio') return <Music2 size={size} color="#fa233b" strokeWidth={1.4} />
  if (node.kind === 'app') return <AppIcon src={node.icon} size={size} />
  return <FileText size={size} color="#8e8e93" strokeWidth={1.3} />
}

function NameEdit({ initial, onDone }: { initial: string; onDone: (name?: string) => void }) {
  const done = useRef(false)
  const finish = (v?: string) => {
    if (done.current) return
    done.current = true
    onDone(v)
  }
  return (
    <input
      autoFocus
      defaultValue={initial}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={(e) => finish(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') finish()
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="w-full text-[12px] text-center rounded bg-white border border-[#0a84ff] outline-none px-1"
    />
  )
}

export default function Finder() {
  const nodes = useFsStore((s) => s.nodes)
  const userName = useSystemStore((s) => s.userName)
  const openApp = useWindowStore((s) => s.openApp)
  const openMenu = useUiStore((s) => s.openMenu)
  const { createFolder, rename, remove } = useFsStore.getState()

  const [history, setHistory] = useState<string[]>(['home'])
  const [idx, setIdx] = useState(0)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<FsNode | null>(null)

  const cur = nodes[history[idx]] ? history[idx] : 'home'
  const curNode = nodes[cur]
  const writable = !curNode.special

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return childrenOf(nodes, cur).filter((n) => !q || n.name.toLowerCase().includes(q))
  }, [nodes, cur, query])

  const go = (id: string) => {
    setHistory((h) => [...h.slice(0, idx + 1), id])
    setIdx((i) => i + 1)
    setSelected(null)
    setQuery('')
  }

  const open = (n: FsNode) => {
    if (n.kind === 'folder') go(n.id)
    else if (n.kind === 'audio') {
      if (useMusicStore.getState().currentIndex !== n.trackIndex) useMusicStore.getState().playIndex(n.trackIndex!)
      openApp('music')
    } else if (n.kind === 'app') openApp(n.appId!)
    else setPreview(n)
  }

  const newFolder = () => {
    if (!writable) return
    const id = createFolder(cur, 'untitled folder')
    setSelected(id)
    setRenaming(id)
  }

  const canDelete = (id: string | null) => !!id && !!nodes[id] && !PROTECTED.has(id)
  const del = (id: string) => {
    remove(id)
    setSelected(null)
  }

  const itemMenu = (e: React.MouseEvent, n: FsNode) => {
    e.preventDefault()
    e.stopPropagation()
    setSelected(n.id)
    const real = !!nodes[n.id] && !PROTECTED.has(n.id)
    openMenu(e.clientX, e.clientY, [
      { label: 'Open', onClick: () => open(n) },
      { divider: true },
      { label: 'Rename', disabled: !real, onClick: () => setRenaming(n.id) },
      { label: 'Delete', disabled: !real, onClick: () => del(n.id) },
    ])
  }

  const blankMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openMenu(e.clientX, e.clientY, [{ label: 'New Folder', disabled: !writable, onClick: newFolder }])
  }

  const finishRename = (id: string, name?: string) => {
    if (name && name.trim()) rename(id, name.trim())
    setRenaming(null)
  }

  const label = (n: FsNode) =>
    renaming === n.id ? (
      <NameEdit initial={n.name} onDone={(v) => finishRename(n.id, v)} />
    ) : (
      <span
        className={`text-[12px] text-center leading-tight line-clamp-2 px-1 rounded break-all
          ${selected === n.id ? 'bg-[#0a84ff] text-white' : ''}`}
      >
        {n.name}
      </span>
    )

  const iconBtn = 'w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className="relative w-full h-full flex bg-white/85 backdrop-blur-2xl text-neutral-900 text-[13px]">
      {/* sidebar */}
      <aside className="w-[190px] shrink-0 bg-[#e4e7ec]/60 border-r border-black/5 pt-12 px-2.5 flex flex-col gap-0.5">
        <div className="px-2 mb-1 text-[11px] font-semibold text-neutral-400">Favorites</div>
        {SIDEBAR.map(({ id, label: l, icon: Icon }) => (
          <button
            key={id}
            onClick={() => go(id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left ${cur === id ? 'bg-black/10 font-medium' : 'hover:bg-black/5'}`}
          >
            <Icon size={16} color="#0a84ff" />
            <span className="truncate">{l ?? userName}</span>
          </button>
        ))}
      </aside>

      {/* main */}
      <section className="flex-1 min-w-0 flex flex-col">
        <div className="h-[52px] shrink-0 flex items-center gap-1 px-3 border-b border-black/5">
          <button className={iconBtn} disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            <ChevronLeft size={18} />
          </button>
          <button
            className={iconBtn}
            disabled={idx >= history.length - 1}
            onClick={() => setIdx((i) => Math.min(history.length - 1, i + 1))}
          >
            <ChevronRight size={18} />
          </button>
          <div className="ml-2 font-semibold text-[14px] truncate">
            {cur === 'home' ? userName : curNode.name}
          </div>
          <div className="flex-1 self-stretch" />

          <button className={`${iconBtn} ${view === 'grid' ? 'bg-black/10' : ''}`} onClick={() => setView('grid')}>
            <LayoutGrid size={15} />
          </button>
          <button className={`${iconBtn} ${view === 'list' ? 'bg-black/10' : ''}`} onClick={() => setView('list')}>
            <List size={15} />
          </button>
          <button className={iconBtn} disabled={!writable} onClick={newFolder} title="New Folder">
            <FolderPlus size={16} />
          </button>
          <button
            className={iconBtn}
            disabled={!canDelete(selected)}
            onClick={() => selected && del(selected)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <div className="relative ml-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-[130px] rounded-md bg-black/[0.06] pl-6 pr-2 py-1 text-[12px] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto" onClick={() => setSelected(null)} onContextMenu={blankMenu}>
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-400">
              {query ? 'No results' : 'This folder is empty'}
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1 p-4">
              {items.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => { e.stopPropagation(); setSelected(n.id) }}
                  onDoubleClick={() => open(n)}
                  onContextMenu={(e) => itemMenu(e, n)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg"
                >
                  <div className={`p-1 rounded-lg ${selected === n.id ? 'bg-black/10' : ''}`}>
                    <ItemIcon node={n} size={52} />
                  </div>
                  {label(n)}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {items.map((n, row) => (
                <div
                  key={n.id}
                  onClick={(e) => { e.stopPropagation(); setSelected(n.id) }}
                  onDoubleClick={() => open(n)}
                  onContextMenu={(e) => itemMenu(e, n)}
                  className={`grid grid-cols-[1fr_140px] items-center px-2 py-1 rounded-md
                    ${selected === n.id ? 'bg-[#0a84ff] text-white' : row % 2 === 0 ? 'bg-black/[0.035]' : ''}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ItemIcon node={n} size={18} />
                    {renaming === n.id ? (
                      <NameEdit initial={n.name} onDone={(v) => finishRename(n.id, v)} />
                    ) : (
                      <span className="truncate">{n.name}</span>
                    )}
                  </div>
                  <span className={selected === n.id ? 'text-white/80' : 'text-neutral-500'}>{kindLabel(n)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 shrink-0 border-t border-black/5 text-[11px] text-neutral-500 flex items-center justify-center">
          {items.length} items · {pathOf(nodes, cur)}
        </div>
      </section>

      {/* text file preview */}
      {preview && (
        <div
          className="absolute inset-0 z-30 bg-black/30 flex items-center justify-center p-8"
          onMouseDown={() => setPreview(null)}
        >
          <div
            className="w-full max-w-[560px] max-h-full flex flex-col rounded-2xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <span className="font-semibold">{preview.name}</span>
              <button onClick={() => setPreview(null)}><X size={16} /></button>
            </div>
            <pre className="p-4 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed font-mono">
              {nodes[preview.id]?.content || '(empty)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}