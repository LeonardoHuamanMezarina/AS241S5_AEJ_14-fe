import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { YouTubeService } from '../../core/services/youtube.service';
import { ClaudeService } from '../../core/services/claude.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private readonly youtubeService = inject(YouTubeService);
  private readonly claudeService = inject(ClaudeService);

  completedYtRequests = signal(0);
  completedClaudeQueries = signal(0);

  ngOnInit() {
    this.youtubeService.getCountCompleted().subscribe({
      next: (res) => this.completedYtRequests.set(res.completedRequests),
      error: () => this.completedYtRequests.set(0)
    });

    this.claudeService.getCountCompleted().subscribe({
      next: (res) => this.completedClaudeQueries.set(res.completedQueries),
      error: () => this.completedClaudeQueries.set(0)
    });
  }
}
