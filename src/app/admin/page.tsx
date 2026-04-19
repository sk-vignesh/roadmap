import { createClient } from '@/lib/supabase/server'
import { Lightbulb, Users, MessageSquare, FolderKanban, TrendingUp } from 'lucide-react'

interface StatCard {
  label: string
  value: number
  icon: React.ElementType
  color: string
}

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [items, users, comments, projects] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Items', value: items.count ?? 0, icon: Lightbulb, color: 'text-violet-500' },
    { label: 'Total Users', value: users.count ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Comments', value: comments.count ?? 0, icon: MessageSquare, color: 'text-green-500' },
    { label: 'Projects', value: projects.count ?? 0, icon: FolderKanban, color: 'text-amber-500' },
  ] satisfies StatCard[]

  // Recent items
  const { data: recentItems } = await supabase
    .from('items')
    .select('id, title, slug, total_votes, created_at, board:boards(name, color)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your roadmap.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recent Items */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Items
          </h2>
          <a href="/admin/items" className="text-sm text-primary hover:underline">
            View all →
          </a>
        </div>
        <div className="divide-y">
          {(recentItems ?? []).map((item) => {
            const board = item.board as unknown as { name: string; color: string } | null
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {board && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${board.color}20`, color: board.color }}
                      >
                        {board.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold">{item.total_votes}</span>
                  <p className="text-xs text-muted-foreground">votes</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
