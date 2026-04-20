'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Map, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  user: User | null
  userRole?: string | null
}

export function Navbar({ user, userRole }: NavbarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname.includes(path)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/en/login')
    router.refresh()
  }

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
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/40 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer flex items-center justify-center bg-primary text-primary-foreground text-sm font-semibold"
                >
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.name ?? user.email ?? ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {(user.user_metadata?.name ?? user.email ?? 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="p-0">
                    <Link
                      href="/en/profile"
                      className="flex items-center gap-2 w-full px-1.5 py-1 cursor-pointer"
                    >
                      <UserIcon className="h-4 w-4" />
                      {t('profile')}
                    </Link>
                  </DropdownMenuItem>

                  {userRole && ['admin', 'employee'].includes(userRole) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="p-0">
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 w-full px-1.5 py-1 cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t('admin')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
