'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User as UserIcon, ExternalLink } from 'lucide-react'

interface AdminHeaderProps {
  user: User | null
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/en/login')
    router.refresh()
  }

  const initials = (user?.user_metadata?.name ?? user?.email ?? 'A')
    .charAt(0)
    .toUpperCase()

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb placeholder — filled by page heading */}
      <p className="text-sm text-muted-foreground">Admin panel</p>

      <div className="flex items-center gap-3">
        {/* Quick link back to public site */}
        <Link
          href="/en"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 transition-colors hover:bg-accent"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View site
        </Link>

        {/* Profile dropdown */}
        {user && (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-label="Open user menu"
              aria-expanded={open}
              className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold"
            >
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                {/* User info */}
                <div className="px-3 py-2.5 border-b">
                  <p className="text-sm font-medium leading-none truncate">
                    {user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                  <span className="mt-1.5 inline-block text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>

                <div className="p-1">
                  <Link
                    href="/en/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <UserIcon className="h-4 w-4 flex-none" />
                    My Profile
                  </Link>
                  <Link
                    href="/en"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 flex-none" />
                    View public site
                  </Link>
                </div>

                <div className="border-t p-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 flex-none" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
