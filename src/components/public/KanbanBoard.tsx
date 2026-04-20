'use client'

import Link from 'next/link'
import { VoteButton } from './VoteButton'
import { ChevronUp } from 'lucide-react'

interface BoardRow { id: string; name: string; color: string }
interface ItemRow {
  id: string
  title: string
  slug: string
  total_votes: number
  is_pinned: boolean
  board: BoardRow | null
  project: { id: string; name: string; slug: string } | null
  created_at: string
}

interface KanbanBoardProps {
  boards: BoardRow[]
  items: ItemRow[]
  votedItemIds: string[]
  isLoggedIn: boolean
}

export function KanbanBoard({ boards, items, votedItemIds, isLoggedIn }: KanbanBoardProps) {
  const votedSet = new Set(votedItemIds)

  // Group items by board, plus an "Inbox" column for items with no board
  const groupedItems: Record<string, ItemRow[]> = {}
  const unboardedItems: ItemRow[] = []

  for (const item of items) {
    if (item.board) {
      if (!groupedItems[item.board.id]) groupedItems[item.board.id] = []
      groupedItems[item.board.id].push(item)
    } else {
      unboardedItems.push(item)
    }
  }

  const columns = [
    ...boards.map(b => ({ id: b.id, name: b.name, color: b.color, items: groupedItems[b.id] ?? [] })),
    ...(unboardedItems.length > 0
      ? [{ id: 'inbox', name: 'Inbox', color: '#94a3b8', items: unboardedItems }]
      : []),
  ].filter(col => col.items.length > 0)

  if (columns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-xl">
        <p className="text-lg font-medium">No items yet</p>
        <p className="text-sm mt-1">
          {isLoggedIn ? (
            <Link href="?suggest=1&view=board" className="text-primary hover:underline">
              Suggest the first feature
            </Link>
          ) : 'Sign in to suggest a feature'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
      {columns.map(col => (
        <div
          key={col.id}
          className="flex-none w-72 flex flex-col gap-2"
        >
          {/* Column header */}
          <div className="flex items-center gap-2 px-1 sticky top-0">
            <span
              className="h-2.5 w-2.5 rounded-full flex-none"
              style={{ backgroundColor: col.color }}
            />
            <span className="text-sm font-semibold">{col.name}</span>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {col.items.map(item => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:shadow-md transition-all group"
              >
                {item.is_pinned && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">
                    Pinned
                  </span>
                )}
                <Link
                  href={`/en/items/${item.slug}`}
                  className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
                <div className="flex items-center justify-between gap-2">
                  {item.project && (
                    <span className="text-xs text-muted-foreground truncate">
                      {item.project.name}
                    </span>
                  )}
                  <div className="ml-auto flex-none">
                    <VoteButton
                      itemId={item.id}
                      itemSlug={item.slug}
                      totalVotes={item.total_votes}
                      hasVoted={votedSet.has(item.id)}
                      disabled={!isLoggedIn}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
