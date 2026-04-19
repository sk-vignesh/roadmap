'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/en/login')
}

export async function signInWithGitHub() {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  })
  if (error || !data.url) {
    redirect('/en/login?error=oauth_error')
  }
  redirect(data.url)
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  })
  if (error || !data.url) {
    redirect('/en/login?error=oauth_error')
  }
  redirect(data.url)
}
