import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

interface ChangelogDetailProps {
  params: Promise<{ locale: string; slug: string }>
}

interface ChangelogEntry {
  id: string
  slug: string
  title: string
  content: string | null
  published_at: string | null
  created_at: string
  author: { name: string | null; avatar_url: string | null } | null
}

export async function generateMetadata({ params }: ChangelogDetailProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('changelogs')
    .select('title, content')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Not Found' }
  return {
    title: data.title,
    description: (data.content ?? '').slice(0, 160),
  }
}

export default async function ChangelogDetailPage({ params }: ChangelogDetailProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('changelogs')
    .select('id, slug, title, content, published_at, created_at, author:profiles!changelogs_user_id_fkey(name, avatar_url)')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .single()

  if (!raw) notFound()
  const entry = raw as unknown as ChangelogEntry

  const date = entry.published_at ?? entry.created_at

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/en/changelog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All changelog entries
      </Link>

      <article className="space-y-6">
        <header className="space-y-3">
          <time className="text-sm text-muted-foreground block" dateTime={date}>
            {format(new Date(date), 'MMMM d, yyyy')}
          </time>
          <h1 className="text-3xl font-bold tracking-tight">{entry.title}</h1>
          {entry.author?.name && (
            <p className="text-sm text-muted-foreground">
              By <span className="font-medium text-foreground">{entry.author.name}</span>
            </p>
          )}
        </header>

        {entry.content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground/90 leading-7">
              {entry.content}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
