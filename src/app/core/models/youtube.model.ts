export interface YouTubeApi {
  id?: number;
  videoUrl?: string;
  videoId: string;
  title?: string;
  transcript?: string;
  summary?: string;
  platform?: string;
  errorMessage?: string;
  status?: 'PENDING' | 'COMPLETED' | 'ERROR';
  createdAt?: string;
  updatedAt?: string;
}
