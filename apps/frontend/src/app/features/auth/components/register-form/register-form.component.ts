import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
      <div class="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-white tracking-tight">Crie sua conta</h1>
          <p class="text-slate-300 mt-2">Cadastre-se para acessar o sistema</p>
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
        <form *ngIf="!successMessage()" [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-slate-200 mb-1">Nome Completo</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="John Doe"
            />
            <div *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid" class="text-red-400 text-xs mt-1">
              Nome é obrigatório.
            </div>
          </div>

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
            <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">E-mail é obrigatório.</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">E-mail inválido.</span>
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
            <div *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Senha é obrigatória.</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Mínimo de 6 caracteres.</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
            class="w-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold p-3 rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {{ isLoading() ? 'Carregando...' : 'Cadastrar' }}
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center text-slate-300 text-sm">
          Já tem uma conta?
          <a routerLink="/login" class="text-sky-400 hover:text-sky-300 font-semibold transition">Entrar</a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = this.registerForm.value as any;

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Cadastro realizado! Aguarde a liberação do administrador.');
        // Opcional: redirecionar após alguns segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        // Regra: se já existir, redirecionar ou mostrar erro
        if (err.error?.message === 'E-mail já cadastrado') {
          this.errorMessage.set('E-mail já cadastrado. Redirecionando para o login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage.set(err.error?.message || 'Erro ao realizar cadastro');
        }
      },
    });
  }
}
