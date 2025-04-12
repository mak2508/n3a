import { useState, useEffect } from 'react';
import { Meeting, MEETING_TYPES } from '../types';
import { formatDate } from '../utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState<Meeting | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Format the date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

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

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    // Reset save status after 3 seconds
    if (saveStatus === 'success' || saveStatus === 'error') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

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

  const handleEdit = () => {
    setEditedMeeting(selectedMeeting);
    setIsEditing(true);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!editedMeeting) return;
    
    setSaveStatus('saving');
    
    try {
      console.log('Updating meeting with data:', {
        id: editedMeeting.id,
        date: editedMeeting.date,
        meeting_type: editedMeeting.meeting_type,
        description: editedMeeting.description
      });
      
      // Update the meeting using our backend API
      const response = await fetch(`${API_URL}/api/meetings/${editedMeeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editedMeeting.date,
          meeting_type: editedMeeting.meeting_type,
          description: editedMeeting.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting');
      }

      const updatedData = await response.json();
      console.log('Update response from API:', updatedData);
      
      // Refresh the meetings list
      await fetchMeetings();
      
      // Get the updated meeting from the refreshed list
      const updatedMeeting = meetings.find(m => m.id === editedMeeting.id) || editedMeeting;
      
      // Update the selected meeting
      setSelectedMeeting(updatedMeeting);
      setIsEditing(false);
      setSaveStatus('success');
      
    } catch (err) {
      console.error('Error updating meeting:', err);
      setSaveStatus('error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMeeting(null);
    setSaveStatus('idle');
  };

  // Function to handle date change that properly preserves time
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedMeeting) return;
    
    const newDateValue = e.target.value; // Format: YYYY-MM-DDThh:mm
    
    // Ensure we have a valid date string with time
    if (newDateValue) {
      try {
        // Make sure the date is in the correct ISO format for the database
        const dateObj = new Date(newDateValue);
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date value:', newDateValue);
          return;
        }
        
        setEditedMeeting({
          ...editedMeeting,
          date: dateObj.toISOString(),
        });
      } catch (err) {
        console.error('Error processing date:', err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meetings</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <tr 
                key={meeting.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMeeting(meeting)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{meeting.client_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(meeting.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{meeting.meeting_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {meeting.sentiment && (
                    <div 
                      className="px-3 py-1 inline-flex text-sm font-medium rounded-full"
                      style={{
                        backgroundColor: `rgb(${255 - meeting.sentiment * 2.55}, ${
                          meeting.sentiment * 2.55
                        }, 0)`,
                        color: meeting.sentiment > 50 ? 'white' : 'black',
                      }}
                    >
                      {meeting.sentiment}%
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">Meeting Details</h2>
                <button
                  onClick={() => {
                    setSelectedMeeting(null);
                    setIsEditing(false);
                    setSaveStatus('idle');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Client Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedMeeting.client_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    {isEditing ? (
                      <div>
                        <input
                          type="datetime-local"
                          value={editedMeeting ? formatDateForInput(editedMeeting.date) : ''}
                          onChange={handleDateChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Click the calendar icon to select date and use the time input to set the time
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedMeeting.date)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Meeting Type</h3>
                    {isEditing ? (
                      <select
                        value={editedMeeting?.meeting_type || ''}
                        onChange={(e) => 
                          setEditedMeeting(prev => prev ? { ...prev, meeting_type: e.target.value } : null)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        {MEETING_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{selectedMeeting.meeting_type}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sentiment</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedMeeting.sentiment ? `${selectedMeeting.sentiment}%` : 'Not analyzed'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editedMeeting?.description || ''}
                      onChange={(e) => 
                        setEditedMeeting(prev => prev ? { ...prev, description: e.target.value } : null)
                      }
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{selectedMeeting.description}</p>
                  )}
                </div>

                {selectedMeeting.audio_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Audio Recording</h3>
                    <div className="mt-2 bg-gray-100 rounded p-3">
                      <audio controls className="w-full">
                        <source src={selectedMeeting.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}

                {selectedMeeting.transcript && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Transcript</h3>
                    <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{selectedMeeting.transcript}</p>
                    </div>
                  </div>
                )}

                {selectedMeeting.summary && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Summary</h3>
                    <div className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{selectedMeeting.summary}</p>
                    </div>
                  </div>
                )}

                {selectedMeeting.sentiment_events && selectedMeeting.sentiment_events.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sentiment Events</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sentiment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedMeeting.sentiment_events.map((event, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {event.timestamp}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {event.event}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {event.sentiment}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      disabled={saveStatus === 'saving'}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 ${saveStatus === 'saving' ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md flex items-center`}
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    {saveStatus === 'success' && (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md mr-2">
                        Changes saved successfully!
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="px-4 py-2 bg-red-100 text-red-800 rounded-md mr-2">
                        Error saving changes
                      </div>
                    )}
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Meeting
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 