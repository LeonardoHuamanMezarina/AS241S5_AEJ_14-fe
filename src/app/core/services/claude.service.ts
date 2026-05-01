import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClaudeQuery } from '../models/claude.model';

@Injectable({
  providedIn: 'root'
})
export class ClaudeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/v1/api/claude';

  ask(query: string): Observable<ClaudeQuery> {
    return this.http.post<ClaudeQuery>(`${this.apiUrl}/ask`, { query });
  }

  getAll(): Observable<ClaudeQuery[]> {
    return this.http.get<ClaudeQuery[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<ClaudeQuery> {
    return this.http.get<ClaudeQuery>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: string): Observable<ClaudeQuery[]> {
    return this.http.get<ClaudeQuery[]>(`${this.apiUrl}/status/${status}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<ClaudeQuery>): Observable<ClaudeQuery> {
    return this.http.put<ClaudeQuery>(`${this.apiUrl}/${id}`, data);
  }

  restore(id: number): Observable<ClaudeQuery> {
    return this.http.patch<ClaudeQuery>(`${this.apiUrl}/${id}/restore`, {});
  }

  getCountCompleted(): Observable<{ completedQueries: number }> {
    return this.http.get<{ completedQueries: number }>(`${this.apiUrl}/count/completed`);
  }

  getHealth(): Observable<{ status: string; service: string }> {
    return this.http.get<{ status: string; service: string }>(`${this.apiUrl}/health`);
  }
}
