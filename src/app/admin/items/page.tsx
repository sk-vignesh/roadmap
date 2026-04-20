import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { AdminItemsTable } from '@/components/admin/AdminItemsTable'

export const metadata = { title: 'Items — Admin' }

export default async function AdminItemsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Try full query (with tags+color); fall back progressively if columns don't exist yet
  const baseSelect = `
    id, title, slug, total_votes, is_pinned, is_private, created_at,
    board:boards(id, name, color),
    project:projects(id, name),
    author:profiles!items_user_id_fkey(name, email)
  `

  // 1. Try with horizon + quarter + tags
  let { data: itemsFull, error: e1 } = await supabase
    .from('items')
    .select(`${baseSelect}, horizon, quarter, item_tags(tag:tags(id, name, color))`)
    .order('created_at', { ascending: false })
    .limit(500)

  // 2. Fall back: horizon+quarter but no tag color
  let items: unknown = itemsFull
  if (e1) {
    const { data: d2, error: e2 } = await supabase
      .from('items')
      .select(`${baseSelect}, horizon, quarter`)
      .order('created_at', { ascending: false })
      .limit(500)
    if (!e2) { items = d2; e1 = null }
  }

  // 3. Bare fallback: no horizon, no tags
  if (e1) {
    const { data: d3 } = await supabase
      .from('items')
      .select(baseSelect)
      .order('created_at', { ascending: false })
      .limit(500)
    items = d3
  }

  const [boardsRes, projectsRes, tagsRes] = await Promise.all([
    supabase.from('boards').select('id, name, color').order('sort_order'),
    supabase.from('projects').select('id, name').order('sort_order'),
    // Tags: try with color, fall back to without
    supabase.from('tags').select('id, name, color').order('order_column').then(async (res) => {
      if (res.error) {
        const fallback = await supabase.from('tags').select('id, name').order('order_column')
        return {
          data: ((fallback.data ?? []) as Record<string, unknown>[]).map(t => ({ ...t, color: '#6366f1' }))
        }
      }
      return res
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Items</h1>
          <p className="text-muted-foreground mt-0.5">
            Manage all feature requests and feedback items.
          </p>
        </div>
      </div>
      <AdminItemsTable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items={(items as any) ?? []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        boards={(boardsRes.data as any) ?? []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        projects={(projectsRes.data as any) ?? []}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allTags={(tagsRes.data as any) ?? []}
      />
    </div>
  )
}
