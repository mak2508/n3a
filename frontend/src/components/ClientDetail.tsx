import { useState } from 'react';
import { Client } from '../hooks/useClients';

// Add API_URL constant
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ClientDetailProps {
  client: Client;
  onClose: () => void;
}

// Define SearchResult interface for type safety
interface SearchResult {
  source: string;
  context: string;
  content: string;
  meeting_id?: string;
  insight_id?: string;
  date?: string;
  type?: string;
  category?: string;
  relevance?: number; // Added for GraphRAG results
}

interface SearchResponse {
  query: string;
  client_name: string;
  results: SearchResult[];
  message?: string;
  search_type?: 'graphrag' | 'traditional'; // Indicates which search method was used
}

export function ClientDetail({ client, onClose }: ClientDetailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          
          {/* Search section */}
          <div className="mt-6">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask me anything about this client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-4"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : "Search"}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {searchResults && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-gray-900">
                    Search results for "{searchResults.query}"
                  </h4>
                  {searchResults.search_type && (
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {searchResults.search_type === 'traditional' ? 'Basic search' : 'AI-powered search'}
                    </span>
                  )}
                </div>
                
                {searchResults.results.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {searchResults.message || `No information found about "${searchResults.query}" for ${client.name}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.results.map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg ${
                          result.relevance && result.relevance > 90 
                            ? 'bg-green-50 border border-green-100' 
                            : 'bg-blue-50 border border-blue-100'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-blue-700 mb-1">{result.context}</p>
                          
                          {result.relevance && (
                            <span 
                              className={`text-xs px-2 py-1 rounded-full ${
                                result.relevance > 90 
                                  ? 'bg-green-200 text-green-800' 
                                  : result.relevance > 80 
                                    ? 'bg-blue-200 text-blue-800' 
                                    : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              {result.relevance}% match
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-800 mt-1">{result.content}</p>
                        
                        {result.date && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(result.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  function handleSearch() {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    setError(null);
    
    // Call the API endpoint with the search query
    fetch(`${API_URL}/api/clients/${client.id}/query?q=${encodeURIComponent(searchQuery)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setSearchResults(data);
      })
      .catch(err => {
        console.error('Search error:', err);
        setError(`Failed to search: ${err.message}`);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }
}