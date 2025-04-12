import React, { useMemo, useState, useCallback } from 'react';
import { Meeting, MEETING_TYPES } from '../types';
import { formatDate } from '../utils';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SentimentCloudProps {
  meetings: Meeting[];
}

interface SentimentEventWithMetadata {
  timestamp: string;
  event: string;
  sentiment: number;
  clientName: string;
  date: string;
  meetingType: string;
  timeValue: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="font-medium text-gray-900">{data.clientName}</p>
        <p className="text-sm text-gray-600">{formatDate(data.date)}</p>
        <p className="text-sm text-gray-600">{data.meetingType}</p>
        <p className="text-sm font-medium mt-1">{data.event}</p>
        <p className="text-sm font-bold text-blue-600">{data.sentiment}% Sentiment</p>
      </div>
    );
  }
  return null;
};

export function SentimentCloud({ meetings }: SentimentCloudProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const clients = useMemo(() => {
    return Array.from(new Set(meetings.map(m => m.clientName)));
  }, [meetings]);

  const sentimentEvents = useMemo(() => {
    let filteredMeetings = meetings;
    
    if (selectedClient) {
      filteredMeetings = filteredMeetings.filter(m => m.clientName === selectedClient);
    }

    if (selectedMeetingType) {
      filteredMeetings = filteredMeetings.filter(m => m.meetingType === selectedMeetingType);
    }
    
    if (dateRange.start) {
      filteredMeetings = filteredMeetings.filter(m => m.date >= dateRange.start);
    }
    
    if (dateRange.end) {
      filteredMeetings = filteredMeetings.filter(m => m.date <= dateRange.end);
    }

    return filteredMeetings
      .filter(meeting => meeting.sentimentEvents)
      .flatMap(meeting =>
        meeting.sentimentEvents!.map(event => ({
          ...event,
          clientName: meeting.clientName,
          date: meeting.date,
          meetingType: meeting.meetingType,
          timeValue: new Date(meeting.date).getTime(),
        }))
      )
      .sort((a, b) => a.timeValue - b.timeValue);
  }, [meetings, selectedClient, selectedMeetingType, dateRange]);

  const handleDotHover = useCallback((event: SentimentEventWithMetadata | null) => {
    setHoveredEvent(event ? `${event.date}-${event.timestamp}-${event.event}` : null);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h2>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
            <select
              value={selectedMeetingType}
              onChange={(e) => setSelectedMeetingType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {MEETING_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-6" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timeValue"
              domain={['auto', 'auto']}
              name="Time"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              type="number"
            />
            <YAxis
              dataKey="sentiment"
              name="Sentiment"
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={sentimentEvents}
              fill="#8884d8"
              onMouseEnter={(data) => handleDotHover(data as SentimentEventWithMetadata)}
              onMouseLeave={() => handleDotHover(null)}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meeting Type
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
            {sentimentEvents.map((event, index) => (
              <tr
                key={index}
                className={hoveredEvent === `${event.date}-${event.timestamp}-${event.event}` ? 'bg-blue-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(event.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.meetingType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {event.event}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="px-3 py-1 text-sm font-medium rounded-full inline-block"
                    style={{
                      backgroundColor: `rgb(${255 - event.sentiment * 2.55}, ${
                        event.sentiment * 2.55
                      }, 0)`,
                      color: event.sentiment > 50 ? 'white' : 'black',
                    }}
                  >
                    {event.sentiment}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}