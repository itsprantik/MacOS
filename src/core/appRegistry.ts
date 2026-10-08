import type { AppDefinition } from './types'

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

export const apps: AppDefinition[] = [
  app('finder', 'Finder', { defaultSize: { width: 860, height: 540 } }),
  app('safari', 'Safari', { defaultSize: { width: 1020, height: 660 } }),
  app('messages', 'Messages'),
  app('mail', 'Mail'),
  app('maps', 'Maps'),
  app('photos', 'Photos'),
  app('facetime', 'FaceTime'),
  app('calendar', 'Calendar'),
  app('contacts', 'Contacts'),
  app('reminders', 'Reminders'),
  app('notes', 'Notes'),
  app('music', 'Music', { defaultSize: { width: 920, height: 600 } }),
  app('news', 'News', { defaultSize: { width: 980, height: 640 } }),
  app('appstore', 'App Store'),
  app('calculator', 'Calculator', { defaultSize: { width: 276, height: 470 }}),
  app('clock', 'Clock', { defaultSize: { width: 440, height: 520 }}),
  app('terminal', 'Terminal', { defaultSize: { width: 780, height: 480 } }),
  app('settings', 'Settings', { defaultSize: { width: 880, height: 580 } }),
]

export const getApp = (id: string) => apps.find((a) => a.id === id)