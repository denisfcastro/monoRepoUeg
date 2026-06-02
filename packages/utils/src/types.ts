export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// === JOGO ===
export interface Jogo {
  id: string;
  selecaoCasa: string;
  selecaoVisitante: string;
  dataJogo: string;       // formato YYYY-MM-DD
  horarioJogo: string;    // formato HH:mm
  estadio: string;
  nomeJuiz: string;
  encerrado: boolean;
  palpites?: Palpite[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateJogoDto {
  selecaoCasa: string;
  selecaoVisitante: string;
  dataJogo: string;
  horarioJogo: string;
  estadio: string;
  nomeJuiz: string;
}

export interface UpdateJogoDto extends Partial<CreateJogoDto> {
  encerrado?: boolean;
}

// === PALPITE ===
export interface Palpite {
  id: string;
  jogoId: string;
  golsCasa: number;
  golsVisitante: number;
  odd: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePalpiteDto {
  jogoId: string;
  golsCasa: number;
  golsVisitante: number;
  odd: number;
}

export interface UpdatePalpiteDto {
  golsCasa?: number;
  golsVisitante?: number;
  odd?: number;
}

// === APOSTA ===
export interface Aposta {
  id: string;
  jogoId: string;
  userId: string;
  palpiteId?: string;
  golsCasa: number;
  golsVisitante: number;
  odd: number;
  jogo?: Jogo;
  user?: User;
  palpite?: Palpite;
  createdAt?: Date;
}

export interface CreateApostaDto {
  jogoId: string;
  palpiteId?: string;    // se escolheu recomendado
  golsCasa: number;
  golsVisitante: number;
}

