import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { AdminItemsTable } from '@/components/admin/AdminItemsTable'

export const metadata = { title: 'Items — Admin' }

export default async function AdminItemsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [itemsRes, boardsRes, projectsRes, tagsRes] = await Promise.all([
    supabase
      .from('items')
      .select(`
        id, title, slug, total_votes, is_pinned, is_private, created_at,
        horizon, quarter,
        board:boards(id, name, color),
        project:projects(id, name),
        author:profiles!items_user_id_fkey(name, email),
        item_tags(tag:tags(id, name, color))
      `)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('boards').select('id, name, color').order('sort_order'),
    supabase.from('projects').select('id, name').order('sort_order'),
    supabase.from('tags').select('id, name, color').order('order_column'),
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
        items={(itemsRes.data as any) ?? []}
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
