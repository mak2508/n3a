import { useState } from 'react';
import { useClients, Client } from '../hooks/useClients';
import { ClientCard } from '../components/ClientCard';
import { ClientDetail } from '../components/ClientDetail';

export function ClientsPage() {
  const { clients, loading, error } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Clients</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={setSelectedClient}
          />
        ))}
      </div>

      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
} 