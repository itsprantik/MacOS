const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  browser: {
    navigate: (url) =>
      ipcRenderer.invoke(
        'browser:navigate',
        url
      ),

    back: () =>
      ipcRenderer.invoke(
        'browser:back'
      ),

    forward: () =>
      ipcRenderer.invoke(
        'browser:forward'
      ),

    reload: () =>
      ipcRenderer.invoke(
        'browser:reload'
      ),

    setBounds: (bounds) =>
      ipcRenderer.invoke(
        'browser:set-bounds',
        bounds
      ),

    hide: () =>
      ipcRenderer.invoke(
        'browser:hide'
      ),
  },

  onBrowserUrl: (callback) => {
    ipcRenderer.on(
      'browser-url',
      (_event, url) => {
        callback(url)
      }
    )
  },

  onBrowserLoading: (callback) => {
    ipcRenderer.on(
      'browser-loading',
      (_event, loading) => {
        callback(loading)
      }
    )
  },
})