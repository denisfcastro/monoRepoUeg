import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JogosService } from '../../services/jogos.service';
import { PalpitesService } from '../../services/palpites.service';
import { HeaderComponent } from '../header/header.component';
import { Jogo, Palpite, CreatePalpiteDto } from '@repo/utils';

@Component({
  selector: 'app-jogo-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <!-- Back Navigation -->
        <div>
          <a routerLink="/jogos" class="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-emerald-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar para Partidas</span>
          </a>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="py-12 flex flex-col items-center justify-center space-y-4">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <span class="text-slate-400">Buscando configurações da partida...</span>
        </div>

        <div *ngIf="!loading() && jogo()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Column 1 & 2: Recommendations List -->
          <div class="md:col-span-2 space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div class="flex justify-between items-center pb-3 border-b border-slate-850">
                <h1 class="text-xl font-bold text-white">Recomendações de Palpites</h1>
                <span class="text-xs bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-850 font-mono">
                  {{ palpites().length }} / 4 cadastrados
                </span>
              </div>

              <!-- Recommendation List -->
              <div *ngIf="palpites().length === 0" class="border border-dashed border-slate-800 p-8 text-center rounded-xl text-slate-500 text-sm">
                Nenhum palpite recomendado foi cadastrado para este jogo.
              </div>

              <div *ngIf="palpites().length > 0" class="space-y-3">
                <div
                  *ngFor="let palpite of palpites()"
                  class="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between hover:border-slate-800 transition"
                >
                  <div class="flex items-center space-x-4">
                    <span class="text-xs uppercase text-slate-500 font-semibold tracking-wider">Palpite</span>
                    <div class="flex items-center space-x-2 text-xl font-bold text-emerald-400">
                      <span>{{ palpite.golsCasa }}</span>
                      <span class="text-slate-600 text-sm">X</span>
                      <span>{{ palpite.golsVisitante }}</span>
                    </div>
                    <div class="bg-emerald-900/40 text-emerald-300 text-xs px-2 py-1 rounded font-bold border border-emerald-500/20">
                      {{ palpite.odd | number:'1.2-2' }}x
                    </div>
                  </div>

                  <button
                    *ngIf="!jogo()?.encerrado"
                    (click)="deletePalpite(palpite.id)"
                    class="text-red-400 hover:text-red-300 text-sm font-semibold hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <!-- Finished state blocker message -->
              <div *ngIf="jogo()?.encerrado" class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                O jogo está encerrado. Não é possível alterar palpites sugeridos.
              </div>
            </div>
          </div>

          <!-- Column 3: Add new Recommendation & Close Match -->
          <div class="space-y-6">
            <!-- Add Recommendation Form -->
            <div *ngIf="!jogo()?.encerrado && palpites().length < 4" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-850">Nova Sugestão</h2>
              
              <div *ngIf="actionError()" class="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                {{ actionError() }}
              </div>

              <form [formGroup]="recommendationForm" (ngSubmit)="addPalpite()" class="space-y-4">
                <div class="flex items-center justify-center space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div class="w-16">
                    <label class="block text-[10px] text-center uppercase text-slate-400 mb-1 font-semibold">Casa</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      formControlName="golsCasa"
                      class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xl font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <span class="text-slate-650 font-bold text-xl mt-3">X</span>
                  <div class="w-16">
                    <label class="block text-[10px] text-center uppercase text-slate-400 mb-1 font-semibold">Visitante</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      formControlName="golsVisitante"
                      class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xl font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] uppercase text-slate-400 mb-1 font-semibold">Odd (Multiplicador)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    formControlName="odd"
                    class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="recommendationForm.invalid || actionLoading()"
                  class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  {{ actionLoading() ? 'Gravando...' : 'Adicionar Palpite' }}
                </button>
              </form>
            </div>

            <!-- Limit reached note -->
            <div *ngIf="!jogo()?.encerrado && palpites().length >= 4" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-sm font-semibold text-slate-200">Limite Atingido</h3>
              <p class="text-xs text-slate-400">Você já cadastrou as 4 recomendações limites permitidas por jogo.</p>
            </div>

            <!-- Finish Match Panel -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-850">Ações de Status</h2>
              
              <div *ngIf="!jogo()?.encerrado">
                <p class="text-xs text-slate-400 mb-4">
                  Ao encerrar o jogo, todos os palpites e modificações serão bloqueados definitivamente.
                </p>
                <button
                  (click)="closeJogo()"
                  [disabled]="actionLoading()"
                  class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition shadow-lg shadow-red-600/10"
                >
                  {{ actionLoading() ? 'Processando...' : 'Encerrar Partida' }}
                </button>
              </div>

              <div *ngIf="jogo()?.encerrado" class="text-center py-4 bg-slate-950 rounded-xl border border-slate-850 text-red-400">
                <span class="text-xs uppercase font-bold tracking-widest block mb-1">Status</span>
                <span class="font-bold text-lg">JOGO ENCERRADO</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `,
})
export class JogoAdminComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private jogosService = inject(JogosService);
  private palpitesService = inject(PalpitesService);

  // States
  jogo = signal<Jogo | null>(null);
  palpites = signal<Palpite[]>([]);
  
  loading = signal(false);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);

  recommendationForm = this.fb.group({
    golsCasa: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    golsVisitante: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    odd: [1.50, [Validators.required, Validators.min(1.0)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetails(id);
    } else {
      this.router.navigate(['/jogos']);
    }
  }

  loadDetails(jogoId: string): void {
    this.loading.set(true);
    this.actionError.set(null);

    this.jogosService.obterJogoPorId(jogoId).subscribe({
      next: (j) => {
        this.jogo.set(j);
        this.palpitesService.obterPalpitesPorJogo(jogoId).subscribe({
          next: (pList) => {
            this.palpites.set(pList);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/jogos']);
      },
    });
  }

  addPalpite(): void {
    if (this.recommendationForm.invalid || !this.jogo()) return;

    this.actionLoading.set(true);
    this.actionError.set(null);

    const data = this.recommendationForm.value;
    const dto: CreatePalpiteDto = {
      jogoId: this.jogo()!.id,
      golsCasa: data.golsCasa!,
      golsVisitante: data.golsVisitante!,
      odd: data.odd!,
    };

    this.palpitesService.criarPalpite(dto).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.recommendationForm.reset({ golsCasa: 0, golsVisitante: 0, odd: 1.50 });
        this.loadDetails(this.jogo()!.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Erro ao criar palpite.');
      },
    });
  }

  deletePalpite(palpiteId: string): void {
    if (!this.jogo()) return;
    if (!confirm('Excluir esta recomendação de palpite?')) return;

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.palpitesService.excluirPalpite(palpiteId).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadDetails(this.jogo()!.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Erro ao excluir palpite.');
      },
    });
  }

  closeJogo(): void {
    if (!this.jogo()) return;
    if (!confirm('Deseja realmente encerrar a partida? Isto bloqueará todas as apostas!')) return;

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.jogosService.encerrarJogo(this.jogo()!.id).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadDetails(this.jogo()!.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Erro ao encerrar jogo.');
      },
    });
  }
}
