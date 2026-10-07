import type { CSSProperties } from 'react'

export const WALLPAPER_URL = '/wallpapers/default.jpg'

// The image sits on top; if it's missing, the gradients below show instead.
export const wallpaperStyle: CSSProperties = {
  backgroundImage: [
    `url(${WALLPAPER_URL})`,
    'radial-gradient(ellipse 60% 50% at 12% 38%, #dccf9e 0%, transparent 70%)',
    'radial-gradient(ellipse 50% 40% at 88% 18%, #86bccb 0%, transparent 70%)',
    'radial-gradient(ellipse 70% 60% at 65% 85%, #0a35c4 0%, transparent 70%)',
    'linear-gradient(160deg, #3f93d6 0%, #2f6fe0 55%, #0a2ea6 100%)',
  ].join(','),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}