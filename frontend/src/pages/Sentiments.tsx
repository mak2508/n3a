import { SentimentCloud } from '../components/SentimentCloud';
import { useMeetings } from '../hooks/useMeetings';

export function SentimentsPage() {
  const { meetings, loading, error } = useMeetings();

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sentiment Analysis</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SentimentCloud meetings={meetings} />
      </div>
    </div>
  );
} 