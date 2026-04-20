'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface Board { id: string; name: string; color: string }
interface Project { id: string; name: string; slug: string }
interface Tag { id: string; name: string; color: string }

interface ItemFiltersProps {
  boards: Board[]
  projects: Project[]
  tags: Tag[]
}

export function ItemFilters({ boards, projects, tags }: ItemFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeBoard   = searchParams.get('board')
  const activeProject = searchParams.get('project')
  const activeTag     = searchParams.get('tag')
  const activeSort    = searchParams.get('sort') ?? 'votes'

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Sort */}
      <div className="flex gap-2">
        {[
          { value: 'votes', label: 'Top' },
          { value: 'new',   label: 'New' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => update('sort', value === 'votes' ? null : value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeSort === value
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Boards */}
      {boards.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => update('board', null)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              !activeBoard
                ? 'border-foreground bg-foreground text-background font-medium'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {boards.map(b => (
            <button
              key={b.id}
              onClick={() => update('board', b.id === activeBoard ? null : b.id)}
              className="px-3 py-1 text-xs rounded-full border transition-colors font-medium"
              style={
                b.id === activeBoard
                  ? { borderColor: b.color, backgroundColor: b.color, color: '#fff' }
                  : { borderColor: b.color, color: b.color }
              }
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => update('project', p.id === activeProject ? null : p.id)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                p.id === activeProject
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <button
              key={t.id}
              onClick={() => update('tag', t.id === activeTag ? null : t.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border transition-colors font-medium"
              style={
                t.id === activeTag
                  ? { borderColor: t.color, backgroundColor: t.color, color: '#fff' }
                  : { borderColor: `${t.color}60`, color: t.color, backgroundColor: `${t.color}11` }
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: t.id === activeTag ? '#fff' : t.color }}
              />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
