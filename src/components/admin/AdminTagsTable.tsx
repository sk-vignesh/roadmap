'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { createTag, updateTag, deleteTag } from '@/app/actions/tags'
import { Tag, Trash2, Pencil, Check, X, FileText, Plus } from 'lucide-react'

interface TagRow {
  id: string
  name: string
  slug: string
  color: string
  is_changelog_tag: boolean
  item_count: number
}

interface AdminTagsTableProps {
  tags: TagRow[]
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#a16207',
]

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full flex-none border"
      style={{ backgroundColor: color, borderColor: `${color}80` }}
    />
  )
}

function EditRow({ tag, onDone }: { tag: TagRow; onDone: () => void }) {
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)
  const [isChangelog, setIsChangelog] = useState(tag.is_changelog_tag)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      await updateTag(tag.id, { name, color, is_changelog_tag: isChangelog })
      onDone()
    })
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-4 py-3" colSpan={4}>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-2 py-1 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring w-40"
          />
          {/* Presets */}
          <div className="flex gap-1 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'scale-110 border-foreground' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {/* Native color input for custom colors */}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="h-7 w-7 rounded cursor-pointer border"
            title="Custom color"
          />
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChangelog}
              onChange={e => setIsChangelog(e.target.checked)}
              className="rounded"
            />
            Changelog tag
          </label>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={save}
              disabled={pending || !name.trim()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> Save
            </button>
            <button
              onClick={onDone}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border hover:bg-accent"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

function CreateRow({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [isChangelog, setIsChangelog] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createTag({ name: name.trim(), color, is_changelog_tag: isChangelog })
      if (res?.error) { setError(res.error); return }
      setName('')
      setColor('#6366f1')
      setIsChangelog(false)
      onCreated()
      inputRef.current?.focus()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border bg-card">
      <Plus className="h-4 w-4 text-muted-foreground flex-none" />
      <input
        ref={inputRef}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="New tag name..."
        className="px-2 py-1 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring w-44"
      />
      <div className="flex gap-1 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'scale-110 border-foreground' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <input
        type="color"
        value={color}
        onChange={e => setColor(e.target.value)}
        className="h-7 w-7 rounded cursor-pointer border"
        title="Custom color"
      />
      <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
        <input type="checkbox" checked={isChangelog} onChange={e => setIsChangelog(e.target.checked)} className="rounded" />
        Changelog tag
      </label>
      <button
        onClick={submit}
        disabled={pending || !name.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ml-auto"
      >
        <Plus className="h-3.5 w-3.5" /> Create tag
      </button>
      {error && <p className="text-xs text-destructive w-full">{error}</p>}
    </div>
  )
}

export function AdminTagsTable({ tags }: AdminTagsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [key, setKey] = useState(0) // force re-render after create

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete tag "${name}"? It will be removed from all items.`)) return
    startTransition(() => { void deleteTag(id) })
  }

  return (
    <div className="space-y-4" key={key}>
      <CreateRow onCreated={() => setKey(k => k + 1)} />

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tag</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Slug</th>
              <th className="text-center px-4 py-3 font-medium w-20">Items</th>
              <th className="text-center px-4 py-3 font-medium w-28 hidden md:table-cell">Type</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {tags.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  No tags yet — create one above.
                </td>
              </tr>
            )}
            {tags.map(tag => (
              <>
                <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ColorDot color={tag.color} />
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">
                    {tag.slug}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{tag.item_count}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {tag.is_changelog_tag ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full">
                        <FileText className="h-3 w-3" /> Changelog
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" /> Item
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingId(editingId === tag.id ? null : tag.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {editingId === tag.id && (
                  <EditRow key={`edit-${tag.id}`} tag={tag} onDone={() => setEditingId(null)} />
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
