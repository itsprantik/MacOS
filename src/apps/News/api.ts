import { NEWS_API_KEY } from '../../config/keys'

export interface Article {
  source: { name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

export class NewsError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

const BASE = 'https://newsapi.org/v2'
const TTL = 10 * 60 * 1000 // cache for 10 min to save your 100 free daily requests
const cache = new Map<string, { at: number; data: Article[] }>()

export const clearNewsCache = () => cache.clear()

async function request(path: string, params: Record<string, string>): Promise<Article[]> {
  if (!NEWS_API_KEY) throw new NewsError('apiKeyMissing', 'No API key set.')

  const qs = new URLSearchParams({ ...params, apiKey: NEWS_API_KEY })
  const url = `${BASE}/${path}?${qs}`

  const hit = cache.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit.data

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new NewsError('network', 'Could not reach the news service. Check your connection.')
  }

  const json = await res.json().catch(() => null)
  if (!res.ok || json?.status !== 'ok') {
    throw new NewsError(json?.code ?? 'error', json?.message ?? `Request failed (${res.status})`)
  }

  const data = (json.articles as Article[]).filter((a) => a.title && a.title !== '[Removed]' && a.url)
  cache.set(url, { at: Date.now(), data })
  return data
}

export const topHeadlines = (country: string, category: string) =>
  request('top-headlines', {
    country,
    pageSize: '30',
    ...(category !== 'general' ? { category } : {}),
  })

export const searchNews = (q: string) =>
  request('everything', { q, language: 'en', sortBy: 'publishedAt', pageSize: '30' })