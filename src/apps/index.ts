import type { ComponentType } from 'react'
import type { AppProps } from '../core/types'
import Placeholder from './Placeholder'
import MusicApp from './Music'
import Finder from './Finder'
import Settings from './Settings'
import Terminal from './Terminal'

const appComponents: Record<string, ComponentType<AppProps>> = {
  music: MusicApp,
  finder: Finder,
  settings: Settings,
  terminal: Terminal,
}

export const getAppComponent = (id: string) => appComponents[id] ?? Placeholder