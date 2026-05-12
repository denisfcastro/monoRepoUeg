import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
      <div class="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
          <p class="text-slate-300 mt-2">Acesse sua conta para continuar</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage()" class="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg text-sm text-center">
          {{ errorMessage() }}
        </div>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
            <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">E-mail é obrigatório.</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">E-mail inválido.</span>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-200 mb-1">Senha</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">Senha é obrigatória.</span>
              <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Mínimo de 6 caracteres.</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center text-slate-300 cursor-pointer">
              <input type="checkbox" class="rounded border-white/20 bg-white/5 text-sky-500 focus:ring-offset-0 focus:ring-sky-500 mr-2" />
              Lembrar-me
            </label>
            <a routerLink="/forgot-password" class="text-sky-400 hover:text-sky-300 transition">Esqueceu a senha?</a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold p-3 rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {{ isLoading() ? 'Carregando...' : 'Entrar' }}
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center text-slate-300 text-sm">
          Não tem uma conta?
          <a routerLink="/register" class="text-sky-400 hover:text-sky-300 font-semibold transition">Cadastre-se</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.value as any;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Regra: mostrar mensagem genérica ou a que vem do backend
        this.errorMessage.set(err.error?.message || 'E-mail ou senha não confere');
      },
    });
  }
}
