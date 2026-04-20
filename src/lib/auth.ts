import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/en/login')
  return user
}

export async function requireAdmin() {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) redirect('/en/login')

  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = data as { role: string } | null

    if (!profile || !['admin', 'employee'].includes(profile.role)) {
      redirect('/')
    }

    return { user, profile }
  } catch {
    // DB schema not applied — treat as unauthorized
    redirect('/')
  }
}
