const { contextBridge, ipcRenderer } = require('electron')

const subscribe = (channel, callback) => {
  const listener = (_event, payload) => callback(payload)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  browser: {
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url),
    back: () => ipcRenderer.invoke('browser:back'),
    forward: () => ipcRenderer.invoke('browser:forward'),
    reload: () => ipcRenderer.invoke('browser:reload'),
    setBounds: (bounds) => ipcRenderer.invoke('browser:set-bounds', bounds),
    hide: () => ipcRenderer.invoke('browser:hide'),
    snapshot: () => ipcRenderer.invoke('browser:snapshot'),
    destroy: () => ipcRenderer.invoke('browser:destroy'),
  },

  suggest: (q) => ipcRenderer.invoke('suggest:google', q),
  system: { info: () => ipcRenderer.invoke('system:info') },

  onBrowserUrl: (cb) => subscribe('browser-url', cb),
  onBrowserLoading: (cb) => subscribe('browser-loading', cb),
  onBrowserNav: (cb) => subscribe('browser-nav', cb),
  onBrowserTitle: (cb) => subscribe('browser-title', cb),
  onBrowserFavicon: (cb) => subscribe('browser-favicon', cb),
  onBrowserNewTab: (cb) => subscribe('browser-new-tab', cb),
})