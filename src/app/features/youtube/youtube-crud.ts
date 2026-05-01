import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { YouTubeService } from '../../core/services/youtube.service';
import { YouTubeApi } from '../../core/models/youtube.model';

@Component({
  selector: 'app-youtube-crud',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './youtube-crud.html'
})
export class YouTubeCrud implements OnInit {
  private readonly youtubeService = inject(YouTubeService);

  youtubeList = signal<YouTubeApi[]>([]);
  filteredYoutubeList = signal<YouTubeApi[]>([]);
  selectedItem = signal<YouTubeApi | null>(null);

  // Form bound signals
  newVideoId = signal('');
  filterStatus = signal<'ALL' | 'COMPLETED' | 'PENDING' | 'NO_TRANSCRIPT'>('ALL');

  // Loaders
  isSubmitting = signal(false);
  isFetching = signal(false);

  // Modal control signals
  isCreateOpen = signal(false);
  isEditOpen = signal(false);
  editItem = signal<YouTubeApi | null>(null);

  // Edit fields
  editVideoId = signal('');
  editSummary = signal('');
  editTranscript = signal('');
  editStatus = signal('');

  ngOnInit() {
    this.fetchSummaries();
  }

  fetchSummaries() {
    this.isFetching.set(true);
    this.youtubeService.getAll().subscribe({
      next: (res) => {
        this.youtubeList.set(res || []);
        this.applyFilters();
        this.isFetching.set(false);
      },
      error: () => {
        this.youtubeList.set([]);
        this.applyFilters();
        this.isFetching.set(false);
      }
    });
  }

  openCreateModal() {
    this.newVideoId.set('');
    this.isCreateOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateOpen.set(false);
  }

  createSummary(event: Event) {
    event.preventDefault();
    const videoId = this.newVideoId().trim();
    if (!videoId) return;

    this.isSubmitting.set(true);
    this.youtubeService.summarize(videoId).subscribe({
      next: (res) => {
        this.newVideoId.set('');
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.fetchSummaries();
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Error al generar el resumen. Por favor intente de nuevo.');
      }
    });
  }

  openEditModal(item: YouTubeApi) {
    this.editItem.set(item);
    this.editVideoId.set(item.videoId || '');
    this.editSummary.set(item.summary || '');
    this.editTranscript.set(item.transcript || '');
    this.editStatus.set(item.status || 'PENDING');
    this.isEditOpen.set(true);
  }

  closeEditModal() {
    this.isEditOpen.set(false);
  }

  updateSummary(event: Event) {
    event.preventDefault();
    const id = this.editItem()?.id;
    if (!id) return;

    const updatedData: Partial<YouTubeApi> = {
      videoId: this.editVideoId().trim(),
      summary: this.editSummary().trim(),
      transcript: this.editTranscript().trim(),
      status: this.editStatus().trim() as any
    };

    this.isSubmitting.set(true);
    this.youtubeService.update(id, updatedData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditModal();
        if (this.selectedItem()?.id === id) {
          this.selectedItem.set({ ...this.selectedItem()!, ...updatedData });
        }
        this.fetchSummaries();
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('No se pudo actualizar la solicitud.');
      }
    });
  }

  applyFilters() {
    const filter = this.filterStatus();
    if (filter === 'ALL') {
      this.filteredYoutubeList.set(this.youtubeList());
    } else if (filter === 'NO_TRANSCRIPT') {
      this.filteredYoutubeList.set(
        this.youtubeList().filter((item) => !item.transcript || item.transcript.trim() === '')
      );
    } else {
      this.filteredYoutubeList.set(
        this.youtubeList().filter((item) => item.status === filter)
      );
    }
  }

  deleteItem(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Está seguro de eliminar esta solicitud de resumen?')) {
      this.youtubeService.delete(id).subscribe({
        next: () => {
          if (this.selectedItem()?.id === id) {
            this.selectedItem.set(null);
          }
          this.fetchSummaries();
        },
        error: () => {
          alert('No se pudo eliminar la solicitud en el servidor.');
        }
      });
    }
  }

  restoreItem(id: number | undefined) {
    if (!id) return;
    this.youtubeService.restore(id).subscribe({
      next: () => {
        this.fetchSummaries();
      },
      error: () => {
        alert('No se pudo restaurar la solicitud.');
      }
    });
  }

  renderMarkdown(text: string | undefined): string {
    if (!text) return 'Sin respuesta aún.';
    let parsed = text;
    try {
      if (text.trim().startsWith('{')) {
        const obj = JSON.parse(text);
        parsed = obj.result || obj.response || obj.text || JSON.stringify(obj, null, 2);
      }
    } catch (e) { }

    parsed = parsed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-800 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-indigo-700 mt-5 mb-2.5">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-indigo-800 mt-6 mb-3">$1</h1>')
      .replace(/\|/g, ' ')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 mb-1">$1</li>')
      .replace(/^---$/gim, '<hr class="border-t border-slate-200 my-4" />')
      .replace(/\n/g, '<br />');

    return parsed;
  }
}
