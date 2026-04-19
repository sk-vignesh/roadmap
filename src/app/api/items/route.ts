import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 50)
  const boardId = searchParams.get('board')
  const projectId = searchParams.get('project')

  const supabase = await createClient()
  let query = supabase
    .from('items')
    .select('id, slug, title, total_votes, board:boards(name, color)')
    .eq('is_private', false)
    .order('total_votes', { ascending: false })
    .limit(limit)

  if (boardId) query = query.eq('board_id', boardId)
  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ items: data }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
