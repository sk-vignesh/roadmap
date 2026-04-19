'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSetting(group: string, name: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('group', group)
    .eq('name', name)
    .single()
  return data?.value ?? null
}

export async function getAllSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('group, name, value')
  const map: Record<string, Record<string, unknown>> = {}
  for (const row of data ?? []) {
    if (!map[row.group]) map[row.group] = {}
    map[row.group][row.name] = row.value
  }
  return map
}

export async function upsertSetting(group: string, name: string, value: unknown) {
  const supabase = await createClient()
  await supabase.from('settings').upsert(
    { group, name, value: value as any },
    { onConflict: 'group,name' }
  )
  revalidatePath('/admin/settings')
}

export async function saveGeneralSettings(formData: FormData) {
  const settings = [
    { group: 'general', name: 'app_name', value: formData.get('app_name') },
    { group: 'general', name: 'allow_registration', value: formData.get('allow_registration') === 'true' },
    { group: 'general', name: 'disable_file_uploads', value: formData.get('disable_file_uploads') === 'true' },
    { group: 'general', name: 'password_protection_enabled', value: formData.get('password_protection_enabled') === 'true' },
    { group: 'general', name: 'password_protection_password', value: formData.get('password_protection_password') || null },
    { group: 'general', name: 'send_notifications_to', value: (formData.get('send_notifications_to') as string || '').split(',').map((s: string) => s.trim()).filter(Boolean) },
    { group: 'color', name: 'primary_color', value: formData.get('primary_color') || '#6366f1' },
  ]

  const supabase = await createClient()
  for (const s of settings) {
    await supabase.from('settings').upsert(
      { group: s.group, name: s.name, value: s.value as any },
      { onConflict: 'group,name' }
    )
  }
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function saveGitHubSettings(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('settings').upsert([
    { group: 'general', name: 'github_enabled', value: formData.get('github_enabled') === 'true' },
    { group: 'general', name: 'github_token', value: formData.get('github_token') || null },
  ], { onConflict: 'group,name' })
  revalidatePath('/admin/settings')
  return { success: true }
}
