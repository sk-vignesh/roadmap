'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Step 1 — send OTP to the provided email
 */
export async function sendOtp(email: string) {
  if (!email?.trim()) return { error: 'Email is required' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      shouldCreateUser: true,           // auto-register on first login
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Step 2 — verify the 6-digit OTP token
 */
export async function verifyOtp(email: string, token: string) {
  if (!email || !token) return { error: 'Email and code are required' }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  })

  if (error) return { error: error.message }
  redirect('/en')
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/en/login')
}

/**
 * OAuth providers (kept for optional GitHub/Google)
 */
export async function signInWithGitHub() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${APP_URL}/auth/callback` },
  })
  if (data.url) redirect(data.url)
  if (error) return { error: error.message }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${APP_URL}/auth/callback` },
  })
  if (data.url) redirect(data.url)
  if (error) return { error: error.message }
}
