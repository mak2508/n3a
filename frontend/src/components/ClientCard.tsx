import { Client } from '../hooks/useClients';

interface ClientCardProps {
  client: Client;
  onClick: (client: Client) => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <div 
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(client)}
    >
      <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
      <p className="text-sm text-gray-600">{client.profession}</p>
      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded">
          {client.relationship_type}
        </span>
      </div>
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700">Recent Insights</h4>
        <ul className="mt-1 space-y-1">
          {client.insights.slice(0, 2).map(insight => (
            <li key={insight.id} className="text-sm text-gray-600">
              {insight.category}: {insight.insight.substring(0, 100)}...
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 