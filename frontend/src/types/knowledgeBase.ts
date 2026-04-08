export interface KnowledgeBase {
  id: number;
  chatbot_id: number;
  name: string;
  file_name: string;
  file_type: string;
  s3_key: string;
  created_at: string;
  updated_at: string;
}
