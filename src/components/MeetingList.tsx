import React from 'react';
import { Meeting } from '../types';
import { formatDate } from '../utils';

interface MeetingListProps {
  meetings: Meeting[];
  onSelectMeeting: (meeting: Meeting) => void;
  selectedMeetingId?: string;
}

export function MeetingList({ meetings, onSelectMeeting, selectedMeetingId }: MeetingListProps) {
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <ul className="divide-y divide-gray-200">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className={`cursor-pointer hover:bg-gray-50 ${
              selectedMeetingId === meeting.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectMeeting(meeting)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {meeting.clientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(meeting.date)} - {meeting.meetingType}
                  </p>
                </div>
                {meeting.audioUrl && meeting.sentiment !== undefined && (
                  <div className="flex items-center">
                    <div
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        backgroundColor: `rgb(${255 - meeting.sentiment * 2.55}, ${
                          meeting.sentiment * 2.55
                        }, 0)`,
                        color: meeting.sentiment > 50 ? 'white' : 'black',
                      }}
                    >
                      {meeting.sentiment}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}