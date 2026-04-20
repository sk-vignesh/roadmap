'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { updateItem, deleteItem } from '@/app/actions/items'
import {
  ChevronUp,
  Pin,
  Lock,
  Trash2,
  ExternalLink,
  Search,
} from 'lucide-react'

interface Board { id: string; name: string; color: string }
interface Project { id: string; name: string }
interface Item {
  id: string
  title: string
  slug: string
  total_votes: number
  is_pinned: boolean
  is_private: boolean
  created_at: string
  horizon: string | null
  quarter: string | null
  board: Board | null
  project: Project | null
  author: { name: string | null; email: string } | null
}

interface AdminItemsTableProps {
  items: Item[]
  boards: Board[]
  projects: Project[]
}

const HORIZONS = [
  { value: '', label: '— No horizon —' },
  { value: 'now',  label: '🟢 Now' },
  { value: 'next', label: '🔵 Next' },
  { value: 'later', label: '🟣 Later' },
]

/** Generate quarters: current quarter up to 8 quarters ahead */
function generateQuarters(): string[] {
  const now = new Date()
  const currentQ = Math.floor(now.getMonth() / 3) + 1
  const currentYear = now.getFullYear()
  const quarters: string[] = []
  let q = currentQ
  let y = currentYear
  for (let i = 0; i < 8; i++) {
    quarters.push(`Q${q} ${y}`)
    q++
    if (q > 4) { q = 1; y++ }
  }
  return quarters
}

const QUARTERS = generateQuarters()

export function AdminItemsTable({ items, boards, projects }: AdminItemsTableProps) {
  const [search, setSearch] = useState('')
  const [horizonFilter, setHorizonFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = items.filter(item => {
    const q = search.toLowerCase()
    const matchesSearch = item.title.toLowerCase().includes(q) ||
      (item.author?.name ?? item.author?.email ?? '').toLowerCase().includes(q)
    const matchesHorizon =
      !horizonFilter ||
      (horizonFilter === 'unscheduled' ? !item.horizon : item.horizon === horizonFilter)
    return matchesSearch && matchesHorizon
  })

  function handleHorizonChange(id: string, horizon: string) {
    const val = horizon || null
    // Clear quarter if horizon is no longer 'later'
    startTransition(() => {
      void updateItem(id, { horizon: val, quarter: val === 'later' ? undefined : null })
    })
  }

  function handleQuarterChange(id: string, quarter: string) {
    startTransition(() => { void updateItem(id, { quarter: quarter || null }) })
  }

  function handleTogglePin(id: string, current: boolean) {
    startTransition(() => { void updateItem(id, { is_pinned: !current }) })
  }

  function handleTogglePrivate(id: string, current: boolean) {
    startTransition(() => { void updateItem(id, { is_private: !current }) })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    startTransition(() => deleteItem(id))
  }

  const horizonLabel = (h: string | null) => {
    if (h === 'now')  return { label: 'Now',  color: 'bg-emerald-500/10 text-emerald-600' }
    if (h === 'next') return { label: 'Next', color: 'bg-blue-500/10 text-blue-600' }
    if (h === 'later') return { label: 'Later', color: 'bg-violet-500/10 text-violet-600' }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={horizonFilter}
          onChange={e => setHorizonFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All horizons</option>
          <option value="unscheduled">⏳ Unscheduled</option>
          <option value="now">🟢 Now</option>
          <option value="next">🔵 Next</option>
          <option value="later">🟣 Later</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {items.length} items
      </p>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Horizon</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Author</th>
                <th className="text-center px-4 py-3 font-medium w-16">
                  <ChevronUp className="h-4 w-4 mx-auto" />
                </th>
                <th className="text-center px-4 py-3 font-medium w-12">
                  <Pin className="h-4 w-4 mx-auto" />
                </th>
                <th className="text-center px-4 py-3 font-medium w-12">
                  <Lock className="h-4 w-4 mx-auto" />
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => {
                const badge = horizonLabel(item.horizon)
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/30 transition-colors ${isPending ? 'opacity-60' : ''}`}
                  >
                    {/* Title */}
                    <td className="px-4 py-3">
                      <span className="font-medium truncate max-w-xs block">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </td>

                    {/* Horizon + Quarter */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        {/* Horizon badge + select */}
                        <div className="flex items-center gap-1.5">
                          {badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                              {badge.label}
                            </span>
                          )}
                          <select
                            defaultValue={item.horizon ?? ''}
                            onChange={e => handleHorizonChange(item.id, e.target.value)}
                            className="text-xs rounded-md border px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1"
                          >
                            {HORIZONS.map(h => (
                              <option key={h.value} value={h.value}>{h.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Quarter (only when later) */}
                        {item.horizon === 'later' && (
                          <select
                            defaultValue={item.quarter ?? ''}
                            onChange={e => handleQuarterChange(item.id, e.target.value)}
                            className="text-xs rounded-md border px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            <option value="">— Pick quarter —</option>
                            {QUARTERS.map(q => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {item.author?.name ?? item.author?.email ?? '—'}
                    </td>

                    {/* Votes */}
                    <td className="px-4 py-3 text-center font-bold">{item.total_votes}</td>

                    {/* Pin */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePin(item.id, item.is_pinned)}
                        className={`p-1.5 rounded-md transition-colors ${
                          item.is_pinned
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title={item.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </td>

                    {/* Private */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePrivate(item.id, item.is_private)}
                        className={`p-1.5 rounded-md transition-colors ${
                          item.is_private
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        title={item.is_private ? 'Make public' : 'Make private'}
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <a
                          href={`/en/items/${item.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="View"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No items match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
