import type { AppDefinition } from './types'
import MusicApp from '../apps/Music'

export const ICON_EXT = 'png' // change to 'ico' if you keep .ico files
export const iconPath = (name: string) => `/icons/${name}.${ICON_EXT}`

const app = (id: string, title: string, extra: Partial<AppDefinition> = {}): AppDefinition => ({
  id,
  title,
  icon: iconPath(id),
  defaultSize: { width: 720, height: 460 },
  singleInstance: true,
  inDock: true,
  ...extra,
})

// Add new apps here. They show up in the dock automatically.
export const apps: AppDefinition[] = [
  app('finder', 'Finder'),
  app('safari', 'Safari'),
  app('messages', 'Messages'),
  app('mail', 'Mail'),
  app('maps', 'Maps'),
  app('photos', 'Photos'),
  app('facetime', 'FaceTime'),
  app('calendar', 'Calendar'),
  app('contacts', 'Contacts'),
  app('reminders', 'Reminders'),
  app('notes', 'Notes'),
  app('music', 'Music', { component: MusicApp, defaultSize: { width: 920, height: 600 } }),
  app('news', 'News'),
  app('appstore', 'App Store'),
  app('settings', 'Settings'),
]

export const getApp = (id: string) => apps.find((a) => a.id === id)