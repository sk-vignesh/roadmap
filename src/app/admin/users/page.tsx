import { createClient } from '@/lib/supabase/server'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

export const metadata = { title: 'Users — Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('id, name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-0.5">Manage user roles and access.</p>
      </div>
      <AdminUsersTable users={(users as any) ?? []} />
    </div>
  )
}
