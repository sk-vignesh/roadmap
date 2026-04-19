import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

export const metadata = {
  title: 'Changelog',
  description: 'Latest updates and releases.',
}

interface ChangelogItem {
  id: string
  slug: string
  title: string
  content: string | null
  published_at: string | null
  created_at: string
  author: { name: string | null; avatar_url: string | null } | null
}

export default async function ChangelogPage() {
  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('changelogs')
    .select('id, slug, title, content, published_at, created_at, author:profiles!changelogs_user_id_fkey(name, avatar_url)')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  const entries = (raw as unknown as ChangelogItem[]) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground mt-1">Latest updates and improvements.</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 border rounded-xl text-muted-foreground">
          <p>No changelog entries yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {entries.map((entry) => {
            const date = entry.published_at ?? entry.created_at
            return (
              <article key={entry.id} className="relative pl-6 border-l-2 border-border">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <time dateTime={date}>{format(new Date(date), 'MMMM d, yyyy')}</time>
                  </div>
                  <h2 className="text-xl font-bold hover:text-primary transition-colors">
                    <Link href={`/en/changelog/${entry.slug}`}>{entry.title}</Link>
                  </h2>
                  {entry.content && (
                    <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
                  )}
                  <Link
                    href={`/en/changelog/${entry.slug}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
