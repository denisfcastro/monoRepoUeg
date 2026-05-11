import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, LoginDto, RegisterDto, AuthResponse } from '@repo/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Estado com Signals
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));
  isAuthenticated = computed(() => !!this.token());

  constructor() {
    // Restaurar usuário se houver token
    if (this.token()) {
      // Aqui poderíamos chamar um endpoint /auth/me para validar o token e pegar os dados do usuário
      // Por simplicidade, vamos apenas manter o estado autenticado
      // TODO: Implementar endpoint /auth/me no backend e chamar aqui
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  private setSession(authResponse: AuthResponse): void {
    this.currentUser.set(authResponse.user);
    this.token.set(authResponse.token);
    localStorage.setItem('token', authResponse.token);
  }
}
