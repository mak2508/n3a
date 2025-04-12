import React, { useState } from 'react';
import { Meeting } from './types';
import { MeetingList } from './components/MeetingList';
import { MeetingDetails } from './components/MeetingDetails';
import { SentimentCloud } from './components/SentimentCloud';
import { ChevronLeft, ChevronRight, ListChecks, BarChart } from 'lucide-react';
import { useMeetings } from './hooks/useMeetings';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClientsPage } from './pages/Clients';
import { MeetingsPage } from './pages/Meetings';
import { SentimentsPage } from './pages/Sentiments';

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
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-900">
                    Meeting Analytics
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Meetings
                  </Link>
                  <Link
                    to="/sentiments"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Sentiments
                  </Link>
                  <Link
                    to="/clients"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Clients
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<MeetingsPage />} />
            <Route path="/sentiments" element={<SentimentsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;