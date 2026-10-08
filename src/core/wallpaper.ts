import type { CSSProperties } from 'react'
import { useSystemStore } from './store/systemStore'

export const WALLPAPER_URL = '/wallpapers/default.jpg'

export interface Wallpaper {
  id: string
  name: string
  style: CSSProperties
}

const make = (bg: string): CSSProperties => ({
  backgroundImage: bg,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
})

// To add your own: drop an image in public/wallpapers and add { id, name, style: make('url(/wallpapers/x.jpg)') }
export const wallpapers: Wallpaper[] = [
  {
    id: 'tahoe',
    name: 'Tahoe',
    style: make(
      [
        `url(${WALLPAPER_URL})`,
        'radial-gradient(ellipse 60% 50% at 12% 38%, #dccf9e 0%, transparent 70%)',
        'radial-gradient(ellipse 50% 40% at 88% 18%, #86bccb 0%, transparent 70%)',
        'radial-gradient(ellipse 70% 60% at 65% 85%, #0a35c4 0%, transparent 70%)',
        'linear-gradient(160deg, #3f93d6 0%, #2f6fe0 55%, #0a2ea6 100%)',
      ].join(','),
    ),
  },
  {
    id: 'sunset',
    name: 'Sunset',
    style: make(
      'radial-gradient(ellipse 60% 50% at 15% 85%, #ff7e5f 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 85% 15%, #8e6bd1 0%, transparent 70%), linear-gradient(160deg, #fbc2a1 0%, #f08a8a 45%, #5b4a9c 100%)',
    ),
  },
  {
    id: 'aurora',
    name: 'Aurora',
    style: make(
      'radial-gradient(ellipse 70% 40% at 30% 20%, #3ddc97 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 60%, #7b5cff 0%, transparent 70%), linear-gradient(180deg, #06142e 0%, #0b2a4a 60%, #14213d 100%)',
    ),
  },
  {
    id: 'midnight',
    name: 'Midnight',
    style: make(
      'radial-gradient(ellipse 60% 50% at 70% 20%, #3a4a8a 0%, transparent 70%), linear-gradient(160deg, #0f2027, #203a43 55%, #2c5364)',
    ),
  },
  {
    id: 'forest',
    name: 'Forest',
    style: make(
      'radial-gradient(ellipse 60% 50% at 20% 20%, #9bd36a 0%, transparent 70%), linear-gradient(160deg, #2d6a4f, #1b4332 60%, #081c15)',
    ),
  },
  {
    id: 'graphite',
    name: 'Graphite',
    style: make(
      'radial-gradient(ellipse 60% 50% at 30% 20%, #6b7280 0%, transparent 70%), linear-gradient(160deg, #4b5563, #1f2937 60%, #111827)',
    ),
  },
]

export const wallpaperStyle = wallpapers[0].style

export function useWallpaperStyle() {
  const id = useSystemStore((s) => s.wallpaperId)
  return (wallpapers.find((w) => w.id === id) ?? wallpapers[0]).style
}