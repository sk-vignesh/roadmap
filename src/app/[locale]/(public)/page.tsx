import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { ItemFilters } from '@/components/public/ItemFilters'
import { VoteButton } from '@/components/public/VoteButton'
import { CreateItemForm } from '@/components/public/CreateItemForm'
import { KanbanBoard } from '@/components/public/KanbanBoard'
import Link from 'next/link'
import { LayoutList, LayoutGrid } from 'lucide-react'

interface HomePageProps {
  searchParams: Promise<{
    board?: string
    project?: string
    sort?: string
    suggest?: string
    view?: string
  }>
}

interface BoardRow { id: string; name: string; color: string }
interface ProjectRow { id: string; name: string; slug: string }
interface VoteRow { item_id: string }
interface ItemRow {
  id: string
  title: string
  slug: string
  total_votes: number
  is_pinned: boolean
  board: BoardRow | null
  project: ProjectRow | null
  created_at: string
}

export async function generateMetadata() {
  return { title: 'Roadmap', description: 'Vote for features and track our public roadmap.' }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const user = await getUser()

  const isBoardView = params.view === 'board'
  const showSuggestForm = params.suggest === '1'

  // Fetch boards and projects
  const [boardsRes, projectsRes] = await Promise.all([
    supabase.from('boards').select('id, name, color').order('sort_order'),
    supabase.from('projects').select('id, name, slug').eq('is_private', false).order('sort_order'),
  ])

  const boards = (boardsRes.data ?? []) as BoardRow[]
  const projects = (projectsRes.data ?? []) as ProjectRow[]

  // Build items query
  let query = supabase
    .from('items')
    .select('id, title, slug, total_votes, is_pinned, board:boards(id,name,color), project:projects(id,name,slug), created_at')
    .eq('is_private', false)

  if (params.board) query = query.eq('board_id', params.board)
  if (params.project) query = query.eq('project_id', params.project)
  if (params.sort === 'new') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('is_pinned', { ascending: false }).order('total_votes', { ascending: false })
  }

  const { data: rawItems } = await query.limit(200)
  const items = (rawItems as unknown as ItemRow[]) ?? []

  // Fetch user votes
  let votedItemIds: string[] = []
  if (user) {
    const { data: votes } = await supabase
      .from('votes')
      .select('item_id')
      .eq('user_id', user.id)
    votedItemIds = (votes as VoteRow[] ?? []).map(v => v.item_id)
  }

  const votedSet = new Set(votedItemIds)

  // Build view toggle URLs (preserve other params)
  const listParams = new URLSearchParams()
  const boardParams = new URLSearchParams()
  if (params.board) { listParams.set('board', params.board); boardParams.set('board', params.board) }
  if (params.project) { listParams.set('project', params.project); boardParams.set('project', params.project) }
  if (params.sort) { listParams.set('sort', params.sort); boardParams.set('sort', params.sort) }
  boardParams.set('view', 'board')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
          <p className="text-muted-foreground mt-1">
            Vote for features and help shape what we build next.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Link
              href={`?${listParams.toString()}`}
              className={`p-2 transition-colors ${
                !isBoardView
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </Link>
            <Link
              href={`?${boardParams.toString()}`}
              className={`p-2 transition-colors ${
                isBoardView
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
              title="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Link>
          </div>

          {user && !showSuggestForm && (
            <Link
              href={`?suggest=1${isBoardView ? '&view=board' : ''}`}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + Suggest
            </Link>
          )}
        </div>
      </div>

      {/* Create form */}
      {showSuggestForm && user && (
        <CreateItemForm projects={projects} />
      )}

      {/* Filters (only in list view) */}
      {!isBoardView && (
        <ItemFilters boards={boards} projects={projects} />
      )}

      {/* Views */}
      {isBoardView ? (
        <KanbanBoard
          boards={boards}
          items={items}
          votedItemIds={votedItemIds}
          isLoggedIn={!!user}
        />
      ) : (
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border rounded-xl">
              <p className="text-lg font-medium">No items yet</p>
              <p className="text-sm mt-1">
                {user ? (
                  <>Be the first to <Link href="?suggest=1" className="text-primary hover:underline">suggest a feature</Link>!</>
                ) : (
                  'Sign in to suggest a feature'
                )}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors group"
              >
                <VoteButton
                  itemId={item.id}
                  itemSlug={item.slug}
                  totalVotes={item.total_votes}
                  hasVoted={votedSet.has(item.id)}
                  disabled={!user}
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/en/items/${item.slug}`}
                    className="block font-medium group-hover:text-primary transition-colors truncate"
                  >
                    {item.is_pinned && (
                      <span className="mr-2 text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        Pinned
                      </span>
                    )}
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {item.board && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${item.board.color}20`, color: item.board.color }}
                      >
                        {item.board.name}
                      </span>
                    )}
                    {item.project && (
                      <span className="text-xs text-muted-foreground">
                        {item.project.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
