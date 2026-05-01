import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { YouTubeCrud } from './features/youtube/youtube-crud';
import { ClaudeCrud } from './features/claude/claude-crud';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'youtube', component: YouTubeCrud },
      { path: 'claude', component: ClaudeCrud }
    ]
  },
  { path: '**', redirectTo: '' }
];
