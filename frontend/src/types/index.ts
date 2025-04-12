export const MEETING_TYPES = [
    'Initial Consultation',
    'Follow-up',
    'Review',
    'Retirement Planning',
    'Investment Review',
    'Mortgage Consultation',
    'Wealth Management',
    'Tax Planning',
    'Estate Planning',
    'Insurance Review',
    'General Consultation',
    'Strategy Session',
    'Other'
] as const;

export type MeetingType = typeof MEETING_TYPES[number];

export interface SentimentEvent {
    timestamp: string;
    event: string;
    sentiment: number;
}

// Base interface for common fields
interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface Meeting extends BaseEntity {
    client_name: string;
    date: string;
    meeting_type: MeetingType;  // Now using the union type
    description: string;
    audio_url: string | null;
    transcript: string | null;
    summary: string | null;
    sentiment: number | null;
    sentiment_events: SentimentEvent[];
}

export interface MeetingUpdate {
    date: string;
    meeting_type: MeetingType;
    description: string;
    audio_url?: string | null;
}

export interface Client extends BaseEntity {
    name: string;
    email: string | null;
    phone: string | null;
    date_of_birth: string | null;
    profession: string | null;
    relationship_type: string;
    insights: ClientInsight[];
}

export interface ClientInsight extends BaseEntity {
    client_id: string;
    category: string;
    insight: string;
    source_meeting_id: string | null;
}

export interface Insight extends BaseEntity {
    client_id: string;
    title: string;
    description: string;
} 