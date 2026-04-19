'use client'

import { useState, useTransition } from 'react'
import { ChevronUp } from 'lucide-react'
import { toggleVote } from '@/app/actions/votes'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  itemId: string
  itemSlug: string
  totalVotes: number
  hasVoted: boolean
  disabled?: boolean
}

export function VoteButton({ itemId, itemSlug, totalVotes, hasVoted, disabled }: VoteButtonProps) {
  const [voted, setVoted] = useState(hasVoted)
  const [count, setCount] = useState(totalVotes)
  const [isPending, startTransition] = useTransition()

  function handleVote() {
    if (disabled) return
    startTransition(async () => {
      const result = await toggleVote(itemId, itemSlug)
      // Optimistic update already happened via useState
      setVoted(result.voted)
      setCount(prev => result.voted ? prev + 1 : prev - 1)
    })
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending || disabled}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border-2 transition-all font-medium min-w-[3.5rem]',
        'hover:scale-105 active:scale-95',
        voted
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary hover:text-primary',
        (isPending || disabled) && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={voted ? 'Remove vote' : 'Upvote'}
    >
      <ChevronUp className="h-4 w-4" />
      <span className="text-sm font-bold leading-none">{count}</span>
    </button>
  )
}
