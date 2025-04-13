import React, { useState } from 'react';
import { Meeting, MEETING_TYPES } from '../types';
import { formatDate } from '../utils';
import { Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface MeetingDetailsProps {
  meeting: Meeting;
  onUpdate: (meeting: Meeting) => void;
}

export function MeetingDetails({ meeting, onUpdate }: MeetingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState<Meeting | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    progress: number;
    currentStep: 'uploading' | 'transcribing' | 'analyzing' | 'summarizing' | 'completed' | 'error';
  }>({
    isUploading: false,
    progress: 0,
    currentStep: 'uploading'
  });

  const handleSave = async () => {
    if (!editedMeeting) return;

    setSaveStatus('saving');
    try {
      const response = await fetch(`${API_URL}/api/meetings/${meeting.id}`, {
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

      const updatedMeeting = await response.json();
      onUpdate(updatedMeeting);
      setIsEditing(false);
      setSaveStatus('success');
    } catch (error) {
      console.error('Error:', error);
      setSaveStatus('error');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus({
        isUploading: true,
        progress: 0,
        currentStep: 'uploading'
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/meetings/${meeting.id}/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadStatus(prev => ({ ...prev, progress: 100, currentStep: 'completed' }));

      // Update the meeting with the new audio URL
      onUpdate({
        ...meeting,
        audio_url: data.url
      });

      // Reset upload status after a delay
      setTimeout(() => {
        setUploadStatus({
          isUploading: false,
          progress: 0,
          currentStep: 'uploading'
        });
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setUploadStatus(prev => ({
        ...prev,
        isUploading: false,
        currentStep: 'error'
      }));
    }
  };

  const renderHighlightedTranscript = () => {
    if (!meeting.transcript) return null;

    let lastIndex = 0;
    const segments = [];

    // Sort sentiment events by start_index to process them in order
    const sortedEvents = [...meeting.sentiment_events].sort((a, b) => a.start_index - b.start_index);

    console.log(sortedEvents);
    console.log(meeting.transcript);

    sortedEvents.forEach((event, index) => {
      // Add text before the sentiment event
      if (event.start_index > lastIndex) {
        segments.push(
          <span key={`text-${index}`}>
            {meeting.transcript!.slice(lastIndex, event.start_index)}
          </span>
        );
      }

      // Add the highlighted sentiment event
      const sentimentValue = parseInt(event.sentiment);
      const backgroundColor = sentimentValue > 50 ? 'bg-green-100' : 'bg-red-100';
      segments.push(
        <span
          key={`event-${index}`}
          className={`${backgroundColor} px-1 rounded`}
          title={`Sentiment: ${event.sentiment}%`}
        >
          {meeting.transcript!.slice(event.start_index, event.end_index)}
        </span>
      );

      lastIndex = event.end_index;
    });

    // Add any remaining text after the last sentiment event
    if (lastIndex < meeting.transcript!.length) {
      segments.push(
        <span key="remaining">
          {meeting.transcript!.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">Transcript</h3>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
          {segments}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? (
              <input
                type="text"
                value={editedMeeting?.client_name || ''}
                onChange={(e) => setEditedMeeting(prev => prev ? { ...prev, client_name: e.target.value } : null)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              meeting.client_name
            )}
          </h2>
          <p className="text-sm text-gray-500">
            {isEditing ? (
              <input
                type="date"
                value={editedMeeting?.date || ''}
                onChange={(e) => setEditedMeeting(prev => prev ? { ...prev, date: e.target.value } : null)}
                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              formatDate(meeting.date)
            )}
          </p>
        </div>
        <div className="flex space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedMeeting(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditedMeeting(meeting);
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Meeting Type</h3>
          {isEditing ? (
            <select
              value={editedMeeting?.meeting_type || ''}
              onChange={(e) => setEditedMeeting(prev => prev ? { ...prev, meeting_type: e.target.value } : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {MEETING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{meeting.meeting_type}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          {isEditing ? (
            <textarea
              value={editedMeeting?.description || ''}
              onChange={(e) => setEditedMeeting(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{meeting.description}</p>
          )}
        </div>
      </div>

      {meeting.audio_url ? (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Audio Recording</h3>
          <div className="mt-2">
            <audio controls className="w-full">
              <source src={meeting.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Upload Audio Recording</h3>
          <div className="mt-2">
            <label className="block">
              <span className="sr-only">Choose audio file</span>
              <input
                type="file"
                accept="audio/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {renderHighlightedTranscript()}

      {meeting.summary && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500">Summary</h3>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-900">{meeting.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}