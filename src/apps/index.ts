import type { ComponentType } from 'react'
import type { AppProps } from '../core/types'
import Placeholder from './Placeholder'
import MusicApp from './Music'
import Finder from './Finder'
import Settings from './Settings'
import Terminal from './Terminal'
import Safari from './Safari'
import News from './News'
import Calculator from './Calculator'
import Clock from './Clock'
import Calendar from './Calendar'
import About from './About'

const appComponents: Record<string, ComponentType<AppProps>> = {
  music: MusicApp,
  finder: Finder,
  settings: Settings,
  terminal: Terminal,
  safari: Safari,
  news: News,
  calculator: Calculator,
  clock: Clock,
  calendar: Calendar,
  about: About,
}

export const getAppComponent = (id: string) => appComponents[id] ?? Placeholder