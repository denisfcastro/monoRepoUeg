import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
      <div class="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-white tracking-tight">Redefinir Senha</h1>
          <p class="text-slate-300 mt-2">Digite sua nova senha abaixo</p>
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
        <form *ngIf="!successMessage()" [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-200 mb-1">Nova Senha</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            <div *ngIf="resetForm.get('password')?.touched && resetForm.get('password')?.invalid" class="text-red-400 text-xs mt-1">
              <span *ngIf="resetForm.get('password')?.errors?.['required']">Senha é obrigatória.</span>
              <span *ngIf="resetForm.get('password')?.errors?.['minlength']">Mínimo de 6 caracteres.</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="resetForm.invalid || isLoading() || !token()"
            class="w-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold p-3 rounded-lg hover:from-sky-600 hover:to-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
          >
            {{ isLoading() ? 'Processando...' : 'Redefinir Senha' }}
          </button>
        </form>

        <div *ngIf="!token()" class="text-center text-red-400 text-sm">
          Token de recuperação ausente na URL.
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  token = signal<string | null>(null);

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    // Captura o token da URL (ex: /reset-password?token=abc)
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    
    if (!this.token()) {
      this.errorMessage.set('Token de recuperação inválido ou ausente.');
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = {
      token: this.token()!,
      password: this.resetForm.value.password!,
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Senha redefinida com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao redefinir senha');
      },
    });
  }
}
