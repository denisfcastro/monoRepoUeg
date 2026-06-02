import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JogosDashboardComponent } from './jogos-dashboard.component';
import { JogosService } from '../../services/jogos.service';
import { AuthService } from '../../../auth/services/auth.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Jogo, User } from '@repo/utils';

describe('JogosDashboardComponent', () => {
  let component: JogosDashboardComponent;
  let fixture: ComponentFixture<JogosDashboardComponent>;

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
      palpites: [],
    },
    {
      id: 'jogo-2',
      selecaoCasa: 'França',
      selecaoVisitante: 'Itália',
      dataJogo: '2026-06-12',
      horarioJogo: '18:00',
      estadio: 'Stade de France',
      nomeJuiz: 'Clément Turpin',
      encerrado: true,
      palpites: [],
    },
    {
      id: 'jogo-3',
      selecaoCasa: 'Alemanha',
      selecaoVisitante: 'Espanha',
      dataJogo: '2026-06-15',
      horarioJogo: '20:00',
      estadio: 'Allianz Arena',
      nomeJuiz: 'Felix Zwayer',
      encerrado: false,
      palpites: [],
    },
  ]);

  const mockJogosService = {
    jogos: mockJogosSignal,
    carregarJogos: () => of(mockJogosSignal()),
    excluirJogo: (id: string) => of(void 0),
  };

  const mockUserSignal = signal<User | null>({
    id: 'user-1',
    name: 'Administrador',
    email: 'admin@admin.com',
    active: true,
    role: 'ADMIN',
  });

  const mockAuthService = {
    currentUser: mockUserSignal,
    logout: () => {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JogosDashboardComponent, RouterTestingModule],
      providers: [
        { provide: JogosService, useValue: mockJogosService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JogosDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of games in a table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Brasil');
    expect(compiled.textContent).toContain('França');
    expect(compiled.textContent).toContain('Alemanha');
  });

  it('should filter games based on search query', () => {
    component.searchQuery.set('Stade');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Brasil');
    expect(compiled.textContent).toContain('França');
  });

  it('should respect page size and paginate', () => {
    component.pageSize.set(2);
    fixture.detectChanges();

    expect(component.totalPages()).toBe(2);
    expect(component.paginatedJogos().length).toBe(2);
    expect(component.paginatedJogos()[0].selecaoCasa).toBe('Brasil');

    component.nextPage();
    fixture.detectChanges();

    expect(component.currentPage()).toBe(2);
    expect(component.paginatedJogos().length).toBe(1);
    expect(component.paginatedJogos()[0].selecaoCasa).toBe('Alemanha');
  });
});
