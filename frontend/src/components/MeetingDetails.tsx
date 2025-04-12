import React, { useState } from 'react';
import { Meeting, MEETING_TYPES } from '../types';
import { formatDate } from '../utils';
import { Upload } from 'lucide-react';

interface MeetingDetailsProps {
  meeting: Meeting;
  onUpdate: (meeting: Meeting) => void;
}

export function MeetingDetails({ meeting, onUpdate }: MeetingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState(meeting);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleSave = () => {
    onUpdate(editedMeeting);
    setIsEditing(false);
  };

  const simulateProcessing = async () => {
    setIsProcessing(true);
    
    // Simulate transcription
    setProcessingStep('Transcribing audio...');
    for (let i = 0; i <= 30; i++) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Simulate sentiment analysis
    setProcessingStep('Analyzing sentiment...');
    for (let i = 31; i <= 60; i++) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Simulate summary generation
    setProcessingStep('Generating summary...');
    for (let i = 61; i <= 100; i++) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update meeting with mock data
    const updatedMeeting = {
      ...editedMeeting,
      audioUrl: 'https://example.com/audio1.mp3',
      transcript: 'This is a sample transcript generated from the uploaded audio...',
      summary: 'Client expressed interest in retirement planning options and showed concern about market volatility. Overall positive attitude towards long-term investment strategies.',
      sentiment: 85,
      sentimentEvents: [
        { timestamp: '00:30', event: 'Discussion of retirement goals', sentiment: 90 },
        { timestamp: '01:15', event: 'Market volatility concerns', sentiment: 65 },
        { timestamp: '02:45', event: 'Long-term strategy agreement', sentiment: 95 },
      ],
    };
    
    setEditedMeeting(updatedMeeting);
    onUpdate(updatedMeeting);
    setIsProcessing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
      // TODO: Update the meeting record with the file URL
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Meeting Details</h2>
          {isEditing ? (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedMeeting(meeting);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <p className="mt-1 text-lg">{meeting.clientName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <p className="mt-1 text-lg">{formatDate(meeting.date)}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
            {isEditing ? (
              <select
                value={editedMeeting.meetingType}
                onChange={(e) =>
                  setEditedMeeting({ ...editedMeeting, meetingType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-lg">{meeting.meetingType}</p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            {isEditing ? (
              <textarea
                value={editedMeeting.description}
                onChange={(e) =>
                  setEditedMeeting({ ...editedMeeting, description: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-1 text-lg">{meeting.description}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Recording</h3>
          {isProcessing ? (
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{processingStep}</p>
            </div>
          ) : meeting.audioUrl ? (
            <div className="space-y-4">
              <audio controls className="w-full">
                <source src={meeting.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              
              {meeting.transcript && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Transcript</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{meeting.transcript}</p>
                  </div>
                </div>
              )}

              {meeting.summary && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Summary</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700">{meeting.summary}</p>
                  </div>
                </div>
              )}

              {meeting.sentimentEvents && meeting.sentimentEvents.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Sentiment Events</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sentiment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {meeting.sentimentEvents.map((event, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.timestamp}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.event}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Upload audio recording</p>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => simulateProcessing()}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Select File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}