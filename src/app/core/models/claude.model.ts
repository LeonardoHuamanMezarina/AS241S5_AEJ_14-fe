export interface ClaudeQuery {
  id?: number;
  queryText: string;
  responseText?: string;
  tokensUsed?: number;
  errorMessage?: string;
  status?: 'PENDING' | 'COMPLETED' | 'ERROR';
  createdAt?: string;
  updatedAt?: string;
}
