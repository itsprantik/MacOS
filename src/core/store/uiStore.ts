import { create } from 'zustand'

export interface MenuItem {
  label?: string
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
}

interface UiState {
  contextMenu: { x: number; y: number; items: MenuItem[] } | null
  openMenu: (x: number, y: number, items: MenuItem[]) => void
  closeMenu: () => void
  galleryOpen: boolean
  setGallery: (open: boolean) => void
  settingsPage: string
  setSettingsPage: (page: string) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  contextMenu: null,
  openMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),
  closeMenu: () => set({ contextMenu: null }),
  galleryOpen: false,
  setGallery: (galleryOpen) => set({ galleryOpen }),
  settingsPage: 'wifi',
  setSettingsPage: (settingsPage) => set({ settingsPage }),
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))