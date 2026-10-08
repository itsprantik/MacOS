export {}

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean

      browser: {
        navigate: (url: string) => Promise<{
          success: boolean
          url?: string
          error?: string
        }>

        back: () => Promise<boolean>

        forward: () => Promise<boolean>

        reload: () => Promise<boolean>

        setBounds: (bounds: {
          x: number
          y: number
          width: number
          height: number
        }) => Promise<boolean>

        hide: () => Promise<boolean>
      }

      onBrowserUrl: (
        callback: (url: string) => void
      ) => void

      onBrowserLoading: (
        callback: (loading: boolean) => void
      ) => void
    }
  }
}