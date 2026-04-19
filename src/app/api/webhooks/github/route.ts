import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Inbound webhook from GitHub (issues events)
 */
export async function POST(req: NextRequest) {
  const event = req.headers.get('x-github-event')
  if (!event) return NextResponse.json({ error: 'Not a GitHub webhook' }, { status: 400 })

  const ghSecret = process.env.GITHUB_WEBHOOK_SECRET
  if (ghSecret) {
    const sig = req.headers.get('x-hub-signature-256')
    if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    // Full HMAC-SHA256 signature verification would be added here for production
  }

  const body = await req.json()

  if (event === 'issues' && body.action === 'closed') {
    const issueNumber = body.issue?.number as number | undefined
    if (issueNumber) {
      const supabase = await createClient()
      const { data: completedBoard } = await supabase
        .from('boards')
        .select('id')
        .ilike('name', '%complete%')
        .limit(1)
        .single()

      if (completedBoard) {
        await supabase
          .from('items')
          .update({ board_id: completedBoard.id })
          .eq('issue_number', issueNumber)
      }
    }
  }

  return NextResponse.json({ received: true })
}
