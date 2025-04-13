import { useState, useEffect } from 'react';
import { Meeting } from '../types';
import { MeetingList } from '../components/MeetingList';
import { MeetingDetails } from '../components/MeetingDetails';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/meetings`);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshMeetings = async () => {
    await fetchMeetings();

     // Get the updated meeting from the refreshed list
     const updatedMeeting = meetings.find((m) => m.id === selectedMeeting?.id) || selectedMeeting;
     setSelectedMeeting(updatedMeeting);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meetings</h1>
      
      <MeetingList meetings={meetings} onSelectMeeting={(meeting) => setSelectedMeeting(meeting)} />

      {selectedMeeting && (
        <MeetingDetails meeting={selectedMeeting} setSelectedMeeting={setSelectedMeeting} refreshMeetings={refreshMeetings} />
      )}
    </div>
  );
} 