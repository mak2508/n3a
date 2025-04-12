import { useState, useEffect } from 'react';
import { Client } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/api/clients`);
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        const data = await response.json();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const fetchClientInsights = async (clientId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clients/${clientId}/insights`);
      if (!response.ok) {
        throw new Error('Failed to fetch client insights');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching client insights:', err);
      throw err;
    }
  };

  return { clients, loading, error, fetchClientInsights };
}; 