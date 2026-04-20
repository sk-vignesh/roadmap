import { createClient } from '@/lib/supabase/server'
import { AdminItemsTable } from '@/components/admin/AdminItemsTable'

export const metadata = { title: 'Items — Admin' }

export default async function AdminItemsPage() {
  const supabase = await createClient()

  const [itemsRes, boardsRes, projectsRes] = await Promise.all([
    supabase
      .from('items')
      .select(`
        id, title, slug, total_votes, is_pinned, is_private, created_at,
        horizon, quarter,
        board:boards(id, name, color),
        project:projects(id, name),
        author:profiles!items_user_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('boards').select('id, name, color').order('sort_order'),
    supabase.from('projects').select('id, name').order('sort_order'),
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
        items={(itemsRes.data as any) ?? []}
        boards={(boardsRes.data as any) ?? []}
        projects={(projectsRes.data as any) ?? []}
      />
    </div>
  )
}
