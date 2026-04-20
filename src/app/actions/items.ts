'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ── slug helper ──────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

// ── Create Item ──────────────────────────────────────────────────────────────
const createSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(5000).optional(),
  project_id: z.string().uuid().optional().nullable(),
  board_id: z.string().uuid().optional().nullable(),
})

export async function createItem(formData: FormData) {
  const user = await requireAuth()
  const parsed = createSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    project_id: formData.get('project_id') || null,
    board_id: formData.get('board_id') || null,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  // Get default board if none specified
  let boardId = parsed.data.board_id
  if (!boardId) {
    const { data: defaultBoard } = await supabase
      .from('boards')
      .select('id')
      .eq('is_default', false)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single()
    boardId = defaultBoard?.id ?? null
  }

  const baseSlug = slugify(parsed.data.title)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data: existing } = await supabase
      .from('items')
      .select('id')
      .eq('slug', slug)
      .single()
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const { data: item, error } = await supabase
    .from('items')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      project_id: parsed.data.project_id ?? null,
      board_id: boardId,
      user_id: user.id,
      slug,
    })
    .select('slug')
    .single()

  if (error) return { error: error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    subject_type: 'item',
    subject_id: item.slug,
    causer_id: user.id,
    event: 'created',
    properties: { title: parsed.data.title },
  })

  revalidatePath('/en')
  redirect(`/en/items/${item.slug}`)
}

// ── Update Item (admin) ───────────────────────────────────────────────────────
export async function updateItem(
  id: string,
  data: {
    title?: string
    description?: string | null
    board_id?: string | null
    project_id?: string | null
    is_private?: boolean
    is_pinned?: boolean
    notify_subscribers?: boolean
    horizon?: string | null
    quarter?: string | null
  }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('items').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/items')
  revalidatePath('/en')
  return { success: true }
}


// ── Delete Item (admin) ───────────────────────────────────────────────────────
export async function deleteItem(id: string) {
  const supabase = await createClient()
  await supabase.from('items').delete().eq('id', id)
  revalidatePath('/admin/items')
  revalidatePath('/en')
}
