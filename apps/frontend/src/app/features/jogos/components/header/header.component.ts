import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <a routerLink="/" class="flex items-center space-x-2">
            <span class="text-2xl font-bold bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">BET-UEG</span>
            <span class="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300 font-mono">v1.0</span>
          </a>
          <nav class="hidden md:flex space-x-6 text-sm font-medium">
            <a routerLink="/jogos" routerLinkActive="text-emerald-400" class="text-slate-300 hover:text-white transition">Partidas</a>
            <a routerLink="/minhas-apostas" routerLinkActive="text-emerald-400" class="text-slate-300 hover:text-white transition">Minhas Apostas</a>
          </nav>
        </div>

        <div class="flex items-center space-x-4">
          <div class="hidden sm:block text-right">
            <div class="text-sm font-semibold text-slate-100">{{ authService.currentUser()?.name }}</div>
            <div class="text-xs text-slate-400 flex items-center justify-end space-x-1">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>{{ authService.currentUser()?.role === 'ADMIN' ? 'Administrador' : 'Apostador' }}</span>
            </div>
          </div>

          <div class="h-8 w-px bg-slate-800"></div>

          <button
            (click)="logout()"
            class="text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
