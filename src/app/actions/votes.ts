'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ── Toggle Vote ───────────────────────────────────────────────────────────────
export async function toggleVote(itemId: string, itemSlug: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Check if already voted
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('votes').insert({
      item_id: itemId,
      user_id: user.id,
      subscribed: true,
    })
  }

  revalidatePath(`/en/items/${itemSlug}`)
  revalidatePath('/en')
  return { voted: !existing }
}

// ── Create Comment ────────────────────────────────────────────────────────────
export async function createComment(
  itemId: string,
  itemSlug: string,
  content: string,
  parentId?: string | null
) {
  const user = await requireAuth()
  if (!content?.trim()) return { error: 'Comment cannot be empty' }

  const supabase = await createClient()
  const { error } = await supabase.from('comments').insert({
    item_id: itemId,
    user_id: user.id,
    content: content.trim(),
    parent_id: parentId ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/en/items/${itemSlug}`)
  return { success: true }
}

// ── Delete Comment ────────────────────────────────────────────────────────────
export async function deleteComment(commentId: string, itemSlug: string) {
  const supabase = await createClient()
  await supabase.from('comments').delete().eq('id', commentId)
  revalidatePath(`/en/items/${itemSlug}`)
}

// ── Toggle Comment Vote ───────────────────────────────────────────────────────
export async function toggleCommentVote(commentId: string, itemSlug: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('comment_votes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('comment_votes').delete().eq('id', existing.id)
  } else {
    await supabase.from('comment_votes').insert({
      comment_id: commentId,
      user_id: user.id,
    })
  }

  revalidatePath(`/en/items/${itemSlug}`)
  return { voted: !existing }
}
