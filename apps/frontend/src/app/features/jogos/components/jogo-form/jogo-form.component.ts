import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JogosService } from '../../services/jogos.service';
import { HeaderComponent } from '../header/header.component';
import { CreateJogoDto, UpdateJogoDto } from '@repo/utils';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <app-header></app-header>

      <main class="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-850">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-white">
                {{ isEditMode() ? 'Editar Partida' : 'Nova Partida' }}
              </h1>
              <p class="text-slate-400 text-sm mt-1">Preencha os dados do jogo de futebol.</p>
            </div>
            <a
              routerLink="/jogos"
              class="text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 bg-slate-950 px-3 py-1.5 rounded-lg transition"
            >
              Voltar
            </a>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage()" class="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-lg text-sm text-center">
            {{ errorMessage() }}
          </div>

          <!-- Form -->
          <form [formGroup]="jogoForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Teams row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Home Team -->
              <div>
                <label for="selecaoCasa" class="block text-sm font-semibold text-slate-300 mb-1.5">Seleção da Casa</label>
                <input
                  type="text"
                  id="selecaoCasa"
                  formControlName="selecaoCasa"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="Ex: Brasil"
                />
                <div *ngIf="jogoForm.get('selecaoCasa')?.touched && jogoForm.get('selecaoCasa')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>

              <!-- Away Team -->
              <div>
                <label for="selecaoVisitante" class="block text-sm font-semibold text-slate-300 mb-1.5">Seleção Visitante</label>
                <input
                  type="text"
                  id="selecaoVisitante"
                  formControlName="selecaoVisitante"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="Ex: Argentina"
                />
                <div *ngIf="jogoForm.get('selecaoVisitante')?.touched && jogoForm.get('selecaoVisitante')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>
            </div>

            <!-- Date & Time Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Date -->
              <div>
                <label for="dataJogo" class="block text-sm font-semibold text-slate-300 mb-1.5">Data do Jogo</label>
                <input
                  type="date"
                  id="dataJogo"
                  formControlName="dataJogo"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                />
                <div *ngIf="jogoForm.get('dataJogo')?.touched && jogoForm.get('dataJogo')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>

              <!-- Time -->
              <div>
                <label for="horarioJogo" class="block text-sm font-semibold text-slate-300 mb-1.5">Horário (HH:mm)</label>
                <input
                  type="time"
                  id="horarioJogo"
                  formControlName="horarioJogo"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                />
                <div *ngIf="jogoForm.get('horarioJogo')?.touched && jogoForm.get('horarioJogo')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>
            </div>

            <!-- Stadium & Referee Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Stadium -->
              <div>
                <label for="estadio" class="block text-sm font-semibold text-slate-300 mb-1.5">Estádio</label>
                <input
                  type="text"
                  id="estadio"
                  formControlName="estadio"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="Ex: Maracanã"
                />
                <div *ngIf="jogoForm.get('estadio')?.touched && jogoForm.get('estadio')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>

              <!-- Referee -->
              <div>
                <label for="nomeJuiz" class="block text-sm font-semibold text-slate-300 mb-1.5">Árbitro</label>
                <input
                  type="text"
                  id="nomeJuiz"
                  formControlName="nomeJuiz"
                  class="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="Ex: Anderson Daronco"
                />
                <div *ngIf="jogoForm.get('nomeJuiz')?.touched && jogoForm.get('nomeJuiz')?.invalid" class="text-red-400 text-xs mt-1">
                  Campo obrigatório.
                </div>
              </div>
            </div>

            <!-- Status Checkbox (only in edit mode) -->
            <div *ngIf="isEditMode()" class="flex items-center bg-slate-950/40 p-3 rounded-lg border border-slate-850">
              <label class="flex items-center text-slate-300 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  formControlName="encerrado"
                  class="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-offset-0 focus:ring-emerald-500 mr-2"
                />
                Bloquear palpites (Encerrar jogo)
              </label>
            </div>

            <!-- Submit Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-850">
              <a
                routerLink="/jogos"
                class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-sm transition"
              >
                Cancelar
              </a>
              <button
                type="submit"
                [disabled]="jogoForm.invalid || isLoading()"
                class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm disabled:opacity-50 transition"
              >
                {{ isLoading() ? 'Gravando...' : 'Salvar Partida' }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
})
export class JogoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private jogosService = inject(JogosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  jogoId: string | null = null;

  jogoForm = this.fb.group({
    selecaoCasa: ['', Validators.required],
    selecaoVisitante: ['', Validators.required],
    dataJogo: ['', Validators.required],
    horarioJogo: ['', Validators.required],
    estadio: ['', Validators.required],
    nomeJuiz: ['', Validators.required],
    encerrado: [false],
  });

  ngOnInit(): void {
    this.jogoId = this.route.snapshot.paramMap.get('id');
    if (this.jogoId) {
      this.isEditMode.set(true);
      this.loadJogo(this.jogoId);
    }
  }

  loadJogo(id: string): void {
    this.isLoading.set(true);
    this.jogosService.obterJogoPorId(id).subscribe({
      next: (jogo) => {
        this.jogoForm.patchValue({
          selecaoCasa: jogo.selecaoCasa,
          selecaoVisitante: jogo.selecaoVisitante,
          dataJogo: jogo.dataJogo,
          horarioJogo: jogo.horarioJogo,
          estadio: jogo.estadio,
          nomeJuiz: jogo.nomeJuiz,
          encerrado: jogo.encerrado,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erro ao carregar dados do jogo.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.jogoForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = this.jogoForm.value;

    if (this.isEditMode() && this.jogoId) {
      const dto: UpdateJogoDto = {
        selecaoCasa: data.selecaoCasa!,
        selecaoVisitante: data.selecaoVisitante!,
        dataJogo: data.dataJogo!,
        horarioJogo: data.horarioJogo!,
        estadio: data.estadio!,
        nomeJuiz: data.nomeJuiz!,
        encerrado: data.encerrado!,
      };

      this.jogosService.atualizarJogo(this.jogoId, dto).subscribe({
        next: () => {
          this.router.navigate(['/jogos']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao atualizar o jogo.');
        },
      });
    } else {
      const dto: CreateJogoDto = {
        selecaoCasa: data.selecaoCasa!,
        selecaoVisitante: data.selecaoVisitante!,
        dataJogo: data.dataJogo!,
        horarioJogo: data.horarioJogo!,
        estadio: data.estadio!,
        nomeJuiz: data.nomeJuiz!,
      };

      this.jogosService.criarJogo(dto).subscribe({
        next: () => {
          this.router.navigate(['/jogos']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao criar o jogo.');
        },
      });
    }
  }
}
