'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

// ── Create Tag ────────────────────────────────────────────────────────────────
export async function createTag(data: {
  name: string
  color: string
  is_changelog_tag?: boolean
}) {
  await requireAdmin()
  const supabase = await createClient()
  const slug = slugify(data.name)

  // Try with color; if migration not yet run, insert without it
  let { error } = await supabase
    .from('tags')
    .insert({ name: data.name, slug, color: data.color, is_changelog_tag: data.is_changelog_tag ?? false })

  if (error?.message?.includes("'color'")) {
    ;({ error } = await supabase
      .from('tags')
      .insert({ name: data.name, slug, is_changelog_tag: data.is_changelog_tag ?? false }))
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/tags')
  revalidatePath('/en')
  return { success: true }
}

// ── Update Tag ────────────────────────────────────────────────────────────────
export async function updateTag(
  id: string,
  data: { name?: string; color?: string; is_changelog_tag?: boolean }
) {
  await requireAdmin()
  const supabase = await createClient()
  const update: Record<string, unknown> = { ...data }
  if (data.name) update.slug = slugify(data.name)

  let { error } = await supabase.from('tags').update(update).eq('id', id)
  if (error?.message?.includes("'color'")) {
    // color column not yet in schema — strip it and retry
    const { color: _color, ...withoutColor } = update as Record<string, unknown> & { color?: unknown }
    void _color
    ;({ error } = await supabase.from('tags').update(withoutColor).eq('id', id))
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/tags')
  revalidatePath('/en')
  return { success: true }
}

// ── Delete Tag ────────────────────────────────────────────────────────────────
export async function deleteTag(id: string) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from('tags').delete().eq('id', id)
  revalidatePath('/admin/tags')
  revalidatePath('/en')
}

// ── Set item tags (replaces all) ──────────────────────────────────────────────
export async function setItemTags(itemId: string, tagIds: string[]) {
  const supabase = await createClient()
  // Replace all
  await supabase.from('item_tags').delete().eq('item_id', itemId)
  if (tagIds.length > 0) {
    await supabase
      .from('item_tags')
      .insert(tagIds.map(tag_id => ({ item_id: itemId, tag_id })))
  }
  revalidatePath('/admin/items')
  revalidatePath('/en')
  return { success: true }
}
