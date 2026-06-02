import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogosService } from '../../services/jogos.service';
import { AuthService } from '../../../auth/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { Jogo } from '@repo/utils';

@Component({
  selector: 'app-jogos-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Dashboard Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Painel de Controle</h1>
            <p class="text-slate-400 text-sm mt-1">Gerencie partidas, recomendações e visualize estatísticas do sistema.</p>
          </div>
          <div>
            <a
              routerLink="/jogos/novo"
              class="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition duration-300 shadow-lg shadow-emerald-500/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Nova Partida</span>
            </a>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Partidas</span>
            <span class="text-3xl font-black text-white mt-2">{{ totalJogos() }}</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partidas Ativas</span>
            <span class="text-3xl font-black text-emerald-400 mt-2">{{ activeJogos() }}</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partidas Encerradas</span>
            <span class="text-3xl font-black text-red-400 mt-2">{{ closedJogos() }}</span>
          </div>
        </div>

        <!-- Controls (Filters) -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="w-full md:w-80">
            <div class="relative">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event); currentPage.set(1)"
                placeholder="Buscar por seleções ou estádio..."
                class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-9 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
              />
              <svg class="h-4 w-4 text-slate-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="flex gap-4 w-full md:w-auto items-center justify-end">
            <div class="flex items-center space-x-2">
              <span class="text-xs text-slate-400 whitespace-nowrap">Itens por página:</span>
              <select
                [ngModel]="pageSize()"
                (ngModelChange)="pageSize.set($event); currentPage.set(1)"
                class="bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-850 text-xs font-semibold text-slate-400 uppercase bg-slate-900/50">
                  <th class="py-4 px-6">Partida</th>
                  <th class="py-4 px-6">Data & Horário</th>
                  <th class="py-4 px-6">Estádio / Árbitro</th>
                  <th class="py-4 px-6 text-center">Sugestões</th>
                  <th class="py-4 px-6 text-center">Status</th>
                  <th class="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-850">
                <!-- Empty State -->
                <tr *ngIf="paginatedJogos().length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-500 text-sm">
                    Nenhuma partida encontrada para os critérios informados.
                  </td>
                </tr>

                <!-- Rows -->
                <tr *ngFor="let jogo of paginatedJogos()" class="hover:bg-slate-900/40 transition">
                  <!-- Match Info -->
                  <td class="py-4 px-6">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-white">{{ jogo.selecaoCasa }}</span>
                      <span class="text-slate-650 text-xs font-semibold">VS</span>
                      <span class="font-bold text-white">{{ jogo.selecaoVisitante }}</span>
                    </div>
                  </td>
                  
                  <!-- Date/Time -->
                  <td class="py-4 px-6">
                    <span class="text-sm text-slate-300 font-mono">{{ formatDateTimeString(jogo.dataJogo, jogo.horarioJogo) }}</span>
                  </td>

                  <!-- Stadium/Referee -->
                  <td class="py-4 px-6">
                    <div class="text-xs text-slate-300">{{ jogo.estadio }}</div>
                    <div class="text-[10px] text-slate-550 mt-0.5">Árbitro: {{ jogo.nomeJuiz }}</div>
                  </td>

                  <!-- Recommendations Count -->
                  <td class="py-4 px-6 text-center">
                    <span class="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-sm text-emerald-450 border border-slate-850">
                      {{ jogo.palpites?.length || 0 }} de 4
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="py-4 px-6 text-center">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide inline-block"
                      [ngClass]="jogo.encerrado ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'"
                    >
                      {{ jogo.encerrado ? 'Encerrado' : 'Aberto' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <a
                      [routerLink]="['/jogos', jogo.id, 'admin']"
                      class="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 hover:text-yellow-350 rounded-lg transition"
                      title="Gerenciar Palpites"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </a>
                    <a
                      [routerLink]="['/jogos', jogo.id, 'editar']"
                      class="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-350 rounded-lg transition"
                      title="Editar Jogo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                    <button
                      (click)="confirmDelete(jogo)"
                      class="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-red-950 text-red-500 hover:text-red-400 rounded-lg transition"
                      title="Excluir Jogo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div *ngIf="filteredJogos().length > 0" class="bg-slate-900/80 p-4 border-t border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span class="text-xs text-slate-400">
              Exibindo de {{ paginationStart() }} a {{ paginationEnd() }} de {{ filteredJogos().length }} partidas
            </span>

            <div class="flex items-center justify-center space-x-2">
              <button
                (click)="prevPage()"
                [disabled]="currentPage() === 1"
                class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-350 disabled:opacity-30 rounded-lg transition text-xs font-semibold"
              >
                Anterior
              </button>

              <button
                *ngFor="let page of pageNumbers()"
                (click)="currentPage.set(page)"
                [ngClass]="page === currentPage() ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-750 text-slate-300'"
                class="h-8 w-8 rounded-lg transition text-xs font-semibold"
              >
                {{ page }}
              </button>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-350 disabled:opacity-30 rounded-lg transition text-xs font-semibold"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Premium Delete Confirmation Dialog -->
      <div *ngIf="jogoToDelete()" class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
          <div class="flex items-center space-x-3 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-xl font-bold">Confirmar Exclusão</h2>
          </div>

          <p class="text-slate-300 text-sm leading-relaxed">
            Deseja realmente excluir permanentemente o jogo <span class="font-bold text-white">{{ jogoToDelete()?.selecaoCasa }} vs {{ jogoToDelete()?.selecaoVisitante }}</span>?
            Todas as apostas e palpites vinculados serão destruídos.
          </p>

          <div class="flex justify-end space-x-3">
            <button
              (click)="cancelDelete()"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-sm transition"
            >
              Cancelar
            </button>
            <button
              (click)="executeDelete()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition"
            >
              Confirmar e Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JogosDashboardComponent implements OnInit {
  jogosService = inject(JogosService);
  authService = inject(AuthService);
  router = inject(Router);

  // States
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  jogoToDelete = signal<Jogo | null>(null);

  // Stats Computeds
  totalJogos = computed(() => this.jogosService.jogos().length);
  activeJogos = computed(() => this.jogosService.jogos().filter((j) => !j.encerrado).length);
  closedJogos = computed(() => this.jogosService.jogos().filter((j) => j.encerrado).length);

  // Filtered list
  filteredJogos = computed(() => {
    let list = this.jogosService.jogos();
    const query = this.searchQuery().trim().toLowerCase();

    if (query) {
      list = list.filter(
        (j) =>
          j.selecaoCasa.toLowerCase().includes(query) ||
          j.selecaoVisitante.toLowerCase().includes(query) ||
          j.estadio.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Paginated list
  paginatedJogos = computed(() => {
    const list = this.filteredJogos();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return list.slice(start, end);
  });

  // Pagination details
  totalPages = computed(() => {
    const pages = Math.ceil(this.filteredJogos().length / this.pageSize());
    return pages > 0 ? pages : 1;
  });

  paginationStart = computed(() => {
    if (this.filteredJogos().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  paginationEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    const total = this.filteredJogos().length;
    return end > total ? total : end;
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const arr = [];
    for (let i = 1; i <= total; i++) {
      arr.push(i);
    }
    return arr;
  });

  ngOnInit(): void {
    // Proteger rota contra não-admins diretamente no OnInit
    if (this.authService.currentUser()?.role !== 'ADMIN') {
      this.router.navigate(['/jogos']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.jogosService.carregarJogos().subscribe();
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  confirmDelete(jogo: Jogo): void {
    this.jogoToDelete.set(jogo);
  }

  cancelDelete(): void {
    this.jogoToDelete.set(null);
  }

  executeDelete(): void {
    const jogo = this.jogoToDelete();
    if (!jogo) return;

    this.jogosService.excluirJogo(jogo.id).subscribe({
      next: () => {
        this.jogoToDelete.set(null);
        this.loadData();
        // Se a página atual se tornou vazia após exclusão, voltar uma página
        const totalPagesNow = Math.ceil(this.filteredJogos().length / this.pageSize());
        if (this.currentPage() > totalPagesNow && this.currentPage() > 1) {
          this.currentPage.set(totalPagesNow);
        }
      },
      error: () => {
        this.jogoToDelete.set(null);
        alert('Erro ao excluir jogo.');
      },
    });
  }

  formatDateTimeString(dateStr: string, timeStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]} às ${timeStr}`;
    }
    return `${dateStr} ${timeStr}`;
  }
}
