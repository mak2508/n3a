import React, { useState } from 'react';
import { Meeting } from './types';
import { MeetingList } from './components/MeetingList';
import { MeetingDetails } from './components/MeetingDetails';
import { SentimentCloud } from './components/SentimentCloud';
import { ChevronLeft, ChevronRight, ListChecks, BarChart } from 'lucide-react';
import { useMeetings } from './hooks/useMeetings';

function App() {
  const { meetings, loading, error } = useMeetings();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<'meetings' | 'sentiment'>('meetings');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          client_name: updatedMeeting.clientName,
          meeting_type: updatedMeeting.meetingType,
          description: updatedMeeting.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedMeeting.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating meeting:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-lg transition-all duration-300 flex ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-grow">
          <div className="p-4 border-b border-gray-200">
            <h1 className={`font-bold text-gray-900 transition-opacity duration-300 ${
              isSidebarCollapsed ? 'opacity-0' : 'text-xl'
            }`}>
              Navigation
            </h1>
          </div>
          
          <div className="flex-grow">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`w-full p-4 flex items-center gap-3 transition-colors ${
                activeTab === 'meetings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListChecks size={24} />
              <span className={`transition-opacity duration-300 ${
                isSidebarCollapsed ? 'opacity-0' : ''
              }`}>
                Meetings
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('sentiment')}
              className={`w-full p-4 flex items-center gap-3 transition-colors ${
                activeTab === 'sentiment'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart size={24} />
              <span className={`transition-opacity duration-300 ${
                isSidebarCollapsed ? 'opacity-0' : ''
              }`}>
                Sentiment
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-4 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">
        {activeTab === 'meetings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MeetingList
                meetings={meetings}
                onSelectMeeting={setSelectedMeeting}
                selectedMeetingId={selectedMeeting?.id}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedMeeting ? (
                <MeetingDetails
                  meeting={selectedMeeting}
                  onUpdate={handleUpdateMeeting}
                />
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Select a meeting to view details
                </div>
              )}
            </div>
          </div>
        ) : (
          <SentimentCloud meetings={meetings} />
        )}
      </div>
    </div>
  );
}

export default App;