import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ClaudeService } from '../../core/services/claude.service';
import { ClaudeQuery } from '../../core/models/claude.model';

@Component({
  selector: 'app-claude-crud',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './claude-crud.html'
})
export class ClaudeCrud implements OnInit {
  private readonly claudeService = inject(ClaudeService);

  queriesList = signal<ClaudeQuery[]>([]);
  filteredQueries = signal<ClaudeQuery[]>([]);
  selectedQuery = signal<ClaudeQuery | null>(null);

  // Form signal bindings
  newQueryText = signal('');
  filterStatus = signal<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  // Loader signals
  isSubmitting = signal(false);
  isFetching = signal(false);

  // Modal control signals
  isCreateOpen = signal(false);
  isEditOpen = signal(false);
  editItem = signal<ClaudeQuery | null>(null);

  // Edit fields
  editQueryText = signal('');
  editResponseText = signal('');
  editStatus = signal('');

  ngOnInit() {
    this.fetchQueries();
  }

  fetchQueries() {
    this.isFetching.set(true);
    this.claudeService.getAll().subscribe({
      next: (res) => {
        this.queriesList.set(res || []);
        this.applyFilters();
        this.isFetching.set(false);
      },
      error: () => {
        this.queriesList.set([]);
        this.applyFilters();
        this.isFetching.set(false);
      }
    });
  }

  openCreateModal() {
    this.newQueryText.set('');
    this.isCreateOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateOpen.set(false);
  }

  submitQuery(event: Event) {
    event.preventDefault();
    const query = this.newQueryText().trim();
    if (!query) return;

    this.isSubmitting.set(true);
    this.claudeService.ask(query).subscribe({
      next: (res) => {
        this.newQueryText.set('');
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.fetchQueries();
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('Error al enviar la consulta a Claude AI. Inténtalo de nuevo.');
      }
    });
  }

  openEditModal(item: ClaudeQuery) {
    this.editItem.set(item);
    this.editQueryText.set(item.queryText || '');
    this.editResponseText.set(item.responseText || '');
    this.editStatus.set(item.status || 'PENDING');
    this.isEditOpen.set(true);
  }

  closeEditModal() {
    this.isEditOpen.set(false);
  }

  updateQuery(event: Event) {
    event.preventDefault();
    const id = this.editItem()?.id;
    if (!id) return;

    const updatedData: Partial<ClaudeQuery> = {
      queryText: this.editQueryText().trim(),
      responseText: this.editResponseText().trim(),
      status: this.editStatus().trim() as any
    };

    this.isSubmitting.set(true);
    this.claudeService.update(id, updatedData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditModal();
        if (this.selectedQuery()?.id === id) {
          this.selectedQuery.set({ ...this.selectedQuery()!, ...updatedData });
        }
        this.fetchQueries();
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('No se pudo actualizar la consulta.');
      }
    });
  }

  applyFilters() {
    const filter = this.filterStatus();
    if (filter === 'ALL') {
      this.filteredQueries.set(this.queriesList());
    } else {
      this.filteredQueries.set(
        this.queriesList().filter((item) => item.status === filter)
      );
    }
  }

  deleteQuery(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Está seguro de eliminar esta consulta?')) {
      this.claudeService.delete(id).subscribe({
        next: () => {
          if (this.selectedQuery()?.id === id) {
            this.selectedQuery.set(null);
          }
          this.fetchQueries();
        },
        error: () => {
          alert('No se pudo eliminar la consulta en el servidor.');
        }
      });
    }
  }

  restoreQuery(id: number | undefined) {
    if (!id) return;
    this.claudeService.restore(id).subscribe({
      next: () => {
        this.fetchQueries();
      },
      error: () => {
        alert('No se pudo restaurar la consulta.');
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
