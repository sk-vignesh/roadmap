'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Map, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  user: User | null
  userRole?: string | null
}

export function Navbar({ user, userRole }: NavbarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => pathname.includes(path)

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/en/login')
    router.refresh()
  }

  const initials = (user?.user_metadata?.name ?? user?.email ?? 'U')
    .charAt(0)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/en"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            Roadmap
          </Link>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/en"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                pathname === '/en' || isActive('/items')
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              href="/en/changelog"
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isActive('/changelog')
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {t('changelog')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div ref={menuRef} className="relative">
                {/* Avatar trigger */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold"
                  aria-label="Open user menu"
                  aria-expanded={menuOpen}
                >
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.name ?? user.email ?? ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </button>

                {/* Dropdown panel */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                    {/* User info */}
                    <div className="px-3 py-2.5 border-b">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1">
                      <Link
                        href="/en/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <UserIcon className="h-4 w-4 flex-none" />
                        {t('profile')}
                      </Link>

                      {userRole && ['admin', 'employee'].includes(userRole) && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 flex-none" />
                          {t('admin')}
                        </Link>
                      )}
                    </div>

                    <div className="border-t p-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 flex-none" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/en/login"
                className="px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
