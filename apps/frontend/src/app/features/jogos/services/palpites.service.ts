import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Palpite, CreatePalpiteDto, UpdatePalpiteDto } from '@repo/utils';

@Injectable({
  providedIn: 'root',
})
export class PalpitesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/palpites`;

  obterPalpitesPorJogo(jogoId: string): Observable<Palpite[]> {
    return this.http.get<Palpite[]>(`${this.apiUrl}?jogoId=${jogoId}`);
  }

  criarPalpite(dto: CreatePalpiteDto): Observable<Palpite> {
    return this.http.post<Palpite>(this.apiUrl, dto);
  }

  atualizarPalpite(id: string, dto: UpdatePalpiteDto): Observable<Palpite> {
    return this.http.patch<Palpite>(`${this.apiUrl}/${id}`, dto);
  }

  excluirPalpite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
