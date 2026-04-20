'use client'

import Link from 'next/link'
import { VoteButton } from './VoteButton'
import { TagBadge } from './TagBadge'

interface TagRow { id: string; name: string; color: string }
interface ItemRow {
  id: string
  title: string
  slug: string
  total_votes: number
  is_pinned: boolean
  horizon: string | null
  quarter: string | null
  board: { id: string; name: string; color: string } | null
  project: { id: string; name: string; slug: string } | null
  item_tags: { tag: TagRow | null }[]
}

interface RoadmapViewProps {
  items: ItemRow[]
  votedItemIds: string[]
  isLoggedIn: boolean
}

// Parse 'Q2 2026' → sortable number 20262
function quarterToNum(q: string) {
  const [qPart, year] = q.split(' ')
  return parseInt(year) * 10 + parseInt(qPart.replace('Q', ''))
}

function ItemCard({
  item,
  voted,
  isLoggedIn,
}: {
  item: ItemRow
  voted: boolean
  isLoggedIn: boolean
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border bg-card hover:shadow-sm transition-all group">
      {item.is_pinned && (
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit">
          Pinned
        </span>
      )}
      <Link
        href={`/en/items/${item.slug}`}
        className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2"
      >
        {item.title}
      </Link>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap gap-1">
          {item.board && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${item.board.color}20`, color: item.board.color }}
            >
              {item.board.name}
            </span>
          )}
          {item.project && (
            <span className="text-[10px] text-muted-foreground">{item.project.name}</span>
          )}
          {(item.item_tags ?? []).map(it => it.tag).filter(Boolean).map(tag => (
            <TagBadge key={tag!.id} name={tag!.name} color={tag!.color} />
          ))}
        </div>
        <div className="flex-none">
          <VoteButton
            itemId={item.id}
            itemSlug={item.slug}
            totalVotes={item.total_votes}
            hasVoted={voted}
            disabled={!isLoggedIn}
          />
        </div>
      </div>
    </div>
  )
}

function Column({
  title,
  subtitle,
  color,
  dot,
  items,
  votedSet,
  isLoggedIn,
}: {
  title: string
  subtitle: string
  color: string
  dot: string
  items: ItemRow[]
  votedSet: Set<string>
  isLoggedIn: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full flex-none ${dot}`} />
        <div>
          <span className="text-sm font-bold">{title}</span>
          <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>
        </div>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div
        className={`flex-1 min-h-[120px] rounded-xl border-2 border-dashed p-3 space-y-2 ${color}`}
      >
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center pt-4">No items yet</p>
        ) : (
          items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              voted={votedSet.has(item.id)}
              isLoggedIn={isLoggedIn}
            />
          ))
        )}
      </div>
    </div>
  )
}

export function RoadmapView({ items, votedItemIds, isLoggedIn }: RoadmapViewProps) {
  const votedSet = new Set(votedItemIds)

  const nowItems = items.filter(i => i.horizon === 'now')
  const nextItems = items.filter(i => i.horizon === 'next')
  const laterItems = items.filter(i => i.horizon === 'later')
  const unscheduled = items.filter(i => !i.horizon)

  // Group later items by quarter, sorted chronologically
  const quarterMap: Record<string, ItemRow[]> = {}
  for (const item of laterItems) {
    const key = item.quarter ?? 'Unscheduled'
    if (!quarterMap[key]) quarterMap[key] = []
    quarterMap[key].push(item)
  }

  const sortedQuarters = Object.keys(quarterMap).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return quarterToNum(a) - quarterToNum(b)
  })

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-xl">
        <p className="text-lg font-medium">No items yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Under Consideration — unscheduled items awaiting triage */}
      {unscheduled.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 flex-none" />
            <div>
              <span className="text-sm font-bold">Under Consideration</span>
              <span className="text-xs text-muted-foreground ml-2">Awaiting triage</span>
            </div>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {unscheduled.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 rounded-xl border-2 border-dashed border-amber-400/30 bg-amber-400/[0.03] p-3">
            {unscheduled.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                voted={votedSet.has(item.id)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Now / Next columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Column
          title="Now"
          subtitle="Currently in progress"
          dot="bg-emerald-500"
          color="border-emerald-500/20 bg-emerald-500/[0.03]"
          items={nowItems}
          votedSet={votedSet}
          isLoggedIn={isLoggedIn}
        />
        <Column
          title="Next"
          subtitle="Coming up soon"
          dot="bg-blue-500"
          color="border-blue-500/20 bg-blue-500/[0.03]"
          items={nextItems}
          votedSet={votedSet}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Later — by quarter */}
      {laterItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500 flex-none" />
            <span className="text-sm font-bold">Later</span>
            <span className="text-xs text-muted-foreground ml-0.5">Future roadmap</span>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {laterItems.length}
            </span>
          </div>
          <div className="space-y-6 pl-4 border-l-2 border-violet-500/20">
            {sortedQuarters.map(quarter => (
              <div key={quarter} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {quarter}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {quarterMap[quarter].map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      voted={votedSet.has(item.id)}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
