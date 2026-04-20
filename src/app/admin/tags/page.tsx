import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { AdminTagsTable } from '@/components/admin/AdminTagsTable'

export const metadata = { title: 'Tags — Admin' }

export default async function AdminTagsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Try fetching with color column; fall back gracefully if migration not yet applied
  const { data: rawTagsWithColor, error: colorError } = await supabase
    .from('tags')
    .select('id, name, slug, color, is_changelog_tag, item_tags(count)')
    .order('order_column', { ascending: true })

  let rawTagsData: Record<string, unknown>[] = []
  if (colorError) {
    // color column not yet added — fetch without it and apply safe default
    const { data: fallback } = await supabase
      .from('tags')
      .select('id, name, slug, is_changelog_tag, item_tags(count)')
      .order('order_column', { ascending: true })
    rawTagsData = ((fallback ?? []) as Record<string, unknown>[]).map(t => ({ ...t, color: '#6366f1' }))
  } else {
    rawTagsData = (rawTagsWithColor ?? []) as Record<string, unknown>[]
  }

  const tags = rawTagsData.map(t => ({
    id: t.id as string,
    name: t.name as string,
    slug: t.slug as string,
    color: (t.color as string) ?? '#6366f1',
    is_changelog_tag: t.is_changelog_tag as boolean,
    item_count: ((t.item_tags as { count: number }[]) ?? []).reduce((s, r) => s + (r.count ?? 0), 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create and manage tags to categorise roadmap items.
        </p>
      </div>
      <AdminTagsTable tags={tags} />
    </div>
  )
}
