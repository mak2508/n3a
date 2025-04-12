import { useState, useEffect } from 'react';
import { Meeting } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        console.log('Fetching meetings from:', `${API_URL}/api/meetings`);
        const response = await fetch(`${API_URL}/api/meetings`);
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data = await response.json();
        console.log('Raw meetings data:', JSON.stringify(data, null, 2));
        
        // Transform snake_case to camelCase
        const transformedData = data.map((meeting: any) => {
          const transformed = {
            id: meeting.id,
            clientName: meeting.client_name,
            date: meeting.date,
            meetingType: meeting.meeting_type,
            description: meeting.description,
            audioUrl: meeting.audio_url,
            transcript: meeting.transcript,
            summary: meeting.summary,
            sentiment: meeting.sentiment,
            sentimentEvents: meeting.sentiment_events
          };
          console.log('Individual transformed meeting:', JSON.stringify(transformed, null, 2));
          return transformed;
        });
        
        console.log('Final transformed meetings:', JSON.stringify(transformedData, null, 2));
        setMeetings(transformedData);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    try {
      const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting');
      }

      const updatedMeeting = await response.json();
      setMeetings(meetings.map(m => m.id === meetingId ? updatedMeeting : m));
    } catch (err) {
      console.error('Error updating meeting:', err);
      throw err;
    }
  };

  return { meetings, loading, error, updateMeeting };
};