import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Meeting } from '../types';
import { Database } from '../types/supabase';

type MeetingRow = Database['public']['Tables']['meetings']['Row'];
type SentimentEventRow = Database['public']['Tables']['sentiment_events']['Row'];

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        // Debug: Log Supabase client configuration
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

        const { data: meetingsData, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .order('date', { ascending: false });

        if (meetingsError) {
          console.error('Meetings fetch error:', meetingsError);
          throw meetingsError;
        }

        console.log('Fetched meetings:', meetingsData);

        const { data: sentimentData, error: sentimentError } = await supabase
          .from('sentiment_events')
          .select('*');

        if (sentimentError) {
          console.error('Sentiment events fetch error:', sentimentError);
          throw sentimentError;
        }

        console.log('Fetched sentiment events:', sentimentData);

        const meetingsWithEvents = meetingsData.map((meeting: MeetingRow) => ({
          id: meeting.id,
          clientName: meeting.client_name,
          date: meeting.date,
          meetingType: meeting.meeting_type,
          description: meeting.description,
          audioUrl: meeting.audio_url,
          transcript: meeting.transcript,
          summary: meeting.summary,
          sentiment: meeting.sentiment,
          sentimentEvents: sentimentData
            .filter((event: SentimentEventRow) => event.meeting_id === meeting.id)
            .map((event: SentimentEventRow) => ({
              timestamp: event.timestamp,
              event: event.event,
              sentiment: event.sentiment,
            })),
        }));

        setMeetings(meetingsWithEvents);
        setError(null);
      } catch (err) {
        console.error('Error in fetchMeetings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMeetings();
  }, []);

  return { meetings, loading, error };
}