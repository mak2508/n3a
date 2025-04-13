import React from 'react';
import { Meeting } from '../types';
import { formatDate } from '../utils';

interface MeetingListProps {
  meetings: Meeting[];
  onSelectMeeting: (meeting: Meeting) => void;
}

export function MeetingList({ meetings, onSelectMeeting }: MeetingListProps) {
  return (
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
                onClick={() => onSelectMeeting(meeting)}
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
  );
}