import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JogoListComponent } from './jogo-list.component';
import { JogosService } from '../../services/jogos.service';
import { ApostasService } from '../../services/apostas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Jogo, User, Aposta } from '@repo/utils';

describe('JogoListComponent', () => {
  let component: JogoListComponent;
  let fixture: ComponentFixture<JogoListComponent>;

  const mockJogosSignal = signal<Jogo[]>([
    {
      id: 'jogo-1',
      selecaoCasa: 'Brasil',
      selecaoVisitante: 'Argentina',
      dataJogo: '2026-06-10',
      horarioJogo: '16:00',
      estadio: 'Maracanã',
      nomeJuiz: 'Anderson Daronco',
      encerrado: false,
    },
  ]);

  const mockLoadingSignal = signal<boolean>(false);
  const mockErrorSignal = signal<string | null>(null);

  const mockJogosService = {
    jogos: mockJogosSignal,
    loading: mockLoadingSignal,
    error: mockErrorSignal,
    carregarJogos: () => of(mockJogosSignal()),
  };

  const mockApostasSignal = signal<Aposta[]>([]);
  const mockApostasService = {
    minhasApostas: mockApostasSignal,
    loading: () => false,
    carregarMinhasApostas: () => of([]),
  };

  const mockUserSignal = signal<User | null>({
    id: 'user-1',
    name: 'Denis',
    email: 'denis@test.com',
    active: true,
    role: 'ADMIN',
  });

  const mockAuthService = {
    currentUser: mockUserSignal,
    logout: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JogoListComponent, RouterTestingModule],
      providers: [
        { provide: JogosService, useValue: mockJogosService },
        { provide: ApostasService, useValue: mockApostasService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JogoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render list of games', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const matchCard = compiled.querySelector('.bg-slate-900');
    expect(matchCard).toBeTruthy();
    expect(compiled.textContent).toContain('Brasil');
    expect(compiled.textContent).toContain('Argentina');
  });

  it('should enable admin options for ADMIN role', () => {
    expect(component.isAdmin()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    const adminLink = compiled.querySelector('[title="Gerenciar Palpites"]');
    expect(adminLink).toBeTruthy();
  });
});
