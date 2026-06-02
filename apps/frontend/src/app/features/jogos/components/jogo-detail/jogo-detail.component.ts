import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JogosService } from '../../services/jogos.service';
import { PalpitesService } from '../../services/palpites.service';
import { ApostasService } from '../../services/apostas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { PalpiteCardComponent } from '../palpite-card/palpite-card.component';
import { Jogo, Palpite, Aposta, CreateApostaDto } from '@repo/utils';

@Component({
  selector: 'app-jogo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent, PalpiteCardComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <!-- Back navigation -->
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
          <span class="text-slate-400">Buscando detalhes da partida...</span>
        </div>

        <!-- Main Content -->
        <div *ngIf="!loading() && jogo()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Column 1 & 2: Match & Recommendations -->
          <div class="md:col-span-2 space-y-6">
            <!-- Match Board -->
            <div class="bg-linear-to-b from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div class="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

              <!-- Top Row Info -->
              <div class="flex justify-between items-center text-xs text-slate-400 mb-6">
                <span class="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">{{ jogo()?.estadio }}</span>
                <span>Árbitro: {{ jogo()?.nomeJuiz }}</span>
              </div>

              <!-- Versus Board -->
              <div class="flex items-center justify-between gap-4 py-4">
                <div class="flex flex-col items-center flex-1 text-center">
                  <div class="h-16 w-16 rounded-full bg-slate-850 flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700">
                    {{ jogo()?.selecaoCasa?.substring(0, 3)?.toUpperCase() }}
                  </div>
                  <span class="mt-3 font-bold text-lg text-white block">{{ jogo()?.selecaoCasa }}</span>
                </div>

                <div class="flex flex-col items-center">
                  <span class="text-slate-500 font-black text-xl mb-1">VS</span>
                  <span class="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                    {{ formatDateTimeString(jogo()?.dataJogo || '', jogo()?.horarioJogo || '') }}
                  </span>
                </div>

                <div class="flex flex-col items-center flex-1 text-center">
                  <div class="h-16 w-16 rounded-full bg-slate-850 flex items-center justify-center font-black text-2xl text-emerald-400 border border-slate-700">
                    {{ jogo()?.selecaoVisitante?.substring(0, 3)?.toUpperCase() }}
                  </div>
                  <span class="mt-3 font-bold text-lg text-white block">{{ jogo()?.selecaoVisitante }}</span>
                </div>
              </div>

              <!-- Finished alert -->
              <div *ngIf="jogo()?.encerrado" class="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                <div class="text-xs sm:text-sm">
                  <span class="font-bold">Partida Encerrada!</span> Os palpites para este jogo foram bloqueados pelo administrador.
                </div>
              </div>
            </div>

            <!-- Palpites Recomendados (Casa de Aposta Suggestions) -->
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-slate-200">Recomendações da Casa</h2>
              <div *ngIf="palpites().length === 0" class="border border-dashed border-slate-850 p-6 text-center rounded-xl text-slate-500 text-sm">
                Nenhum palpite recomendado para esta partida.
              </div>
              <div *ngIf="palpites().length > 0" class="grid grid-cols-2 gap-4">
                <app-palpite-card
                  *ngFor="let palpite of palpites()"
                  [palpite]="palpite"
                  [selected]="selectedPalpiteId() === palpite.id"
                  (select)="selectRecommended(palpite)"
                  [disabled]="!!jogo()?.encerrado"
                ></app-palpite-card>
              </div>
            </div>
          </div>

          <!-- Column 3: Placing Bet / My Bet details -->
          <div class="space-y-6">
            
            <!-- Placing/Editing Bet Panel -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-850">
                {{ minhaAposta() ? 'Sua Aposta Registrada' : 'Fazer Palpite' }}
              </h2>

              <!-- Success/Error alert inside panel -->
              <div *ngIf="actionError()" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                {{ actionError() }}
              </div>

              <!-- VIEW MODE: Already placed a bet -->
              <div *ngIf="minhaAposta() as aposta" class="space-y-6">
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center">
                  <span class="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">Placar Apostado</span>
                  <div class="flex items-center space-x-4 text-3xl font-black text-emerald-400">
                    <span>{{ aposta.golsCasa }}</span>
                    <span class="text-slate-500 text-sm font-bold">X</span>
                    <span>{{ aposta.golsVisitante }}</span>
                  </div>
                  <div class="mt-3 bg-emerald-900/40 text-emerald-300 text-xs px-2 py-1 rounded font-bold border border-emerald-500/20">
                    Odd Fixada: {{ aposta.odd | number:'1.2-2' }}x
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 mt-2">Aposta feita em {{ aposta.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <!-- Cancel Bet (only if game not finished) -->
                <button
                  *ngIf="!jogo()?.encerrado"
                  (click)="cancelBet(aposta.id)"
                  [disabled]="actionLoading()"
                  class="w-full py-2.5 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 font-semibold rounded-lg text-sm border border-red-900/30 transition"
                >
                  {{ actionLoading() ? 'Processando...' : 'Excluir Aposta' }}
                </button>
              </div>

              <!-- EDIT/CREATE MODE: User can place a bet -->
              <div *ngIf="!minhaAposta()" class="space-y-4">
                <p class="text-xs text-slate-400">Escolha uma recomendação ao lado ou digite o placar de sua preferência abaixo:</p>

                <form [formGroup]="betForm" (ngSubmit)="submitBet()" class="space-y-4">
                  <div class="flex items-center justify-center space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                    <div class="w-16">
                      <label class="block text-[10px] text-center uppercase text-slate-400 mb-1 font-semibold">Casa</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        formControlName="golsCasa"
                        class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xl font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        (input)="clearSelectedRecommendation()"
                      />
                    </div>
                    <span class="text-slate-600 font-bold text-xl mt-3">X</span>
                    <div class="w-16">
                      <label class="block text-[10px] text-center uppercase text-slate-400 mb-1 font-semibold">Visitante</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        formControlName="golsVisitante"
                        class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xl font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        (input)="clearSelectedRecommendation()"
                      />
                    </div>
                  </div>

                  <div *ngIf="betForm.invalid && betForm.touched" class="text-red-400 text-xs text-center">
                    Insira placares entre 0 e 20 gols.
                  </div>

                  <button
                    type="submit"
                    [disabled]="betForm.invalid || actionLoading() || (jogo()?.encerrado)"
                    class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-sm transition shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ actionLoading() ? 'Registrando...' : 'Confirmar Aposta' }}
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  `,
})
export class JogoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private jogosService = inject(JogosService);
  private palpitesService = inject(PalpitesService);
  private apostasService = inject(ApostasService);
  private authService = inject(AuthService);

  // States
  jogo = signal<Jogo | null>(null);
  palpites = signal<Palpite[]>([]);
  minhaAposta = signal<Aposta | null>(null);
  
  loading = signal(false);
  actionLoading = signal(false);
  actionError = signal<string | null>(null);
  
  selectedPalpiteId = signal<string | null>(null);

  betForm = this.fb.group({
    golsCasa: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    golsVisitante: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
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

    // Load game details
    this.jogosService.obterJogoPorId(jogoId).subscribe({
      next: (j) => {
        this.jogo.set(j);
        
        // Load recommendations
        this.palpitesService.obterPalpitesPorJogo(jogoId).subscribe({
          next: (pList) => {
            this.palpites.set(pList);

            // Load user bets to check if already placed
            this.apostasService.carregarMinhasApostas().subscribe({
              next: (aList) => {
                const userBet = aList.find((a) => a.jogoId === jogoId);
                this.minhaAposta.set(userBet || null);
                this.loading.set(false);
              },
              error: () => this.loading.set(false),
            });
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

  selectRecommended(palpite: Palpite): void {
    if (this.jogo()?.encerrado) return;
    this.selectedPalpiteId.set(palpite.id);
    this.betForm.patchValue({
      golsCasa: palpite.golsCasa,
      golsVisitante: palpite.golsVisitante,
    });
  }

  clearSelectedRecommendation(): void {
    this.selectedPalpiteId.set(null);
  }

  submitBet(): void {
    if (this.betForm.invalid || !this.jogo()) return;

    this.actionLoading.set(true);
    this.actionError.set(null);

    const data = this.betForm.value;
    const dto: CreateApostaDto = {
      jogoId: this.jogo()!.id,
      golsCasa: data.golsCasa!,
      golsVisitante: data.golsVisitante!,
      palpiteId: this.selectedPalpiteId() || undefined,
    };

    this.apostasService.criarAposta(dto).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadDetails(this.jogo()!.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Erro ao registrar aposta.');
      },
    });
  }

  cancelBet(apostaId: string): void {
    if (!this.jogo()) return;
    if (!confirm('Deseja realmente cancelar e excluir sua aposta nesta partida?')) return;

    this.actionLoading.set(true);
    this.actionError.set(null);

    this.apostasService.excluirAposta(apostaId).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.loadDetails(this.jogo()!.id);
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.actionError.set(err.error?.message || 'Erro ao excluir aposta.');
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
