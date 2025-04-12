export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  client_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
} 