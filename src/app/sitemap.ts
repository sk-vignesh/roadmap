import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [itemsRes, changelogsRes] = await Promise.all([
    supabase
      .from('items')
      .select('slug, updated_at')
      .eq('is_private', false)
      .order('updated_at', { ascending: false }),
    supabase
      .from('changelogs')
      .select('slug, updated_at')
      .not('published_at', 'is', null)
      .order('updated_at', { ascending: false }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/en/changelog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/en/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const itemRoutes: MetadataRoute.Sitemap = (itemsRes.data ?? []).map(item => ({
    url: `${BASE_URL}/en/items/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const changelogRoutes: MetadataRoute.Sitemap = (changelogsRes.data ?? []).map(entry => ({
    url: `${BASE_URL}/en/changelog/${entry.slug}`,
    lastModified: new Date(entry.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...itemRoutes, ...changelogRoutes]
}
