// Generated types will be replaced after running:
// npx supabase gen types typescript --project-id tyhilpsksbhudbevfwui > src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      projects: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      boards: {
        Row: {
          id: string
          project_id: string | null
          name: string
          color: string
          sort_order: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['boards']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['boards']['Insert']>
      }
      items: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_votes'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      votes: {
        Row: {
          id: string
          item_id: string
          user_id: string
          subscribed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
      }
      comments: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_votes'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          type: string | null
          order_column: number | null
          is_changelog_tag: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tags']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tags']['Insert']>
      }
      changelogs: {
        Row: {
          id: string
          slug: string
          title: string
          content: string | null
          user_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['changelogs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['changelogs']['Insert']>
      }
      settings: {
        Row: {
          id: string
          group: string
          name: string
          value: unknown
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      activity_log: {
        Row: {
          id: string
          subject_type: string
          subject_id: string
          causer_id: string | null
          event: string
          properties: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_log']['Insert']>
      }
      mentions: {
        Row: {
          id: string
          mentionable_type: string
          mentionable_id: string
          mentioned_id: string
          mentioner_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mentions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mentions']['Insert']>
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['project_members']['Insert']>
      }
      item_tags: {
        Row: { item_id: string; tag_id: string }
        Insert: Database['public']['Tables']['item_tags']['Row']
        Update: Partial<Database['public']['Tables']['item_tags']['Row']>
      }
      item_users: {
        Row: { item_id: string; user_id: string }
        Insert: Database['public']['Tables']['item_users']['Row']
        Update: Partial<Database['public']['Tables']['item_users']['Row']>
      }
      comment_votes: {
        Row: { id: string; comment_id: string; user_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['comment_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comment_votes']['Insert']>
      }
      changelog_items: {
        Row: { changelog_id: string; item_id: string }
        Insert: Database['public']['Tables']['changelog_items']['Row']
        Update: Partial<Database['public']['Tables']['changelog_items']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
