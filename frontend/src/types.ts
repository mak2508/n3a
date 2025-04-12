export interface Meeting {
  id: string;
  clientName: string;
  date: string;
  meetingType: string;
  description: string;
  audioUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
  sentiment?: number | null;
  sentimentEvents?: SentimentEvent[];
}

export interface SentimentEvent {
  timestamp: string;
  event: string;
  sentiment: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  profession?: string | null;
  relationshipType: string;
  insights?: ClientInsight[];
}

export interface ClientInsight {
  id: string;
  clientId: string;
  category: string;
  insight: string;
  sourceMeetingId?: string | null;
}

export const MEETING_TYPES = [
  'Retirement Planning',
  'Investment Review',
  'Mortgage Consultation',
  'Wealth Management',
  'Tax Planning',
  'Estate Planning',
  'Insurance Review',
  'General Consultation'
] as const;