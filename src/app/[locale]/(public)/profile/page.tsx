import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VoteButton } from '@/components/public/VoteButton'
import Link from 'next/link'

export const metadata = { title: 'My Profile' }

interface ProfileItem {
  id: string
  title: string
  slug: string
  total_votes: number
  board: { name: string; color: string } | null
  created_at: string
}

interface VoteItem {
  item: {
    id: string
    title: string
    slug: string
    total_votes: number
    board: { name: string; color: string } | null
  } | null
}

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect('/en/login')

  const supabase = await createClient()

  const [profileRes, submittedRes, votedRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('items')
      .select('id, title, slug, total_votes, board:boards(name, color), created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('votes')
      .select('item:items(id, title, slug, total_votes, board:boards(name, color))')
      .eq('user_id', user.id)
      .limit(20),
  ])

  const profile = profileRes.data
  const submitted = (submittedRes.data as unknown as ProfileItem[]) ?? []
  const voted = (votedRes.data as unknown as VoteItem[]) ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile header */}
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">
            {(profile?.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.name ?? 'Your Profile'}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <span className="inline-flex mt-1 items-center text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
            {profile?.role ?? 'user'}
          </span>
        </div>
      </div>

      {/* Submitted items */}
      <div className="space-y-3">
        <h2 className="font-semibold">Your Submissions ({submitted.length})</h2>
        {submitted.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't submitted any items yet.</p>
        ) : (
          <div className="space-y-2">
            {submitted.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <VoteButton
                  itemId={item.id}
                  itemSlug={item.slug}
                  totalVotes={item.total_votes}
                  hasVoted={false}
                  disabled
                />
                <div className="flex-1 min-w-0">
                  <Link href={`/en/items/${item.slug}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                    {item.title}
                  </Link>
                  {item.board && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                      style={{ backgroundColor: `${item.board.color}20`, color: item.board.color }}
                    >
                      {item.board.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voted items */}
      <div className="space-y-3">
        <h2 className="font-semibold">Items You've Voted For ({voted.length})</h2>
        {voted.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't voted on any items yet.</p>
        ) : (
          <div className="space-y-2">
            {voted.filter(v => v.item).map(v => {
              const item = v.item!
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <VoteButton
                    itemId={item.id}
                    itemSlug={item.slug}
                    totalVotes={item.total_votes}
                    hasVoted={true}
                    disabled
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/en/items/${item.slug}`} className="text-sm font-medium hover:text-primary transition-colors truncate block">
                      {item.title}
                    </Link>
                    {item.board && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block"
                        style={{ backgroundColor: `${item.board.color}20`, color: item.board.color }}
                      >
                        {item.board.name}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
