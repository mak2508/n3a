import { useState, useEffect } from 'react';
import { Meeting, MeetingResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/meetings`);
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }
        const data: MeetingResponse[] = await response.json();
        setMeetings(data as unknown as Meeting[]);
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