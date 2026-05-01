import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { YouTubeApi } from '../models/youtube.model';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/v1/api/youtube';

  summarize(videoId: string, platform: string = 'youtube'): Observable<YouTubeApi> {
    return this.http.post<YouTubeApi>(`${this.apiUrl}/summarize`, { videoId, platform });
  }

  getAll(): Observable<YouTubeApi[]> {
    return this.http.get<YouTubeApi[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<YouTubeApi> {
    return this.http.get<YouTubeApi>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: string): Observable<YouTubeApi[]> {
    return this.http.get<YouTubeApi[]>(`${this.apiUrl}/status/${status}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<YouTubeApi>): Observable<YouTubeApi> {
    return this.http.put<YouTubeApi>(`${this.apiUrl}/${id}`, data);
  }

  restore(id: number): Observable<YouTubeApi> {
    return this.http.patch<YouTubeApi>(`${this.apiUrl}/${id}/restore`, {});
  }

  getCountCompleted(): Observable<{ completedRequests: number }> {
    return this.http.get<{ completedRequests: number }>(`${this.apiUrl}/count/completed`);
  }

  getHealth(): Observable<{ status: string; service: string }> {
    return this.http.get<{ status: string; service: string }>(`${this.apiUrl}/health`);
  }
}
