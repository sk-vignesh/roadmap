import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { AdminTagsTable } from '@/components/admin/AdminTagsTable'

export const metadata = { title: 'Tags — Admin' }

export default async function AdminTagsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch tags with item counts
  const { data: rawTags } = await supabase
    .from('tags')
    .select('id, name, slug, color, is_changelog_tag, item_tags(count)')
    .order('order_column', { ascending: true })

  const tags = (rawTags ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    name: t.name as string,
    slug: t.slug as string,
    color: (t.color as string) ?? '#6366f1',
    is_changelog_tag: t.is_changelog_tag as boolean,
    item_count: (t.item_tags as { count: number }[] ?? []).reduce((s, r) => s + (r.count ?? 0), 0),
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
