import { createClient } from '@/lib/supabase/server'
import { AdminBoardsManager } from '@/components/admin/AdminBoardsManager'

export const metadata = { title: 'Boards — Admin' }

export default async function AdminBoardsPage() {
  const supabase = await createClient()
  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .order('sort_order')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Boards</h1>
        <p className="text-muted-foreground mt-0.5">Status columns for items (e.g. Planned, In Progress).</p>
      </div>
      <AdminBoardsManager boards={(boards as any) ?? []} />
    </div>
  )
}
