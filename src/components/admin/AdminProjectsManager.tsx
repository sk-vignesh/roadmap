'use client'

import { useState, useTransition } from 'react'
import { createProject, deleteProject } from '@/app/actions/admin'
import { Trash2, Plus, Lock, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  slug: string
  name: string
  description: string | null
  is_private: boolean
  color: string | null
  github_owner: string | null
  github_repo: string | null
  created_at: string
}

export function AdminProjectsManager({ projects: initial }: { projects: Project[] }) {
  const [projects, setProjects] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return
    startTransition(() => deleteProject(id))
    setProjects(p => p.filter(x => x.id !== id))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createProject(fd)
      if (!result?.error) {
        setShowForm(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Project</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">GitHub</th>
              <th className="text-center px-4 py-3 font-medium w-20">Private</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{p.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {p.github_owner && p.github_repo ? (
                    <a
                      href={`https://github.com/${p.github_owner}/${p.github_repo}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {p.github_owner}/{p.github_repo}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {p.is_private ? (
                    <Lock className="h-4 w-4 text-amber-500 mx-auto" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Public</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                  No projects yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3 max-w-lg">
          <h3 className="font-medium">New Project</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Name *</label>
              <input name="name" required placeholder="My Project" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Slug *</label>
              <input name="slug" required placeholder="my-project" className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description</label>
            <textarea name="description" rows={2} className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">GitHub Owner</label>
              <input name="github_owner" placeholder="org or user" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">GitHub Repo</label>
              <input name="github_repo" placeholder="repo-name" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_private" value="true" className="rounded" />
            <span className="text-sm">Private project</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">Create Project</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      )}
    </div>
  )
}
