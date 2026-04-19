import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/public/Navbar'
import type { ReactNode } from 'react'

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getUser()
  let userRole: string | null = null

  if (user) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = (data as { role: string } | null)?.role ?? null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user ?? null} userRole={userRole} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 max-w-5xl text-center text-sm text-muted-foreground">
          Powered by{' '}
          <a
            href="https://github.com/sk-vignesh/roadmap"
            className="hover:text-foreground transition-colors"
          >
            Roadmap
          </a>
        </div>
      </footer>
    </div>
  )
}
