export interface Meeting {
  id: string;
  clientName: string;
  date: string;
  meetingType: string;
  description: string;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  sentiment?: number;
  sentimentEvents?: SentimentEvent[];
}

export interface SentimentEvent {
  timestamp: string;
  event: string;
  sentiment: number;
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