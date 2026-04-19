'use client'

import { useState, useTransition } from 'react'
import { createBoard, updateBoard, deleteBoard } from '@/app/actions/admin'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface Board {
  id: string
  name: string
  color: string
  sort_order: number
  is_default: boolean
}

export function AdminBoardsManager({ boards: initial }: { boards: Board[] }) {
  const [boards, setBoards] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('name', name)
    fd.append('color', color)
    fd.append('sort_order', String(boards.length))
    startTransition(async () => {
      const result = await createBoard(fd)
      if (!result?.error) {
        setName('')
        setShowForm(false)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this board?')) return
    startTransition(() => deleteBoard(id))
    setBoards(b => b.filter(x => x.id !== id))
  }

  return (
    <div className="space-y-4 max-w-lg">
      {/* Existing boards */}
      <div className="rounded-xl border overflow-hidden divide-y">
        {boards.map(board => (
          <div key={board.id} className="flex items-center gap-3 px-4 py-3 bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: board.color }}
            />
            <span className="flex-1 font-medium text-sm">{board.name}</span>
            {board.is_default && (
              <span className="text-xs text-muted-foreground">default</span>
            )}
            <button
              onClick={() => handleDelete(board.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {boards.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No boards yet. Create one below.
          </div>
        )}
      </div>

      {/* Create form */}
      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-medium text-sm">New Board</h3>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Board name"
              required
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="h-8 w-12 rounded border cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Create Board
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Board
        </button>
      )}
    </div>
  )
}
