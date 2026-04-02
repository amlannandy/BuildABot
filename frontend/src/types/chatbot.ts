export interface ChatBot {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  api_key: string;
  workflow: string | null;
  config: string | null;
  created_at: string;
  updated_at: string;
}
