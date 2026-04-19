// Minimal Supabase database type overrides
// The full type file will be regenerated via `supabase gen types` after connecting CLI.
// For now, we cast via `any` in actions to avoid `never` on tables not in the schema file.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> }
      projects: { Row: ProjectRow; Insert: Partial<ProjectRow>; Update: Partial<ProjectRow> }
      project_members: { Row: ProjectMemberRow; Insert: Partial<ProjectMemberRow>; Update: Partial<ProjectMemberRow> }
      boards: { Row: BoardRow; Insert: Partial<BoardRow>; Update: Partial<BoardRow> }
      tags: { Row: TagRow; Insert: Partial<TagRow>; Update: Partial<TagRow> }
      items: { Row: ItemRow; Insert: Partial<ItemRow>; Update: Partial<ItemRow> }
      item_tags: { Row: ItemTagRow; Insert: Partial<ItemTagRow>; Update: Partial<ItemTagRow> }
      item_users: { Row: ItemUserRow; Insert: Partial<ItemUserRow>; Update: Partial<ItemUserRow> }
      votes: { Row: VoteRow; Insert: Partial<VoteRow>; Update: Partial<VoteRow> }
      comments: { Row: CommentRow; Insert: Partial<CommentRow>; Update: Partial<CommentRow> }
      comment_votes: { Row: CommentVoteRow; Insert: Partial<CommentVoteRow>; Update: Partial<CommentVoteRow> }
      changelogs: { Row: ChangelogRow; Insert: Partial<ChangelogRow>; Update: Partial<ChangelogRow> }
      changelog_items: { Row: ChangelogItemRow; Insert: Partial<ChangelogItemRow>; Update: Partial<ChangelogItemRow> }
      mentions: { Row: MentionRow; Insert: Partial<MentionRow>; Update: Partial<MentionRow> }
      activity_log: { Row: ActivityLogRow; Insert: Partial<ActivityLogRow>; Update: Partial<ActivityLogRow> }
      settings: { Row: SettingRow; Insert: Partial<SettingRow>; Update: Partial<SettingRow> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface ProfileRow {
  id: string
  username: string | null
  name: string | null
  email: string
  role: 'admin' | 'employee' | 'user'
  locale: string | null
  date_locale: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  slug: string
  name: string
  description: string | null
  is_private: boolean
  color: string | null
  icon: string | null
  github_repo: string | null
  github_owner: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectMemberRow {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

export interface BoardRow {
  id: string
  project_id: string | null
  name: string
  color: string
  sort_order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface TagRow {
  id: string
  name: string
  slug: string
  type: string | null
  order_column: number | null
  is_changelog_tag: boolean
  created_at: string
}

export interface ItemRow {
  id: string
  slug: string
  title: string
  description: string | null
  user_id: string | null
  project_id: string | null
  board_id: string | null
  is_private: boolean
  is_pinned: boolean
  total_votes: number
  issue_number: number | null
  notify_subscribers: boolean
  created_at: string
  updated_at: string
}

export interface ItemTagRow {
  item_id: string
  tag_id: string
}

export interface ItemUserRow {
  item_id: string
  user_id: string
}

export interface VoteRow {
  id: string
  item_id: string
  user_id: string
  subscribed: boolean
  created_at: string
}

export interface CommentRow {
  id: string
  item_id: string
  user_id: string
  parent_id: string | null
  content: string
  total_votes: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface CommentVoteRow {
  id: string
  comment_id: string
  user_id: string
  created_at: string
}

export interface ChangelogRow {
  id: string
  slug: string
  title: string
  content: string | null
  user_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ChangelogItemRow {
  changelog_id: string
  item_id: string
}

export interface MentionRow {
  id: string
  mentionable_type: string
  mentionable_id: string
  mentioned_id: string
  mentioner_id: string
  created_at: string
}

export interface ActivityLogRow {
  id: string
  subject_type: string
  subject_id: string
  causer_id: string | null
  event: string
  properties: Json
  created_at: string
}

export interface SettingRow {
  id: string
  group: string
  name: string
  value: Json | null
  created_at: string
  updated_at: string
}
