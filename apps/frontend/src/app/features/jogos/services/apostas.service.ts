import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Aposta, CreateApostaDto } from '@repo/utils';

@Injectable({
  providedIn: 'root',
})
export class ApostasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/apostas`;

  minhasApostas = signal<Aposta[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  carregarMinhasApostas(): Observable<Aposta[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Aposta[]>(`${this.apiUrl}/minhas`).pipe(
      tap({
        next: (dados) => {
          this.minhasApostas.set(dados);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erro ao carregar suas apostas.');
          this.loading.set(false);
        },
      })
    );
  }

  criarAposta(dto: CreateApostaDto): Observable<Aposta> {
    return this.http.post<Aposta>(this.apiUrl, dto).pipe(
      tap((novaAposta) => {
        this.minhasApostas.update((lista) => [...lista, novaAposta]);
      })
    );
  }

  excluirAposta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.minhasApostas.update((lista) => lista.filter((a) => a.id !== id));
      })
    );
  }
}
