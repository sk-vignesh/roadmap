import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { VoteButton } from '@/components/public/VoteButton'
import { CommentForm } from '@/components/public/CommentForm'
import { TagBadge } from '@/components/public/TagBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Calendar } from 'lucide-react'

interface ItemPageProps {
  params: Promise<{ locale: string; slug: string }>
}

interface CommentRow {
  id: string
  content: string
  total_votes: number
  is_pinned: boolean
  parent_id: string | null
  created_at: string
  user: { id: string; name: string | null; avatar_url: string | null; email: string } | null
}

interface TagRow { id: string; name: string; color: string }
interface ItemDetail {
  id: string
  slug: string
  title: string
  description: string | null
  total_votes: number
  is_pinned: boolean
  is_private: boolean
  issue_number: number | null
  created_at: string
  horizon: string | null
  quarter: string | null
  board: { id: string; name: string; color: string } | null
  project: { id: string; name: string; slug: string } | null
  author: { id: string; name: string | null; avatar_url: string | null; email: string } | null
  item_tags: { tag: TagRow | null }[]
}

export async function generateMetadata({ params }: ItemPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('items')
    .select('title, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Not Found' }
  return {
    title: data.title,
    description: (data.description ?? '').slice(0, 160),
  }
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const user = await getUser()

  const { data: rawItem } = await supabase
    .from('items')
    .select(`
      id, slug, title, description, total_votes, is_pinned, is_private, issue_number, created_at,
      horizon, quarter,
      board:boards(id, name, color),
      project:projects(id, name, slug),
      author:profiles!items_user_id_fkey(id, name, avatar_url, email),
      item_tags(tag:tags(id, name, color))
    `)
    .eq('slug', slug)
    .single()

  if (!rawItem) notFound()
  const item = rawItem as unknown as ItemDetail

  // Fetch comments
  const { data: rawComments } = await supabase
    .from('comments')
    .select(`
      id, content, total_votes, is_pinned, parent_id, created_at,
      user:profiles!comments_user_id_fkey(id, name, avatar_url, email)
    `)
    .eq('item_id', item.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })

  const comments = (rawComments as unknown as CommentRow[]) ?? []

  // Check if user has voted
  let hasVoted = false
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('id')
      .eq('item_id', item.id)
      .eq('user_id', user.id)
      .single()
    hasVoted = !!vote
  }

  const topLevelComments = comments.filter(c => !c.parent_id)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back link */}
      <a
        href="/en"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to roadmap
      </a>

      {/* Item header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <VoteButton
            itemId={item.id}
            itemSlug={item.slug}
            totalVotes={item.total_votes}
            hasVoted={hasVoted}
            disabled={!user}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {item.board && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${item.board.color}20`, color: item.board.color }}
                >
                  {item.board.name}
                </span>
              )}
              {item.horizon && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  item.horizon === 'now'  ? 'bg-emerald-500/10 text-emerald-600' :
                  item.horizon === 'next' ? 'bg-blue-500/10 text-blue-600' :
                  'bg-violet-500/10 text-violet-600'
                }`}>
                  {item.horizon === 'now' ? 'Now' : item.horizon === 'next' ? 'Next' : `Later${item.quarter ? ` · ${item.quarter}` : ''}`}
                </span>
              )}
              {item.project && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {item.project.name}
                </span>
              )}
              {item.issue_number && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#24292f] text-white font-mono">
                  #{item.issue_number}
                </span>
              )}
              {(item.item_tags ?? []).map(it => it.tag).filter(Boolean).map(tag => (
                <TagBadge key={tag!.id} name={tag!.name} color={tag!.color} />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/50 border p-4">
            <p className="whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-4">
          {item.author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={item.author.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {(item.author.name ?? item.author.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{item.author.name ?? item.author.email}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{comments.length} comments</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        <h2 className="font-semibold text-lg">Comments</h2>

        {user ? (
          <CommentForm itemId={item.id} itemSlug={item.slug} />
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            <a href="/en/login" className="text-primary hover:underline">Sign in</a> to leave a comment
          </div>
        )}

        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(comment.user?.name ?? comment.user?.email ?? 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.user?.name ?? comment.user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
                {/* Replies */}
                {comments
                  .filter(r => r.parent_id === comment.id)
                  .map(reply => (
                    <div key={reply.id} className="ml-11 flex gap-3">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarImage src={reply.user?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {(reply.user?.name ?? reply.user?.email ?? 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {reply.user?.name ?? reply.user?.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5 whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
