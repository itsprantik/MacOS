const {
  app, BrowserWindow, WebContentsView, ipcMain, shell, protocol, net, session, screen,
} = require('electron')
const os = require('os')
const {
  app, BrowserWindow, WebContentsView, ipcMain, shell, protocol, net, session,
} = require('electron')
const path = require('path')
const { pathToFileURL } = require('url')

const DIST = path.join(__dirname, '../dist')
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
const BROWSER_PARTITION = 'persist:safari' // keeps Safari logins separate from the app

// Serve the built app from app://localhost so "/icons/x.png" style paths keep working.
// Must be registered before the app is ready.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
])

let mainWindow = null
let browserView = null

/* ---------- helpers ---------- */

const isHttp = (u) => {
  try {
    const p = new URL(u).protocol
    return p === 'http:' || p === 'https:'
  } catch {
    return false
  }
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const send = (channel, payload) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload)
}

// navigationHistory exists in newer Electron; fall back to the old methods
const hist = (wc) => wc.navigationHistory ?? wc

function sendNav() {
  if (!browserView) return
  const h = hist(browserView.webContents)
  send('browser-nav', { canGoBack: h.canGoBack(), canGoForward: h.canGoForward() })
}

function destroyBrowserView() {
  if (!browserView) return
  try { mainWindow?.contentView.removeChildView(browserView) } catch {}
  try { browserView.webContents.close() } catch {}
  browserView = null
}

function showErrorPage(wc, url, reason) {
  const html =
    '<!doctype html><meta charset="utf-8"><body style="margin:0;height:100vh;display:flex;' +
    'align-items:center;justify-content:center;font-family:-apple-system,system-ui,sans-serif;' +
    'color:#444;background:#fff"><div style="text-align:center;max-width:440px;padding:24px">' +
    "<h2>This page can't be opened</h2>" +
    `<p style="color:#888;word-break:break-all">${escapeHtml(reason)}<br>${escapeHtml(url)}</p></div></body>`
  wc.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
}

/* ---------- the embedded browser view ---------- */

function createBrowserView() {
  if (!mainWindow) return null
  if (browserView) return browserView

  const view = new WebContentsView({
    webPreferences: {
      partition: BROWSER_PARTITION,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  const wc = view.webContents

  // Look like Chrome so Google/YouTube don't treat this as an unsupported embedded app
  const ua = wc
    .getUserAgent()
    .replace(/\sElectron\/\S+/i, '')
    .replace(new RegExp(`\\s${escapeRe(app.getName())}\\/\\S+`, 'i'), '')
  wc.setUserAgent(ua)

  // target="_blank" / window.open load in the same view instead of a popup window
  wc.setWindowOpenHandler(({ url }) => {
  if (isHttp(url)) send('browser-new-tab', url)
  return { action: 'deny' }
})
wc.on('page-title-updated', (_e, title) => send('browser-title', title))
wc.on('page-favicon-updated', (_e, favicons) => {
  if (favicons && favicons[0]) send('browser-favicon', favicons[0])
})
  wc.on('did-navigate', (_e, url) => {
    if (!url.startsWith('data:')) send('browser-url', url)
    sendNav()
  })
  wc.on('did-navigate-in-page', (_e, url) => {
    send('browser-url', url)
    sendNav()
  })
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return // -3 = aborted by a newer navigation
    showErrorPage(wc, url, desc)
  })

  mainWindow.contentView.addChildView(view)
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  browserView = view
  return view
}

/* ---------- main window ---------- */

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: 'MacOS',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Links with target="_blank" and window.open go to the real browser, not a new Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isHttp(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (app.isPackaged) mainWindow.loadURL('app://localhost/index.html')
  else mainWindow.loadURL(DEV_URL)

  mainWindow.on('closed', () => {
    destroyBrowserView()
    mainWindow = null
  })
}

/* ---------- IPC ---------- */

ipcMain.handle('browser:navigate', async (_e, url) => {
  if (!isHttp(url)) return { success: false, error: 'Only http(s) addresses are supported' }
  const view = createBrowserView()
  if (!view) return { success: false, error: 'No window' }

  const wc = view.webContents
  if (wc.getURL() === url) return { success: true, url } // already there (e.g. returning from the start page)

  try {
    await wc.loadURL(url)
    return { success: true, url: wc.getURL() }
  } catch (error) {
    if (error && (error.code === 'ERR_ABORTED' || error.errno === -3)) {
      return { success: true, url: wc.getURL() }
    }
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('browser:back', () => {
  if (!browserView) return false
  const h = hist(browserView.webContents)
  if (h.canGoBack()) {
    h.goBack()
    return true
  }
  return false
})

ipcMain.handle('browser:forward', () => {
  if (!browserView) return false
  const h = hist(browserView.webContents)
  if (h.canGoForward()) {
    h.goForward()
    return true
  }
  return false
})

ipcMain.handle('browser:reload', () => {
  if (!browserView) return false
  browserView.webContents.reload()
  return true
})

ipcMain.handle('browser:set-bounds', (_e, b) => {
  const view = browserView ?? createBrowserView()
  if (!view) return false
  view.setBounds({
    x: Math.round(b.x),
    y: Math.round(b.y),
    width: Math.max(0, Math.round(b.width)),
    height: Math.max(0, Math.round(b.height)),
  })
  return true
})

ipcMain.handle('browser:hide', () => {
  if (browserView) browserView.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  return true
})

// A picture of the page, shown by React while the live view is hidden
ipcMain.handle('browser:snapshot', async () => {
  if (!browserView) return null
  try {
    const img = await browserView.webContents.capturePage()
    if (img.isEmpty()) return null
    return 'data:image/jpeg;base64,' + img.resize({ width: 1400 }).toJPEG(85).toString('base64')
  } catch {
    return null
  }
})

ipcMain.handle('browser:destroy', () => {
  destroyBrowserView()
  return true
})
ipcMain.handle('suggest:google', async (_e, q) => {
  try {
    const res = await net.fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(String(q).slice(0, 200))}`,
    )
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.[1]) ? json[1].slice(0, 8) : []
  } catch {
    return []
  }
})

ipcMain.handle('system:info', () => {
  const cpus = os.cpus()
  return {
    hostname: os.hostname(),
    platform: process.platform,
    osVersion: process.getSystemVersion ? process.getSystemVersion() : os.release(),
    arch: os.arch(),
    cpuModel: cpus[0] ? cpus[0].model.trim() : 'Unknown',
    cpuCores: cpus.length,
    memTotal: os.totalmem(),
    uptime: os.uptime(),
    versions: { electron: process.versions.electron, chrome: process.versions.chrome },
    displays: screen.getAllDisplays().map((d) => ({ w: d.size.width, h: d.size.height, scale: d.scaleFactor })),
  }
})
/* ---------- lifecycle ---------- */

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url)
    const rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname)
    const file = path.normalize(path.join(DIST, rel))
    if (!file.startsWith(DIST + path.sep)) return new Response('Forbidden', { status: 403 })
    return net.fetch(pathToFileURL(file).toString())
  })

  // Safari tab: deny camera, mic, notifications etc. by default
  session
    .fromPartition(BROWSER_PARTITION)
    .setPermissionRequestHandler((_wc, permission, cb) =>
      cb(['fullscreen', 'clipboard-sanitized-write'].includes(permission)),
    )

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})