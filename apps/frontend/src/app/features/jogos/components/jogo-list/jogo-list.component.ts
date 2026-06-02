import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JogosService } from '../../services/jogos.service';
import { ApostasService } from '../../services/apostas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { Jogo } from '@repo/utils';

@Component({
  selector: 'app-jogo-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Banner / Welcome -->
        <div class="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Arena de Apostas</h1>
            <p class="text-slate-400 mt-1">Palpite nos principais placares e gerencie seus jogos preferidos.</p>
          </div>
          <div *ngIf="isAdmin()" class="flex">
            <a
              routerLink="/jogos/novo"
              class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition duration-300 shadow-lg shadow-emerald-500/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Novo Jogo</span>
            </a>
          </div>
        </div>

        <!-- Filters (Entity Filter) -->
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="w-full md:w-72">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Buscar Times</label>
            <div class="relative">
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Ex: Brasil, Argentina..."
                class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-9 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
              />
              <svg class="h-4 w-4 text-slate-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="flex gap-4 w-full md:w-auto">
            <div class="flex-1 md:w-48">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status do Jogo</label>
              <select
                [ngModel]="statusFilter()"
                (ngModelChange)="statusFilter.set($event)"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">Todos</option>
                <option value="OPEN">Abertos (Apostar)</option>
                <option value="CLOSED">Encerrados</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="jogosService.loading()" class="py-12 flex flex-col items-center justify-center space-y-4">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <span class="text-slate-400 text-sm">Carregando jogos...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="jogosService.error()" class="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-center">
          <p>{{ jogosService.error() }}</p>
          <button (click)="loadData()" class="mt-2 text-sm text-emerald-400 hover:underline">Tentar Novamente</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!jogosService.loading() && filteredJogos().length === 0" class="border border-dashed border-slate-800 py-16 text-center rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-semibold text-slate-300">Nenhum jogo encontrado</h3>
          <p class="text-slate-500 text-sm mt-1">Nenhuma partida atende aos filtros atuais.</p>
        </div>

        <!-- Jogos Grid (Entity List) -->
        <div *ngIf="!jogosService.loading() && filteredJogos().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let jogo of filteredJogos()"
            class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition duration-300 flex flex-col"
          >
            <!-- Card Header -->
            <div class="bg-slate-900/50 p-4 border-b border-slate-800 flex justify-between items-center">
              <span class="text-xs font-semibold px-2 py-1 rounded-sm uppercase tracking-wide"
                [ngClass]="jogo.encerrado ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'">
                {{ jogo.encerrado ? 'Encerrado' : 'Aberto para Palpites' }}
              </span>
              <span class="text-xs text-slate-400 font-mono">{{ formatDateTimeString(jogo.dataJogo, jogo.horarioJogo) }}</span>
            </div>

            <!-- Card Body -->
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <!-- Match Info -->
              <div class="flex items-center justify-between gap-2">
                <!-- Home Team -->
                <div class="flex flex-col items-center flex-1 text-center">
                  <div class="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-emerald-400 border border-slate-700">
                    {{ jogo.selecaoCasa.substring(0, 3).toUpperCase() }}
                  </div>
                  <span class="mt-2 text-sm font-semibold truncate w-24 block">{{ jogo.selecaoCasa }}</span>
                </div>

                <div class="text-slate-500 font-bold text-lg px-2">VS</div>

                <!-- Away Team -->
                <div class="flex flex-col items-center flex-1 text-center">
                  <div class="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-lg text-emerald-400 border border-slate-700">
                    {{ jogo.selecaoVisitante.substring(0, 3).toUpperCase() }}
                  </div>
                  <span class="mt-2 text-sm font-semibold truncate w-24 block">{{ jogo.selecaoVisitante }}</span>
                </div>
              </div>

              <!-- Match Details -->
              <div class="bg-slate-950 p-3 rounded-lg text-xs space-y-1.5 text-slate-400">
                <div class="flex items-center justify-between">
                  <span>Estádio:</span>
                  <span class="text-slate-200 font-medium truncate max-w-40">{{ jogo.estadio }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Árbitro:</span>
                  <span class="text-slate-200 font-medium truncate max-w-40">{{ jogo.nomeJuiz }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Recomendações:</span>
                  <span class="text-emerald-400 font-semibold">{{ jogo.palpites?.length || 0 }} de 4</span>
                </div>
              </div>

              <!-- User's Existing Bet on this game (if any) -->
              <div *ngIf="getUserBetForJogo(jogo.id) as minhaAposta" class="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <span class="text-slate-400 block mb-0.5">Seu palpite:</span>
                  <span class="font-bold text-emerald-400">{{ minhaAposta.golsCasa }} x {{ minhaAposta.golsVisitante }}</span>
                </div>
                <button
                  *ngIf="!jogo.encerrado"
                  (click)="cancelarAposta(minhaAposta.id)"
                  class="text-red-400 hover:text-red-300 font-semibold hover:underline"
                >
                  Excluir aposta
                </button>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="p-4 bg-slate-900/30 border-t border-slate-800 flex gap-2">
              <a
                [routerLink]="['/jogos', jogo.id]"
                class="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 px-3 rounded-lg text-sm transition"
              >
                {{ getUserBetForJogo(jogo.id) ? 'Ver Detalhes' : 'Palpitar' }}
              </a>

              <!-- Admin controls -->
              <ng-container *ngIf="isAdmin()">
                <a
                  [routerLink]="['/jogos', jogo.id, 'admin']"
                  class="bg-slate-800 hover:bg-slate-700 text-yellow-400 p-2 rounded-lg transition"
                  title="Gerenciar Palpites"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </a>
                <a
                  [routerLink]="['/jogos', jogo.id, 'editar']"
                  class="bg-slate-800 hover:bg-slate-700 text-blue-400 p-2 rounded-lg transition"
                  title="Editar Jogo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <button
                  (click)="confirmDelete(jogo)"
                  class="bg-slate-800 hover:bg-red-950 text-red-500 p-2 rounded-lg transition"
                  title="Excluir Jogo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </ng-container>
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
            Você tem certeza que deseja excluir o jogo <span class="font-bold text-white">{{ jogoToDelete()?.selecaoCasa }} vs {{ jogoToDelete()?.selecaoVisitante }}</span>?
            Esta ação excluirá permanentemente o jogo, suas sugestões de palpites e todas as apostas dos usuários.
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
              Excluir Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JogoListComponent implements OnInit {
  jogosService = inject(JogosService);
  apostasService = inject(ApostasService);
  authService = inject(AuthService);

  // Filters State
  searchQuery = signal('');
  statusFilter = signal('ALL');

  // Delete State
  jogoToDelete = signal<Jogo | null>(null);

  // Computeds
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  
  filteredJogos = computed(() => {
    let list = this.jogosService.jogos();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    
    if (query) {
      list = list.filter(
        (j) =>
          j.selecaoCasa.toLowerCase().includes(query) ||
          j.selecaoVisitante.toLowerCase().includes(query) ||
          j.estadio.toLowerCase().includes(query)
      );
    }

    if (status === 'OPEN') {
      list = list.filter((j) => !j.encerrado);
    } else if (status === 'CLOSED') {
      list = list.filter((j) => j.encerrado);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.jogosService.carregarJogos().subscribe();
    this.apostasService.carregarMinhasApostas().subscribe();
  }

  getUserBetForJogo(jogoId: string) {
    return this.apostasService.minhasApostas().find((a) => a.jogoId === jogoId);
  }

  cancelarAposta(apostaId: string): void {
    if (confirm('Tem certeza de que deseja cancelar esta aposta?')) {
      this.apostasService.excluirAposta(apostaId).subscribe({
        next: () => {
          this.loadData();
        },
      });
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
      return `${parts[2]}/${parts[1]} ${timeStr}`;
    }
    return `${dateStr} ${timeStr}`;
  }
}
