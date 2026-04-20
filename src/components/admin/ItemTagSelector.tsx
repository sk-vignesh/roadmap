'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { setItemTags } from '@/app/actions/tags'
import { Plus } from 'lucide-react'

export interface Tag {
  id: string
  name: string
  color: string
}

interface ItemTagSelectorProps {
  itemId: string
  initialTagIds: string[]
  allTags: Tag[]
}

export function ItemTagSelector({ itemId, initialTagIds, allTags }: ItemTagSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialTagIds))
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function toggle(tagId: string) {
    const next = new Set(selected)
    if (next.has(tagId)) next.delete(tagId)
    else next.add(tagId)
    setSelected(next)
    startTransition(() => { void setItemTags(itemId, [...next]) })
  }

  const selectedTags = allTags.filter(t => selected.has(t.id))

  return (
    <div ref={ref} className={`relative min-w-[120px] ${isPending ? 'opacity-60' : ''}`}>
      <div
        className="flex flex-wrap gap-1 items-center cursor-pointer min-h-[28px]"
        onClick={() => setOpen(v => !v)}
      >
        {selectedTags.length === 0 ? (
          <span className="text-xs text-muted-foreground/60 italic">No tags</span>
        ) : (
          selectedTags.map(tag => (
            <span
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))
        )}
        <span className="ml-auto text-muted-foreground hover:text-foreground">
          <Plus className="h-3 w-3" />
        </span>
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-popover border rounded-lg shadow-xl p-1.5 min-w-[160px] max-h-[220px] overflow-y-auto">
          {allTags.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-1.5">
              No tags yet — create them in Tags admin.
            </p>
          ) : (
            allTags.map(tag => (
              <label
                key={tag.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(tag.id)}
                  onChange={() => toggle(tag.id)}
                  className="rounded"
                />
                <span
                  className="h-2 w-2 rounded-full flex-none"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs">{tag.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
