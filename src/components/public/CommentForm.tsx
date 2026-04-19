'use client'

import { useState, useTransition } from 'react'
import { createComment } from '@/app/actions/votes'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, MessageCircle } from 'lucide-react'

interface CommentFormProps {
  itemId: string
  itemSlug: string
  parentId?: string | null
  onSuccess?: () => void
  placeholder?: string
  compact?: boolean
}

export function CommentForm({
  itemId,
  itemSlug,
  parentId,
  onSuccess,
  placeholder = 'Write a comment...',
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    startTransition(async () => {
      setError(null)
      const result = await createComment(itemId, itemSlug, content, parentId)
      if (result?.error) {
        setError(result.error)
        return
      }
      setContent('')
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        className="resize-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageCircle className="h-3.5 w-3.5" />
          )}
          Post comment
        </button>
      </div>
    </form>
  )
}
