import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JogosService } from './jogos.service';
import { environment } from '../../../../environments/environment';
import { Jogo } from '@repo/utils';

describe('JogosService', () => {
  let service: JogosService;
  let httpMock: HttpTestingController;
  const mockApiUrl = `${environment.apiUrl}/jogos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JogosService],
    });

    service = TestBed.inject(JogosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load games and update signals', () => {
    const mockGames: Jogo[] = [
      {
        id: '1',
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: '2026-06-10',
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
        encerrado: false,
      },
    ];

    service.carregarJogos().subscribe((games) => {
      expect(games.length).toBe(1);
      expect(games).toEqual(mockGames);
    });

    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne(mockApiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockGames);

    expect(service.loading()).toBe(false);
    expect(service.jogos()).toEqual(mockGames);
    expect(service.error()).toBeNull();
  });

  it('should handle error when loading games fails', () => {
    service.carregarJogos().subscribe({
      error: (err) => {
        expect(err).toBeTruthy();
      },
    });

    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne(mockApiUrl);
    req.error(new ProgressEvent('error'));

    expect(service.loading()).toBe(false);
    expect(service.error()).toContain('Erro ao carregar os jogos');
  });
});
