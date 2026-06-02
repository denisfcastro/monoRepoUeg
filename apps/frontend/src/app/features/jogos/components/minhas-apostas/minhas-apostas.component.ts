import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApostasService } from '../../services/apostas.service';
import { HeaderComponent } from '../header/header.component';
import { Aposta } from '@repo/utils';

@Component({
  selector: 'app-minhas-apostas',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Suas Apostas</h1>
        <p class="text-slate-400 text-sm">Confira os palpites que você registrou para cada partida.</p>

        <!-- Loading State -->
        <div *ngIf="apostasService.loading()" class="py-12 flex flex-col items-center justify-center space-y-4">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          <span class="text-slate-400 text-sm">Carregando palpites...</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="!apostasService.loading() && apostasService.minhasApostas().length === 0" class="border border-dashed border-slate-800 py-16 text-center rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0z" />
          </svg>
          <h3 class="text-lg font-semibold text-slate-300">Nenhum palpite registrado</h3>
          <p class="text-slate-500 text-sm mt-1">Você ainda não deu palpite em nenhuma partida ativa.</p>
          <a routerLink="/jogos" class="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition">
            Ver Partidas
          </a>
        </div>

        <!-- Bets List -->
        <div *ngIf="!apostasService.loading() && apostasService.minhasApostas().length > 0" class="space-y-4">
          <div
            *ngFor="let aposta of apostasService.minhasApostas()"
            class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-700 transition"
          >
            <!-- Game/Score Info -->
            <div class="flex-1 space-y-2">
              <div class="flex items-center space-x-2 text-xs">
                <span class="font-semibold"
                  [ngClass]="aposta.jogo?.encerrado ? 'text-red-400' : 'text-emerald-450'">
                  {{ aposta.jogo?.encerrado ? 'Jogo Encerrado' : 'Aposta Ativa' }}
                </span>
                <span class="text-slate-600">•</span>
                <span class="text-slate-400 font-mono">{{ formatDateTimeString(aposta.jogo?.dataJogo || '', aposta.jogo?.horarioJogo || '') }}</span>
              </div>

              <!-- Match vs Placar -->
              <div class="flex items-center space-x-4">
                <div class="text-sm font-bold text-white">
                  {{ aposta.jogo?.selecaoCasa }} <span class="text-slate-500">vs</span> {{ aposta.jogo?.selecaoVisitante }}
                </div>
                <div class="h-6 w-px bg-slate-800"></div>
                <div class="flex items-center space-x-1.5 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  <span class="text-xs text-slate-500 font-semibold uppercase mr-1">Seu Palpite</span>
                  <span class="text-base font-black text-emerald-400 font-mono">{{ aposta.golsCasa }} - {{ aposta.golsVisitante }}</span>
                </div>
                <div class="flex items-center space-x-1.5 bg-emerald-900/40 px-2 py-1 rounded border border-emerald-500/20">
                  <span class="text-[10px] text-emerald-500 font-semibold uppercase">Odd</span>
                  <span class="text-xs font-black text-emerald-300 font-mono">{{ aposta.odd | number:'1.2-2' }}x</span>
                </div>
              </div>

              <div class="text-xs text-slate-500">
                Estádio: {{ aposta.jogo?.estadio }}
              </div>
            </div>

            <!-- Cancel Button -->
            <div class="flex sm:justify-end">
              <button
                *ngIf="!aposta.jogo?.encerrado"
                (click)="cancelarAposta(aposta.id)"
                class="w-full sm:w-auto px-4 py-2 bg-red-950/45 hover:bg-red-900/60 text-red-400 hover:text-red-300 font-semibold rounded-lg text-sm border border-red-900/30 transition"
              >
                Excluir Aposta
              </button>
              <span *ngIf="aposta.jogo?.encerrado" class="text-xs text-slate-500 bg-slate-950 px-3 py-1.5 border border-slate-850 rounded-lg">
                Bloqueado
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class MinhasApostasComponent implements OnInit {
  apostasService = inject(ApostasService);

  ngOnInit(): void {
    this.apostasService.carregarMinhasApostas().subscribe();
  }

  cancelarAposta(apostaId: string): void {
    if (confirm('Deseja realmente cancelar e excluir sua aposta nesta partida?')) {
      this.apostasService.excluirAposta(apostaId).subscribe();
    }
  }

  formatDateTimeString(dateStr: string, timeStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]} ${timeStr}`;
    }
    return `${dateStr} ${timeStr}`;
  }
}
