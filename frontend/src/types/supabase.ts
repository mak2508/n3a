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
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          profession: string | null
          relationship_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          profession?: string | null
          relationship_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          profession?: string | null
          relationship_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      client_insights: {
        Row: {
          id: string
          client_id: string
          category: string
          insight: string
          source_meeting_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          category: string
          insight: string
          source_meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          category?: string
          insight?: string
          source_meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          client_name: string
          date: string
          meeting_type: string
          description: string
          audio_url: string | null
          transcript: string | null
          summary: string | null
          sentiment: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          date: string
          meeting_type: string
          description: string
          audio_url?: string | null
          transcript?: string | null
          summary?: string | null
          sentiment?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          date?: string
          meeting_type?: string
          description?: string
          audio_url?: string | null
          transcript?: string | null
          summary?: string | null
          sentiment?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sentiment_events: {
        Row: {
          id: string
          meeting_id: string
          timestamp: string
          event: string
          sentiment: number
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          timestamp: string
          event: string
          sentiment: number
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          timestamp?: string
          event?: string
          sentiment?: number
          created_at?: string
        }
      }
    }
  }
}