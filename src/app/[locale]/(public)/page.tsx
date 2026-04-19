import { createClient } from '@/lib/supabase/server'

export async function generateMetadata() {
  return {
    title: 'Roadmap',
    description: 'Vote for features and track our public roadmap.',
  }
}

interface BoardInfo {
  name: string
  color: string
}

interface ItemRow {
  id: string
  title: string
  slug: string
  total_votes: number
  is_pinned: boolean
  board: BoardInfo | null
  created_at: string
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('items')
    .select('id, title, slug, total_votes, is_pinned, board:boards(name, color), created_at')
    .eq('is_private', false)
    .order('is_pinned', { ascending: false })
    .order('total_votes', { ascending: false })
    .limit(50)

  const items = (data as unknown as ItemRow[]) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground mt-2">
          Vote for features and help shape what we build next.
        </p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No items yet.</p>
            <p className="text-sm mt-1">Be the first to suggest a feature!</p>
          </div>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={`/en/items/${item.slug}`}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.is_pinned && (
                  <span className="shrink-0 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Pinned
                  </span>
                )}
                <span className="font-medium group-hover:text-primary transition-colors truncate">
                  {item.title}
                </span>
                {item.board && (
                  <span
                    className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${item.board.color}20`,
                      color: item.board.color,
                    }}
                  >
                    {item.board.name}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5 ml-4 shrink-0 min-w-[3rem]">
                <span className="text-sm font-bold">{item.total_votes}</span>
                <span className="text-xs text-muted-foreground">votes</span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
