'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from '@/app/actions/admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Search } from 'lucide-react'

interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  avatar_url: string | null
  created_at: string
}

const ROLES = ['user', 'employee', 'admin'] as const

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      (u.name ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  function handleRoleChange(userId: string, role: string) {
    startTransition(() => { void updateUserRole(userId, role as 'admin' | 'employee' | 'user') })
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-violet-500/10 text-violet-600',
    employee: 'bg-blue-500/10 text-blue-600',
    user: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(user => (
              <tr key={user.id} className={`hover:bg-muted/30 transition-colors ${isPending ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {(user.name ?? user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    className={`text-xs rounded-full px-2.5 py-1 border-0 font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer ${roleColors[user.role] ?? ''}`}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">No users found.</div>
        )}
      </div>
    </div>
  )
}
