export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export interface Document {
  id: string;
  name: string;
  upload_date: string;
  size: number;
}
