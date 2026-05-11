import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Usando email em vez de username
  }

  async validate(email: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      // Regra: mensagem genérica "E-mail ou senha não confere"
      throw new UnauthorizedException('E-mail ou senha não confere');
    }
    
    // Regra: usuário deve estar ativo
    if (!user.active) {
      throw new UnauthorizedException('Usuário pendente de liberação pelo administrador');
    }
    
    return user;
  }
}
