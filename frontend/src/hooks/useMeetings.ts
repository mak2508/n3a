import { useEffect, useState, useCallback } from 'react';
import { Meeting } from '../types';
import { supabase } from '../lib/supabase';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (meetingsError) throw meetingsError;

      // Fetch sentiment events
      const { data: sentimentData, error: sentimentError } = await supabase
        .from('sentiment_events')
        .select('*');

      if (sentimentError) throw sentimentError;

      // Transform the data to match our frontend types
      const meetingsWithEvents = meetingsData.map((meeting) => ({
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
          .filter((event) => event.meeting_id === meeting.id)
          .map((event) => ({
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
  }, []);

  // Function to manually refresh meetings data
  const refreshMeetings = useCallback(() => {
    return fetchMeetings();
  }, [fetchMeetings]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refreshMeetings };
}