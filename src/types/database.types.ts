
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          plan: 'free' | 'pro'
          status: 'active' | 'inactive' | 'banned'
          joined_at: string
          subscription_ends_at: string | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          plan?: 'free' | 'pro'
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          date: string
          sport: string
          market: string
          selection: string
          odds: number
          stake_units: number
          result: 'PENDING' | 'WIN' | 'LOSS' | 'VOID'
          profit_units: number | null
          analysis: string | null
          link: string | null
          confidence: number | null
          sent_to_group: boolean
          tip_type: 'free' | 'pro' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bets']['Insert']>
      }
      bankroll_settings: {
        Row: {
          user_id: string
          start_bankroll: number
          unit_divisor: number
          profit_goal: number
          updated_at: string
        }
        Insert: {
          user_id: string
          start_bankroll?: number
          unit_divisor?: number
          profit_goal?: number
        }
        Update: Partial<Omit<Database['public']['Tables']['bankroll_settings']['Insert'], 'user_id'>>
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          user_id: string
          text: string
        }
      }
    }
  }
}
