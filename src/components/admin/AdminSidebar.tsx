'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  FolderKanban,
  Columns3,
  Tags,
  FileText,
  Users,
  Settings,
  Map,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/items', label: 'Items', icon: Lightbulb },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/boards', label: 'Boards', icon: Columns3 },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/changelogs', label: 'Changelogs', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-60 border-r bg-card flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-4 border-b">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Map className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold">Roadmap</span>
        <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t">
        <Link
          href="/en"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to public site
        </Link>
      </div>
    </aside>
  )
}
