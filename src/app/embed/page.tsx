import { createClient } from '@/lib/supabase/server'

interface EmbedPageProps {
  searchParams: Promise<{
    board?: string
    project?: string
    limit?: string
    theme?: string
  }>
}

interface EmbedItem {
  id: string
  slug: string
  title: string
  total_votes: number
  board: { name: string; color: string } | null
}

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const params = await searchParams
  const limit = Math.min(Number(params.limit ?? 10), 50)
  const theme = params.theme ?? 'light'

  const supabase = await createClient()
  let query = supabase
    .from('items')
    .select('id, slug, title, total_votes, board:boards(name, color)')
    .eq('is_private', false)
    .order('total_votes', { ascending: false })
    .limit(limit)

  if (params.board) query = query.eq('board_id', params.board)
  if (params.project) query = query.eq('project_id', params.project)

  const { data } = await query
  const items = (data as unknown as EmbedItem[]) ?? []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const isDark = theme === 'dark'
  const bg = isDark ? '#09090b' : '#ffffff'
  const fg = isDark ? '#fafafa' : '#09090b'
  const border = isDark ? '#27272a' : '#e4e4e7'
  const muted = isDark ? '#71717a' : '#71717a'
  const primary = '#6366f1'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>Roadmap</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: ${bg};
            color: ${fg};
            font-size: 13px;
            line-height: 1.5;
          }
          .list { display: flex; flex-direction: column; gap: 1px; }
          .item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-bottom: 1px solid ${border};
            text-decoration: none;
            color: ${fg};
            transition: background .15s;
          }
          .item:hover { background: ${isDark ? '#18181b' : '#f4f4f5'}; }
          .vote {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 40px;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1.5px solid ${border};
            font-weight: 700;
            font-size: 12px;
            gap: 1px;
          }
          .vote-arrow { font-size: 10px; color: ${muted}; }
          .title { flex: 1; font-size: 13px; }
          .board {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 999px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            padding: 8px;
            border-top: 1px solid ${border};
          }
          .footer a {
            font-size: 11px;
            color: ${muted};
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .footer a:hover { color: ${primary}; }
        `}</style>
      </head>
      <body>
        <div className="list">
          {items.map(item => (
            <a
              key={item.id}
              href={`${appUrl}/en/items/${item.slug}`}
              target="_top"
              className="item"
            >
              <div className="vote">
                <span className="vote-arrow">▲</span>
                <span>{item.total_votes}</span>
              </div>
              <span className="title">{item.title}</span>
              {item.board && (
                <span
                  className="board"
                  style={{
                    backgroundColor: `${item.board.color}22`,
                    color: item.board.color,
                  }}
                >
                  {item.board.name}
                </span>
              )}
            </a>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: muted }}>
              No items yet.
            </div>
          )}
        </div>
        <div className="footer">
          <a href={`${appUrl}/en`} target="_blank" rel="noopener">
            🗺️ Powered by Roadmap
          </a>
        </div>
      </body>
    </html>
  )
}
