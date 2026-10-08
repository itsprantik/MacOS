import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFsStore, childrenOf, pathOf, PROTECTED, type FsNode } from '../../core/store/fsStore'
import { useSystemStore } from '../../core/store/systemStore'
import { useWindowStore } from '../../core/store/windowStore'
import { apps } from '../../core/appRegistry'
import { creator } from '../../config/creator'
import { gitGroups, gitWorkflow, basicGroups } from './data'

const GREEN = 'text-[#5af78e]'
const BLUE = 'text-[#6ab7ff]'
const YELLOW = 'text-[#f3f99d]'

const Row = ({ name, desc }: { name: string; desc: ReactNode }) => (
  <div className="flex gap-3">
    <span className={`w-[230px] shrink-0 whitespace-pre ${GREEN}`}>{name}</span>
    <span className="text-neutral-300">{desc}</span>
  </div>
)

const Cmd = ({ children }: { children: ReactNode }) => <span className={GREEN}>{children}</span>

/* ---------- output blocks ---------- */

const Help = () => (
  <div className="flex flex-col">
    <div className={`${YELLOW} font-semibold mb-1`}>Commands in this terminal</div>
    <Row name="git" desc="List every Git command (try: git commit)" />
    <Row name="git workflow" desc="The everyday Git routine, step by step" />
    <Row name="basics" desc="Beginner cheat sheet for the command line" />
    <Row name="ls, cd, pwd" desc="Look around the virtual file system" />
    <Row name="mkdir, touch, rm" desc="Create and delete folders and files" />
    <Row name={'cat, echo "hi" > file'} desc="Read and write files" />
    <Row name="open <app>" desc="Launch an app, e.g. open music" />
    <Row name="neofetch" desc="System info" />
    <Row name="about, github" desc="About the creator" />
    <Row name="history, clear" desc="Previous commands / clear the screen" />
  </div>
)

const GitList = () => (
  <div className="flex flex-col">
    <div className="text-neutral-400 mb-2">
      Git commands for beginners. Type <Cmd>git &lt;command&gt;</Cmd> for details, e.g. <Cmd>git commit</Cmd>.
    </div>
    {gitGroups.map((g) => (
      <div key={g.title} className="mb-3">
        <div className={`${YELLOW} font-semibold`}>{g.title}</div>
        {g.items.map((c) => (
          <Row key={c.name} name={`git ${c.name}`} desc={c.summary} />
        ))}
      </div>
    ))}
    <div className="text-neutral-400">
      New to Git? Type <Cmd>git workflow</Cmd> to see how the commands fit together.
    </div>
  </div>
)

const GitWorkflow = () => (
  <div className="flex flex-col">
    <div className={`${YELLOW} font-semibold mb-1`}>The everyday Git routine</div>
    {gitWorkflow.map(([c, d], i) => (
      <Row key={i} name={`${i + 1}. ${c}`} desc={d} />
    ))}
    <div className="mt-2 text-neutral-400">
      Tip: list files you never want to commit (like node_modules/ or .env) in a file named <Cmd>.gitignore</Cmd>.
    </div>
    <div className="text-neutral-400">Install Git from git-scm.com, then run these in your own terminal.</div>
  </div>
)

function GitDetail({ name, extra }: { name: string; extra: boolean }) {
  const cmd = gitGroups.flatMap((g) => g.items).find((c) => c.name === name)
  if (!cmd) {
    return (
      <div className="text-red-400">
        git: '{name}' is not covered here. Type <Cmd>git</Cmd> to see the list.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1">
      <div>
        <span className={`${GREEN} font-semibold`}>git {cmd.name}</span>
        <span className="text-neutral-300"> — {cmd.summary}</span>
      </div>
      <div className="mt-1 text-neutral-400">Usage</div>
      <div className="pl-3 text-white">{cmd.usage}</div>
      <div className="mt-1 text-neutral-400">Examples</div>
      {cmd.examples.map(([c, d]) => (
        <div key={c} className="pl-3">
          <div className="text-white">$ {c}</div>
          <div className="pl-3 text-neutral-400"># {d}</div>
        </div>
      ))}
      {cmd.warn && <div className="mt-1 text-[#ff9f43]">⚠ {cmd.warn}</div>}
      {extra && (
        <div className="mt-1 text-neutral-500">
          This is a practice terminal. It explains Git commands but does not run Git.
        </div>
      )}
    </div>
  )
}

const Basics = () => (
  <div className="flex flex-col gap-3">
    <div className="text-neutral-400">
      Commands marked <span className={GREEN}>✓</span> also work in this terminal.
    </div>
    {basicGroups.map((g) => (
      <div key={g.title}>
        <div className={`${YELLOW} font-semibold`}>{g.title}</div>
        {g.items.map(([c, d, live]) => (
          <Row key={c} name={`${live ? '✓ ' : '  '}${c}`} desc={d} />
        ))}
      </div>
    ))}
  </div>
)

const Err = ({ children }: { children: ReactNode }) => <span className="text-red-400">{children}</span>

/* ---------- helpers ---------- */

function tokenize(s: string) {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

function resolve(nodes: Record<string, FsNode>, cwd: string, path: string): FsNode | null {
  const parts = path.split('/').filter(Boolean)
  let cur = cwd

  if (path.startsWith('~')) {
    cur = 'home'
    parts.shift()
  } else if (path.startsWith('/')) {
    const first = parts.shift()
    if (!first) cur = 'home'
    else if (first.toLowerCase() === 'applications') cur = 'applications'
    else return null
  }

  let node: FsNode | null = nodes[cur] ?? null
  for (const part of parts) {
    if (!node || node.kind !== 'folder') return null
    if (part === '.') continue
    if (part === '..') {
      node = node.parent ? nodes[node.parent] : node
      continue
    }
    const kids = childrenOf(nodes, node.id)
    node = kids.find((k) => k.name === part) ?? kids.find((k) => k.name.toLowerCase() === part.toLowerCase()) ?? null
  }
  return node
}

/* ---------- terminal ---------- */

export default function Terminal() {
  const userName = useSystemStore((s) => s.userName)
  const openApp = useWindowStore((s) => s.openApp)
  const nodes = useFsStore((s) => s.nodes)

  const user = userName.toLowerCase().replace(/\s+/g, '') || 'user'
  const [cwd, setCwd] = useState('home')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState<number | null>(null)
  const idRef = useRef(1)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [lines, setLines] = useState<{ id: number; node: ReactNode }[]>([
    {
      id: 0,
      node: (
        <div>
          <div className={`${GREEN} font-semibold`}>WebOS Terminal</div>
          <div className="text-neutral-400">
            A practice terminal. Type <Cmd>help</Cmd>, <Cmd>git</Cmd> or <Cmd>basics</Cmd> to get started.
          </div>
        </div>
      ),
    },
  ])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  const push = (node: ReactNode) => setLines((l) => [...l, { id: idRef.current++, node }])

  const safeCwd = nodes[cwd] ? cwd : 'home'
  const cwdName = safeCwd === 'home' ? '~' : nodes[safeCwd].name

  const prompt = (
    <span>
      <span className={GREEN}>{user}@webos</span> <span className={BLUE}>{cwdName}</span>{' '}
      <span className="text-neutral-400">%</span>{' '}
    </span>
  )

  const run = (raw: string): ReactNode | 'CLEAR' | null => {
    const tokens = tokenize(raw)
    if (!tokens.length) return null
    const [cmd, ...args] = tokens
    const fs = useFsStore.getState()
    const here = fs.nodes[safeCwd]
    const writable = !here.special

    switch (cmd) {
      case 'help':
        return <Help />
      case 'clear':
        return 'CLEAR'
      case 'pwd':
        return pathOf(fs.nodes, safeCwd)
      case 'whoami':
        return user
      case 'date':
        return new Date().toString()
      case 'basics':
        return <Basics />
      case 'history':
        return (
          <div>
            {[...history, raw].map((h, i) => (
              <div key={i}><span className="text-neutral-500">{String(i + 1).padStart(3, ' ')}  </span>{h}</div>
            ))}
          </div>
        )

      case 'ls': {
        const target = args.find((a) => !a.startsWith('-'))
        const node = target ? resolve(fs.nodes, safeCwd, target) : here
        if (!node) return <Err>ls: {target}: No such file or directory</Err>
        if (node.kind !== 'folder') return node.name
        const list = childrenOf(fs.nodes, node.id)
        if (!list.length) return null
        return (
          <div className="flex flex-wrap gap-x-5 gap-y-0.5">
            {list.map((n) => (
              <span
                key={n.id}
                className={n.kind === 'folder' ? `${BLUE} font-semibold` : n.kind === 'app' ? GREEN : 'text-neutral-200'}
              >
                {n.name}
              </span>
            ))}
          </div>
        )
      }

      case 'cd': {
        const target = args[0] ?? '~'
        const node = resolve(fs.nodes, safeCwd, target)
        if (!node) return <Err>cd: no such file or directory: {target}</Err>
        if (node.kind !== 'folder') return <Err>cd: not a directory: {target}</Err>
        setCwd(node.id)
        return null
      }

      case 'mkdir': {
        if (!args.length) return <Err>mkdir: missing folder name</Err>
        const errs: ReactNode[] = []
        for (const a of args) {
          if (a.startsWith('-')) continue
          if (!writable) errs.push(<div key={a}><Err>mkdir: {a}: Operation not permitted here</Err></div>)
          else if (a.includes('/')) errs.push(<div key={a}><Err>mkdir: {a}: use a simple name (no slashes)</Err></div>)
          else if (childrenOf(fs.nodes, safeCwd).some((k) => k.name === a)) errs.push(<div key={a}><Err>mkdir: {a}: File exists</Err></div>)
          else fs.createFolder(safeCwd, a)
        }
        return errs.length ? <div>{errs}</div> : null
      }

      case 'touch': {
        if (!args.length) return <Err>touch: missing file name</Err>
        if (!writable) return <Err>touch: Operation not permitted here</Err>
        for (const a of args) {
          if (!childrenOf(fs.nodes, safeCwd).some((k) => k.name === a)) fs.createFile(safeCwd, a, '')
        }
        return null
      }

      case 'cat': {
        if (!args[0]) return <Err>cat: missing file name</Err>
        const node = resolve(fs.nodes, safeCwd, args[0])
        if (!node) return <Err>cat: {args[0]}: No such file or directory</Err>
        if (node.kind === 'folder') return <Err>cat: {args[0]}: Is a directory</Err>
        if (node.kind !== 'file') return <Err>cat: {args[0]}: binary file</Err>
        return <div className="whitespace-pre-wrap">{node.content || ''}</div>
      }

      case 'echo': {
        const redirect = tokens.findIndex((t) => t === '>' || t === '>>')
        if (redirect === -1) return args.join(' ')
        const text = tokens.slice(1, redirect).join(' ')
        const name = tokens[redirect + 1]
        if (!name) return <Err>echo: missing file name after {tokens[redirect]}</Err>
        if (!writable) return <Err>echo: {name}: Operation not permitted here</Err>
        const existing = childrenOf(fs.nodes, safeCwd).find((k) => k.name === name)
        if (existing && existing.kind !== 'file') return <Err>echo: {name}: cannot write to this item</Err>
        if (existing) {
          const old = fs.nodes[existing.id].content ?? ''
          fs.writeFile(existing.id, tokens[redirect] === '>>' ? old + text + '\n' : text + '\n')
        } else {
          fs.createFile(safeCwd, name, text + '\n')
        }
        return null
      }

      case 'rm': {
        const recursive = args.some((a) => /^-[a-z]*r[a-z]*$/i.test(a))
        const names = args.filter((a) => !a.startsWith('-'))
        if (!names.length) return <Err>rm: missing file name</Err>
        const errs: ReactNode[] = []
        for (const a of names) {
          const node = resolve(fs.nodes, safeCwd, a)
          if (!node) errs.push(<div key={a}><Err>rm: {a}: No such file or directory</Err></div>)
          else if (!fs.nodes[node.id] || PROTECTED.has(node.id)) errs.push(<div key={a}><Err>rm: {a}: Operation not permitted</Err></div>)
          else if (node.kind === 'folder' && !recursive) errs.push(<div key={a}><Err>rm: {a}: is a directory (use rm -r)</Err></div>)
          else fs.remove(node.id)
        }
        return errs.length ? <div>{errs}</div> : null
      }

      case 'open': {
        const q = args.join(' ').toLowerCase()
        if (!q) return <Err>open: which app? Try: open music</Err>
        const app = q === '.' ? apps.find((a) => a.id === 'finder') : apps.find((a) => a.id === q || a.title.toLowerCase() === q)
        if (!app) return <Err>open: no app named '{q}'</Err>
        openApp(app.id)
        return `Opening ${app.title}…`
      }

      case 'neofetch':
        return (
          <div className="flex gap-6">
            <pre className={GREEN}>{'╭────────────╮\n│            │\n│   WebOS    │\n│            │\n╰────────────╯'}</pre>
            <div>
              <div><span className={GREEN}>{user}</span>@<span className={GREEN}>webos</span></div>
              <div className="text-neutral-500">──────────</div>
              <div><span className={BLUE}>OS</span>: WebOS 1.0</div>
              <div><span className={BLUE}>Shell</span>: webos-term</div>
              <div><span className={BLUE}>Screen</span>: {window.innerWidth}×{window.innerHeight}</div>
              <div><span className={BLUE}>Apps</span>: {apps.length}</div>
              <div><span className={BLUE}>Creator</span>: {creator.name}</div>
            </div>
          </div>
        )

      case 'about':
        return (
          <div>
            <div className="font-semibold text-white">{creator.name}</div>
            <div className="text-neutral-300">{creator.tagline}</div>
            <div className="text-neutral-400 mt-1">Type <Cmd>github</Cmd> for the profile link, or open Settings → About the Creator.</div>
          </div>
        )

      case 'github':
        if (!creator.githubUsername || creator.githubUsername === 'your-github-username') {
          return <span className="text-neutral-400">Set githubUsername in src/config/creator.ts</span>
        }
        return (
          <a
            href={`https://github.com/${creator.githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#6ab7ff] underline"
          >
            github.com/{creator.githubUsername}
          </a>
        )

      case 'git': {
        const sub = args[0]
        if (!sub || sub === 'help' || sub === 'commands' || sub === 'list') return <GitList />
        if (sub === 'workflow') return <GitWorkflow />
        if (sub === '--version' || sub === 'version') {
          return <span className="text-neutral-400">Git is not installed in this practice terminal. Get it at git-scm.com</span>
        }
        return <GitDetail name={sub} extra={args.length > 1} />
      }

      default:
        return (
          <Err>
            zsh: command not found: {cmd}. Type <Cmd>help</Cmd> for commands.
          </Err>
        )
    }
  }

  const submit = () => {
    const raw = input
    push(<div>{prompt}{raw}</div>)
    setInput('')
    setHIdx(null)
    if (raw.trim()) setHistory((h) => [...h, raw])
    const res = run(raw)
    if (res === 'CLEAR') setLines([])
    else if (res !== null) push(res)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const i = hIdx === null ? history.length - 1 : Math.max(0, hIdx - 1)
      setHIdx(i)
      setInput(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx === null) return
      const i = hIdx + 1
      if (i >= history.length) {
        setHIdx(null)
        setInput('')
      } else {
        setHIdx(i)
        setInput(history[i])
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setLines([])
    }
  }

  return (
    <div
      className="w-full h-full bg-[#0c0c0f]/85 backdrop-blur-2xl text-[13px] leading-[1.45] text-neutral-200 font-mono pt-10 px-4 pb-3 overflow-y-auto"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus()
      }}
    >
      {lines.map((l) => (
        <div key={l.id} className="mb-1.5 whitespace-pre-wrap break-words">{l.node}</div>
      ))}

      <div className="flex items-center">
        {prompt}
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="flex-1 bg-transparent outline-none caret-[#5af78e] text-white"
        />
      </div>
      <div ref={endRef} />
    </div>
  )
}                              