const {
  app,
  BrowserWindow,
  WebContentsView,
  ipcMain,
} = require('electron')

const path = require('path')

let mainWindow = null
let browserView = null

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

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../dist/index.html')
    )
  }

  mainWindow.on('closed', () => {
    mainWindow = null

    if (browserView) {
      browserView.webContents.close()
      browserView = null
    }
  })
}

/*
 * Create the real browser surface.
 */
function createBrowserView() {
  if (!mainWindow) return

  if (browserView) {
    return browserView
  }

  browserView = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.contentView.addChildView(browserView)

  /*
   * Initially hide it.
   */
  browserView.setBounds({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  browserView.webContents.on('did-start-loading', () => {
    mainWindow?.webContents.send(
      'browser-loading',
      true
    )
  })

  browserView.webContents.on('did-stop-loading', () => {
    mainWindow?.webContents.send(
      'browser-loading',
      false
    )
  })

  browserView.webContents.on('did-navigate', (_event, url) => {
    mainWindow?.webContents.send(
      'browser-url',
      url
    )
  })

  browserView.webContents.on(
    'did-navigate-in-page',
    (_event, url) => {
      mainWindow?.webContents.send(
        'browser-url',
        url
      )
    }
  )

  return browserView
}

/*
 * Navigate browser.
 */
ipcMain.handle(
  'browser:navigate',
  async (_event, url) => {
    try {
      const view = createBrowserView()

      await view.webContents.loadURL(url)

      return {
        success: true,
        url: view.webContents.getURL(),
      }
    } catch (error) {
      console.error(
        'Browser navigation failed:',
        error
      )

      return {
        success: false,
        error: String(error),
      }
    }
  }
)

/*
 * Go back.
 */
ipcMain.handle(
  'browser:back',
  async () => {
    if (!browserView) return false

    if (browserView.webContents.canGoBack()) {
      browserView.webContents.goBack()
      return true
    }

    return false
  }
)

/*
 * Go forward.
 */
ipcMain.handle(
  'browser:forward',
  async () => {
    if (!browserView) return false

    if (browserView.webContents.canGoForward()) {
      browserView.webContents.goForward()
      return true
    }

    return false
  }
)

/*
 * Reload.
 */
ipcMain.handle(
  'browser:reload',
  async () => {
    if (!browserView) return false

    browserView.webContents.reload()

    return true
  }
)

/*
 * Resize browser surface.
 */
ipcMain.handle(
  'browser:set-bounds',
  async (_event, bounds) => {
    if (!browserView) {
      createBrowserView()
    }

    browserView.setBounds({
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.max(
        0,
        Math.round(bounds.width)
      ),
      height: Math.max(
        0,
        Math.round(bounds.height)
      ),
    })

    return true
  }
)

/*
 * Hide browser surface.
 */
ipcMain.handle(
  'browser:hide',
  async () => {
    if (!browserView || !mainWindow) {
      return true
    }

    browserView.setBounds({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    })

    return true
  }
)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})