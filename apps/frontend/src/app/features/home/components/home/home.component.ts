import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4 text-white">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center space-y-6 max-w-md w-full">
        <h1 class="text-4xl font-bold tracking-tight">Área Restrita</h1>
        <p class="text-slate-300">Você está autenticado com sucesso!</p>
        
        <div class="bg-white/5 p-4 rounded-lg text-left text-sm space-y-2">
          <p><span class="font-semibold text-slate-400">E-mail:</span> {{ authService.currentUser()?.email }}</p>
          <p><span class="font-semibold text-slate-400">Regra:</span> {{ authService.currentUser()?.role }}</p>
        </div>

        <button
          (click)="logout()"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded-lg transition duration-300"
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  `,
})
export class HomeComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
