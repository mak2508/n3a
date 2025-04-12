import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export type Client = Database['public']['Tables']['clients']['Row'] & {
  insights: Database['public']['Tables']['client_insights']['Row'][];
};

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .order('name');

        if (clientsError) throw clientsError;

        const { data: insightsData, error: insightsError } = await supabase
          .from('client_insights')
          .select('*');

        if (insightsError) throw insightsError;

        const clientsWithInsights = clientsData.map(client => ({
          ...client,
          insights: insightsData.filter(insight => insight.client_id === client.id)
        }));

        setClients(clientsWithInsights);
        setError(null);
      } catch (err) {
        console.error('Error in fetchClients:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return { clients, loading, error };
} 