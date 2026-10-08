import type { ComponentType } from 'react'

export interface AppProps {
  title: string
}

export interface AppDefinition {
  id: string
  title: string
  icon: string
  component?: ComponentType<AppProps> // falls back to <Placeholder />
  defaultSize: { width: number; height: number }
  singleInstance?: boolean
  inDock?: boolean
}

export interface WindowState {
  id: string
  appId: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  minimized: boolean
  maximized: boolean
}