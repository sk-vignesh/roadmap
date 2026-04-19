'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const boardSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sort_order: z.coerce.number().int().default(0),
  is_default: z.coerce.boolean().default(false),
})

export async function createBoard(formData: FormData) {
  const parsed = boardSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('boards').insert(parsed.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/boards')
  return { success: true }
}

export async function updateBoard(id: string, data: Partial<{ name: string; color: string; sort_order: number; is_default: boolean }>) {
  const supabase = await createClient()
  const { error } = await supabase.from('boards').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/boards')
  return { success: true }
}

export async function deleteBoard(id: string) {
  const supabase = await createClient()
  await supabase.from('boards').delete().eq('id', id)
  revalidatePath('/admin/boards')
}

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  is_private: z.coerce.boolean().default(false),
  color: z.string().optional(),
  github_owner: z.string().optional(),
  github_repo: z.string().optional(),
})

export async function createProject(formData: FormData) {
  const parsed = projectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const supabase = await createClient()
  const { error } = await supabase.from('projects').insert(parsed.data)
  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  await supabase.from('projects').delete().eq('id', id)
  revalidatePath('/admin/projects')
}

export async function updateUserRole(userId: string, role: 'admin' | 'employee' | 'user') {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
