import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Jogo, CreateJogoDto, UpdateJogoDto } from '@repo/utils';

@Injectable({
  providedIn: 'root',
})
export class JogosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jogos`;

  // Signals for state
  jogos = signal<Jogo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  carregarJogos(): Observable<Jogo[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Jogo[]>(this.apiUrl).pipe(
      tap({
        next: (dados) => {
          this.jogos.set(dados);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erro ao carregar os jogos. Tente novamente mais tarde.');
          this.loading.set(false);
        },
      })
    );
  }

  obterJogoPorId(id: string): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.apiUrl}/${id}`);
  }

  criarJogo(dto: CreateJogoDto): Observable<Jogo> {
    return this.http.post<Jogo>(this.apiUrl, dto).pipe(
      tap((novoJogo) => {
        this.jogos.update((lista) => [...lista, novoJogo]);
      })
    );
  }

  atualizarJogo(id: string, dto: UpdateJogoDto): Observable<Jogo> {
    return this.http.patch<Jogo>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((jogoAtualizado) => {
        this.jogos.update((lista) =>
          lista.map((j) => (j.id === id ? jogoAtualizado : j))
        );
      })
    );
  }

  encerrarJogo(id: string): Observable<Jogo> {
    return this.http.patch<Jogo>(`${this.apiUrl}/${id}/encerrar`, {}).pipe(
      tap((jogoEncerrado) => {
        this.jogos.update((lista) =>
          lista.map((j) => (j.id === id ? jogoEncerrado : j))
        );
      })
    );
  }

  excluirJogo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.jogos.update((lista) => lista.filter((j) => j.id !== id));
      })
    );
  }
}
