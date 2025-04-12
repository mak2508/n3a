import { Client } from '../hooks/useClients';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetail({ client, onClose }: ClientDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact</h3>
              <p className="mt-1 text-sm text-gray-900">{client.email}</p>
              <p className="text-sm text-gray-900">{client.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Details</h3>
              <p className="mt-1 text-sm text-gray-900">
                {client.profession} • {client.relationship_type}
              </p>
              <p className="text-sm text-gray-900">
                Born: {new Date(client.date_of_birth).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Insights</h3>
            <div className="mt-2 space-y-4">
              {client.insights.map(insight => (
                <div key={insight.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">{insight.category}</h4>
                  <p className="mt-1 text-sm text-gray-600">{insight.insight}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Added: {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 