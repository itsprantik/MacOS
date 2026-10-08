export interface Track {
  id: string
  title: string
  artist: string
  src: string
  cover: string
}

const t = (slug: string, title: string, artist: string): Track => ({
  id: slug,
  title,
  artist,
  src: `/music/${slug}.mp3`,
  cover: `/music/covers/${slug}.jpg`,
})

export const tracks: Track[] = [
  t('sao-paulo', 'São Paulo', 'The Weeknd, Anitta'),
  t('timeless', 'Timeless', 'The Weeknd, Playboi Carti'),
  t('blinding-lights', 'Blinding Lights', 'The Weeknd'),
  t('starboy', 'Starboy', 'The Weeknd, Daft Punk'),
  t('billie-jean', 'Billie Jean', 'Michael Jackson'),
  t('dracula', 'Dracula', 'Tame Impala'),
  t('past-lives', 'Past Lives', 'Sapientdream, Slushii'),
  t('attention', 'Attention', 'Charlie Puth'),
  t('love-me-not', 'Love Me Not', 'Ravyn Lenae'),
  t('i-wanna-be-yours', 'I Wanna Be Yours', 'Arctic Monkeys'),
]