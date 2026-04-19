import { createClient } from '@/lib/supabase/server'
import { AdminProjectsManager } from '@/components/admin/AdminProjectsManager'

export const metadata = { title: 'Projects — Admin' }

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name, description, is_private, color, github_owner, github_repo, created_at')
    .order('sort_order')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-0.5">Group items into product areas or projects.</p>
      </div>
      <AdminProjectsManager projects={(projects as any) ?? []} />
    </div>
  )
}
