import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tracks } from '../../apps/Music/tracks'
import { apps } from '../appRegistry'

export type NodeKind = 'folder' | 'file' | 'audio' | 'app'

export interface FsNode {
  id: string
  name: string
  kind: NodeKind
  parent: string | null
  content?: string
  special?: 'music' | 'apps' // folders whose contents are generated
  trackIndex?: number
  appId?: string
  icon?: string
}

export const PROTECTED = new Set([
  'home', 'desktop', 'documents', 'downloads', 'music', 'pictures', 'applications',
])

function seed(): Record<string, FsNode> {
  const n: Record<string, FsNode> = {}
  const add = (
    id: string, name: string, parent: string | null,
    kind: NodeKind = 'folder', extra: Partial<FsNode> = {},
  ) => {
    n[id] = { id, name, kind, parent, ...extra }
  }

  add('home', 'Home', null)
  add('desktop', 'Desktop', 'home')
  add('documents', 'Documents', 'home')
  add('downloads', 'Downloads', 'home')
  add('music', 'Music', 'home', 'folder', { special: 'music' })
  add('pictures', 'Pictures', 'home')
  add('applications', 'Applications', null, 'folder', { special: 'apps' })

  add('welcome', 'Welcome.txt', 'documents', 'file', {
    content: [
      'Welcome to WebOS!',
      '',
      'This is your Home folder. Everything here is stored in your browser.',
      '',
      'Things to try:',
      '- Double-click a song in the Music folder to play it',
      '- Open Terminal and type: git',
      '- Right-click the desktop to edit widgets',
      '- Open Settings > About the Creator',
    ].join('\n'),
  })
  add('readme', 'Read Me.md', 'desktop', 'file', {
    content: [
      '# WebOS',
      '',
      'A macOS-style desktop that runs in your browser.',
      '',
      'Drag windows by their top bar, drag widgets to move them,',
      'and use the dock to open apps.',
    ].join('\n'),
  })
  add('git-notes', 'Git Cheatsheet.txt', 'documents', 'file', {
    content: [
      'The everyday Git routine',
      '',
      'git status              see what changed',
      'git add .               stage your changes',
      'git commit -m "msg"     save a snapshot',
      'git push                upload to GitHub',
      '',
      'Open the Terminal app and type "git" for the full list.',
    ].join('\n'),
  })
  return n
}

function uniqueName(nodes: Record<string, FsNode>, parent: string, base: string, ignoreId?: string) {
  const names = new Set(
    Object.values(nodes)
      .filter((x) => x.parent === parent && x.id !== ignoreId)
      .map((x) => x.name),
  )
  if (!names.has(base)) return base
  const dot = base.lastIndexOf('.')
  const stem = dot > 0 ? base.slice(0, dot) : base
  const ext = dot > 0 ? base.slice(dot) : ''
  let i = 2
  while (names.has(`${stem} ${i}${ext}`)) i++
  return `${stem} ${i}${ext}`
}

interface FsState {
  nodes: Record<string, FsNode>
  createFolder: (parent: string, name: string) => string
  createFile: (parent: string, name: string, content?: string) => string
  writeFile: (id: string, content: string) => void
  rename: (id: string, name: string) => void
  remove: (id: string) => void
}

export const useFsStore = create<FsState>()(
  persist(
    (set) => ({
      nodes: seed(),

      createFolder: (parent, name) => {
        const id = crypto.randomUUID()
        set((s) => ({
          nodes: {
            ...s.nodes,
            [id]: { id, name: uniqueName(s.nodes, parent, name), kind: 'folder', parent },
          },
        }))
        return id
      },

      createFile: (parent, name, content = '') => {
        const id = crypto.randomUUID()
        set((s) => ({
          nodes: {
            ...s.nodes,
            [id]: { id, name: uniqueName(s.nodes, parent, name), kind: 'file', parent, content },
          },
        }))
        return id
      },

      writeFile: (id, content) =>
        set((s) => (s.nodes[id] ? { nodes: { ...s.nodes, [id]: { ...s.nodes[id], content } } } : s)),

      rename: (id, name) =>
        set((s) => {
          const node = s.nodes[id]
          if (!node || PROTECTED.has(id) || !node.parent) return s
          return {
            nodes: { ...s.nodes, [id]: { ...node, name: uniqueName(s.nodes, node.parent, name, id) } },
          }
        }),

      remove: (id) =>
        set((s) => {
          if (PROTECTED.has(id) || !s.nodes[id]) return s
          const doomed = new Set([id])
          let grew = true
          while (grew) {
            grew = false
            for (const n of Object.values(s.nodes)) {
              if (n.parent && doomed.has(n.parent) && !doomed.has(n.id)) {
                doomed.add(n.id)
                grew = true
              }
            }
          }
          const nodes = { ...s.nodes }
          doomed.forEach((d) => delete nodes[d])
          return { nodes }
        }),
    }),
    { name: 'webos-fs', version: 1, partialize: (s) => ({ nodes: s.nodes }) },
  ),
)

export function childrenOf(nodes: Record<string, FsNode>, id: string): FsNode[] {
  const node = nodes[id]
  if (!node) return []

  if (node.special === 'music') {
    return tracks.map((t, i) => ({
      id: `track:${i}`, name: `${t.title}.mp3`, kind: 'audio' as const, parent: id, trackIndex: i,
    }))
  }
  if (node.special === 'apps') {
    return apps.map((a) => ({
      id: `app:${a.id}`, name: `${a.title}.app`, kind: 'app' as const, parent: id, appId: a.id, icon: a.icon,
    }))
  }

  return Object.values(nodes)
    .filter((n) => n.parent === id)
    .sort((a, b) =>
      a.kind === 'folder' && b.kind !== 'folder' ? -1
      : a.kind !== 'folder' && b.kind === 'folder' ? 1
      : a.name.localeCompare(b.name),
    )
}

export function pathOf(nodes: Record<string, FsNode>, id: string): string {
  const parts: string[] = []
  let cur: FsNode | undefined = nodes[id]
  while (cur) {
    parts.unshift(cur.id === 'home' ? '~' : cur.name)
    cur = cur.parent ? nodes[cur.parent] : undefined
  }
  return parts[0] === '~' ? parts.join('/') : '/' + parts.join('/')
}