import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
      <div class="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-white tracking-tight">Recuperar Senha</h1>
          <p class="text-slate-300 mt-2">Digite seu e-mail para receber o link de recuperação</p>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage()" class="bg-green-500/20 border border-green-500 text-green-100 p-3 rounded-lg text-sm text-center">
          {{ successMessage() }}
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm text-center">
          {{ errorMessage() }}
        </div>

        <!-- Form -->
        <form *ngIf="!successMessage()" [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-200 mb-1">E-mail</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="seu@email.com"
            />
            <div *ngIf="forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="forgotForm.get('email')?.errors?.['required']">E-mail é obrigatório.</span>
              <span *ngIf="forgotForm.get('email')?.errors?.['email']">E-mail inválido.</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="forgotForm.invalid || isLoading()"
            class="w-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold p-3 rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {{ isLoading() ? 'Enviando...' : 'Enviar Link' }}
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center text-slate-300 text-sm">
          Lembrou a senha?
          <a routerLink="/login" class="text-sky-400 hover:text-sky-300 font-semibold transition">Voltar para o Login</a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = this.forgotForm.value as any;

    this.authService.forgotPassword(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Se o e-mail estiver cadastrado, você receberá um link de recuperação em breve.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao processar solicitação');
      },
    });
  }
}
