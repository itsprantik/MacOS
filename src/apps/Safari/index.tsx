import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ExternalLink,
  Search,
} from 'lucide-react'

import { GOOGLE_CSE_ID } from '../../config/keys'

type Entry =
  | { kind: 'start' }
  | { kind: 'results'; q: string }
  | { kind: 'page'; url: string }

const FAVORITES = [
  {
    name: 'Google',
    url: 'https://www.google.com',
    color: '#4285f4',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    color: '#ff0000',
  },
  {
    name: 'Gmail',
    url: 'https://mail.google.com',
    color: '#ea4335',
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    color: '#24292f',
  },
  {
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    color: '#636466',
  },
  {
    name: 'Google News',
    url: 'https://news.google.com',
    color: '#1a73e8',
  },
]

const looksLikeUrl = (t: string) =>
  /^https?:\/\//i.test(t) ||
  (!/\s/.test(t) &&
    /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(t))

const normalize = (t: string) =>
  /^https?:\/\//i.test(t)
    ? t
    : `https://${t}`

const googleUrl = (q: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(q)}`

const wikiSearchUrl = (q: string) =>
  `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`

const external = (url: string) => {
  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  )
}

// -----------------------------------------------------------------------------
// Google CSE
// -----------------------------------------------------------------------------

let cseReady: Promise<void> | null = null

function loadCse(cx: string) {
  if (cseReady) return cseReady

  cseReady = new Promise<void>((resolve) => {
    ;(window as any).__gcse = {
      parsetags: 'explicit',
      callback: () => resolve(),
    }

    const existing = document.querySelector(
      'script[data-webos-google-cse]'
    )

    if (existing) {
      resolve()
      return
    }

    const s = document.createElement('script')

    s.async = true
    s.dataset.webosGoogleCse = 'true'

    s.src = `https://cse.google.com/cse.js?cx=${cx}`

    document.head.appendChild(s)
  })

  return cseReady
}

// -----------------------------------------------------------------------------
// Google logo
// -----------------------------------------------------------------------------

const Wordmark = () => (
  <div className="text-[64px] font-medium tracking-tight select-none">
    {[
      ['G', '#4285f4'],
      ['o', '#ea4335'],
      ['o', '#fbbc05'],
      ['g', '#4285f4'],
      ['l', '#34a853'],
      ['e', '#ea4335'],
    ].map(([ch, color], i) => (
      <span
        key={i}
        style={{ color }}
      >
        {ch}
      </span>
    ))}
  </div>
)

// -----------------------------------------------------------------------------
// Safari
// -----------------------------------------------------------------------------

export default function Safari() {
  const [hist, setHist] = useState<Entry[]>([
    { kind: 'start' },
  ])

  const [idx, setIdx] = useState(0)

  const [addr, setAddr] = useState('')

  const [startQ, setStartQ] = useState('')

  const [reload, setReload] = useState(0)

  const [loading, setLoading] = useState(false)

  const browserAreaRef =
    useRef<HTMLDivElement | null>(null)

  const entry = hist[idx]

  /*
   * Electron API.
   *
   * Using `as any` here keeps this file working even if
   * you haven't added electron.d.ts yet.
   */
  const electronAPI = (
    window as any
  ).electronAPI

  const isElectron =
    typeof window !== 'undefined' &&
    !!electronAPI?.isElectron

  // ---------------------------------------------------------------------------
  // Navigation history
  // ---------------------------------------------------------------------------

  const go = (e: Entry) => {
    setHist((h) => [
      ...h.slice(0, idx + 1),
      e,
    ])

    setIdx((i) => i + 1)
  }

  const submit = (text: string) => {
    const t = text.trim()

    if (!t) return

    if (looksLikeUrl(t)) {
      go({
        kind: 'page',
        url: normalize(t),
      })
    } else if (isElectron) {
      go({
        kind: 'page',
        url: googleUrl(t),
      })
    } else {
      go({
        kind: 'results',
        q: t,
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Keep address bar synchronized
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (entry.kind === 'page') {
      setAddr(entry.url)
      setLoading(true)
    } else if (entry.kind === 'results') {
      setAddr(entry.q)
      setLoading(false)
    } else {
      setAddr('')
      setLoading(false)
    }
  }, [entry])

  // ---------------------------------------------------------------------------
  // Tell Electron to navigate when the React page changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isElectron) return

    if (entry.kind !== 'page') {
      electronAPI?.browser?.hide?.()
      return
    }

    electronAPI?.browser
      ?.navigate?.(entry.url)
      ?.then((result: any) => {
        if (!result?.success) {
          console.error(
            'Electron browser navigation failed:',
            result?.error
          )
        }
      })
  }, [
    entry,
    isElectron,
    electronAPI,
  ])

  // ---------------------------------------------------------------------------
  // Resize Electron WebContentsView
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isElectron) return

    if (entry.kind !== 'page') {
      electronAPI?.browser?.hide?.()
      return
    }

    const updateBounds = () => {
      const element =
        browserAreaRef.current

      if (!element) return

      const rect =
        element.getBoundingClientRect()

      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return
      }

      electronAPI?.browser?.setBounds?.({
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    }

    const update = () => {
      requestAnimationFrame(
        updateBounds
      )
    }

    update()

    const observer =
      new ResizeObserver(update)

    if (browserAreaRef.current) {
      observer.observe(
        browserAreaRef.current
      )
    }

    window.addEventListener(
      'resize',
      update
    )

    return () => {
      observer.disconnect()

      window.removeEventListener(
        'resize',
        update
      )
    }
  }, [
    entry,
    isElectron,
    electronAPI,
  ])

  // ---------------------------------------------------------------------------
  // Listen to Electron browser URL changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isElectron) return

    const onUrl = (url: string) => {
      if (!url) return

      setAddr(url)
    }

    const onLoading = (
      value: boolean
    ) => {
      setLoading(value)
    }

    electronAPI?.onBrowserUrl?.(onUrl)

    electronAPI?.onBrowserLoading?.(
      onLoading
    )

  }, [
    isElectron,
    electronAPI,
  ])

  // ---------------------------------------------------------------------------
  // Google CSE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      entry.kind !== 'results' ||
      !GOOGLE_CSE_ID
    ) {
      return
    }

    let cancelled = false

    loadCse(GOOGLE_CSE_ID).then(() => {
      if (cancelled) return

      const api =
        (window as any).google
          ?.search
          ?.cse
          ?.element

      if (!api) {
        console.warn(
          'Google CSE API not available'
        )

        return
      }

      let el =
        api.getElement('webos')

      if (!el) {
        api.render({
          div: 'safari-cse',
          tag: 'searchresults-only',
          gname: 'webos',
          attributes: {
            linkTarget: '_self',
          },
        })

        el =
          api.getElement('webos')
      }

      el?.execute(entry.q)
    })

    return () => {
      cancelled = true
    }
  }, [entry, reload])

  // ---------------------------------------------------------------------------
  // Google search result click
  // ---------------------------------------------------------------------------

  const onResultsClick = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    const target =
      e.target as HTMLElement

    const a =
      target.closest('a')

    if (!a) return

    const href =
      a.getAttribute(
        'data-ctorig'
      ) ||
      a.getAttribute('href') ||
      ''

    /*
     * Ignore Google's internal pagination/buttons.
     */
    if (
      !/^https?:\/\//i.test(href)
    ) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    /*
     * Open the selected result inside
     * our Safari page.
     */
    go({
      kind: 'page',
      url: href,
    })
  }

  // ---------------------------------------------------------------------------
  // Back
  // ---------------------------------------------------------------------------

  const handleBack = async () => {
    if (isElectron && entry.kind === 'page') {
      const result =
        await electronAPI?.browser?.back?.()

      /*
       * If Electron had no browser history,
       * fall back to React history.
       */
      if (result) return
    }

    setIdx((i) =>
      Math.max(0, i - 1)
    )
  }

  // ---------------------------------------------------------------------------
  // Forward
  // ---------------------------------------------------------------------------

  const handleForward = async () => {
    if (isElectron && entry.kind === 'page') {
      const result =
        await electronAPI?.browser?.forward?.()

      if (result) return
    }

    setIdx((i) =>
      Math.min(
        hist.length - 1,
        i + 1
      )
    )
  }

  // ---------------------------------------------------------------------------
  // Reload
  // ---------------------------------------------------------------------------

  const handleReload = async () => {
    if (entry.kind === 'start') {
      return
    }

    setLoading(true)

    if (isElectron && entry.kind === 'page') {
      await electronAPI?.browser?.reload?.()
      return
    }

    setReload((n) => n + 1)
  }

  // ---------------------------------------------------------------------------
  // External target
  // ---------------------------------------------------------------------------

  const externalTarget =
    entry.kind === 'page'
      ? entry.url
      : entry.kind === 'results'
        ? googleUrl(entry.q)
        : 'https://www.google.com'

  // ---------------------------------------------------------------------------
  // Button styling
  // ---------------------------------------------------------------------------

  const navBtn =
    'w-7 h-7 rounded-md flex items-center justify-center ' +
    'hover:bg-black/10 dark:hover:bg-white/15 ' +
    'disabled:opacity-30 disabled:hover:bg-transparent'

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e20]">

      {/* ================================================================ */}
      {/* Safari toolbar                                                    */}
      {/* ================================================================ */}

      <div
        className="
          relative
          shrink-0
          h-[52px]
          flex
          items-center
          gap-1.5
          pl-[84px]
          pr-3
          bg-[#f4f4f5]
          dark:bg-[#2a2a2d]
          border-b
          border-black/10
          dark:border-white/10
          text-neutral-700
          dark:text-neutral-200
        "
      >

        {/* Back */}

        <button
          className={navBtn}
          disabled={
            !isElectron &&
            idx === 0
          }
          title="Back"
          onClick={handleBack}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Forward */}

        <button
          className={navBtn}
          disabled={
            !isElectron &&
            idx >= hist.length - 1
          }
          title="Forward"
          onClick={handleForward}
        >
          <ChevronRight size={18} />
        </button>

        {/* Address bar */}

        <div className="relative flex-1 max-w-[640px] mx-auto">

          <Search
            size={13}
            className="
              absolute
              left-2.5
              top-1/2
              -translate-y-1/2
              text-neutral-400
            "
          />

          <input
            value={addr}
            onChange={(e) =>
              setAddr(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submit(addr)
              }
            }}
            onFocus={(e) =>
              e.currentTarget.select()
            }
            placeholder="Search Google or enter website name"
            spellCheck={false}
            className="
              w-full
              h-8
              rounded-lg
              bg-black/[0.06]
              dark:bg-white/10
              pl-8
              pr-3
              text-[13px]
              outline-none
              focus:bg-white
              dark:focus:bg-black/40
              focus:ring-2
              focus:ring-[#0a84ff]/60
            "
          />
        </div>

        {/* Reload */}

        <button
          className={navBtn}
          title="Reload"
          disabled={
            entry.kind === 'start'
          }
          onClick={handleReload}
        >
          <RotateCw
            size={15}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />
        </button>

        {/* Open externally */}

        <button
          className={navBtn}
          title="Open in external browser"
          onClick={() =>
            external(externalTarget)
          }
        >
          <ExternalLink size={15} />
        </button>

        {/* Loading line */}

        {loading && (
          <div
            className="
              absolute
              bottom-0
              left-0
              h-[2px]
              w-1/3
              bg-[#0a84ff]
              animate-pulse
            "
          />
        )}
      </div>

      {/* ================================================================ */}
      {/* Content                                                           */}
      {/* ================================================================ */}

      <div className="relative flex-1 min-h-0">

        {/* ============================================================ */}
        {/* Start page                                                     */}
        {/* ============================================================ */}

        {entry.kind === 'start' && (
          <div
            className="
              absolute
              inset-0
              overflow-auto
              flex
              flex-col
              items-center
              pt-[8vh]
              px-6
              bg-white
              dark:bg-[#1e1e20]
              text-neutral-800
              dark:text-neutral-200
            "
          >

            <Wordmark />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(startQ)
              }}
              className="
                mt-6
                w-full
                max-w-[560px]
                relative
              "
            >
              <Search
                size={16}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-neutral-400
                "
              />

              <input
                autoFocus
                value={startQ}
                onChange={(e) =>
                  setStartQ(
                    e.target.value
                  )
                }
                placeholder="Search Google or type a URL"
                className="
                  w-full
                  h-11
                  rounded-full
                  border
                  border-neutral-300
                  dark:border-white/20
                  bg-white
                  dark:bg-white/5
                  pl-11
                  pr-4
                  text-[15px]
                  outline-none
                  shadow-sm
                  hover:shadow-md
                  focus:shadow-md
                "
              />
            </form>

            <div
              className="
                mt-12
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-neutral-400
              "
            >
              Favorites
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-6
                gap-5
              "
            >
              {FAVORITES.map((f) => (
                <button
                  key={f.name}
                  onClick={() =>
                    go({
                      kind: 'page',
                      url: f.url,
                    })
                  }
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1.5
                    w-[84px]
                  "
                >
                  <span
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      text-white
                      text-[22px]
                      font-semibold
                      shadow
                    "
                    style={{
                      background:
                        f.color,
                    }}
                  >
                    {f.name[0]}
                  </span>

                  <span
                    className="
                      text-[12px]
                      truncate
                      w-full
                      text-center
                    "
                  >
                    {f.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* Electron browser                                                */}
        {/* ============================================================ */}

        {entry.kind === 'page' && (
          <>
            {isElectron ? (
              /*
               * IMPORTANT:
               *
               * This div itself doesn't display the webpage.
               *
               * Electron's native WebContentsView is positioned
               * over this exact rectangle from main.cjs.
               */
              <div
                ref={browserAreaRef}
                id="electron-browser-area"
                className="
                  absolute
                  inset-0
                  bg-white
                "
              />
            ) : (
              /*
               * Chrome/Vite fallback.
               */
              <iframe
                key={`${entry.url}-${reload}`}
                src={entry.url}
                title="page"
                referrerPolicy="no-referrer"
                onLoad={() =>
                  setLoading(false)
                }
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  border-0
                  bg-white
                "
              />
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* Search result fallback when CSE isn't configured               */}
        {/* ============================================================ */}

        {entry.kind === 'results' &&
          !GOOGLE_CSE_ID && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-white
                dark:bg-[#1e1e20]
                p-8
              "
            >
              <div
                className="
                  max-w-[460px]
                  text-center
                  text-neutral-700
                  dark:text-neutral-200
                "
              >
                <div className="text-[18px] font-semibold">
                  Search “{entry.q}”
                </div>

                <p
                  className="
                    mt-2
                    text-[13px]
                    text-neutral-500
                  "
                >
                  To show Google results
                  inside this window, add
                  <code>
                    VITE_GOOGLE_CSE_ID
                  </code>
                  to
                  <code>
                    .env.local
                  </code>
                  and restart
                  <code>
                    npm run dev
                  </code>
                  .
                </p>

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >
                  <button
                    onClick={() =>
                      go({
                        kind: 'page',
                        url: wikiSearchUrl(
                          entry.q
                        ),
                      })
                    }
                    className="
                      px-5
                      py-2
                      rounded-full
                      bg-[#0a84ff]
                      text-white
                      text-[13px]
                      font-medium
                    "
                  >
                    Search Wikipedia here
                  </button>

                  <button
                    onClick={() =>
                      isElectron
                        ? go({
                            kind: 'page',
                            url: googleUrl(
                              entry.q
                            ),
                          })
                        : external(
                            googleUrl(
                              entry.q
                            )
                          )
                    }
                    className="
                      px-5
                      py-2
                      rounded-full
                      bg-[#4285f4]
                      text-white
                      text-[13px]
                      font-medium
                    "
                  >
                    Search on Google
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* ============================================================ */}
        {/* Google CSE container                                           */}
        {/* ============================================================ */}

        <div
          id="safari-cse"
          onClickCapture={
            onResultsClick
          }
          className={`
            absolute
            inset-0
            overflow-auto
            p-4
            bg-white
            ${
              entry.kind === 'results' &&
              GOOGLE_CSE_ID
                ? ''
                : 'hidden'
            }
          `}
        />
      </div>
    </div>
  )
}
