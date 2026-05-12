import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, AuthResponse } from '@repo/utils';
import { MailService } from './mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(pass, user.password)) {
      // Removendo a senha antes de retornar
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        active: user.active,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: any): Promise<any> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      // Regra: se já existir, redirecionar (ou retornar erro para o front tratar)
      // Aqui vamos lançar um erro específico de negócio
      throw new BadRequestException('E-mail já cadastrado');
    }
    
    return this.usersService.create(registerDto);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.updateResetToken(user.id, token, expires);
    await this.mailService.sendPasswordResetEmail(email, token);
  }

  async resetPassword(resetDto: any): Promise<void> {
    const user = await this.usersService.findByResetToken(resetDto.token);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(resetDto.password, salt);

    await this.usersService.updatePassword(user.id, hashedPassword);
  }
}
