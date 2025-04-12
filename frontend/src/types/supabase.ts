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