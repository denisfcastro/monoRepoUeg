import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuração do transportador (SMTP)
    // Em produção, use variáveis de ambiente reais
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'ethereal.user',
        pass: this.configService.get<string>('SMTP_PASS') || 'ethereal.pass',
      },
      connectionTimeout: 5000,
      timeout: 5000,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `http://localhost:4200/reset-password?token=${token}`;
    
    // Regra: se não houver SMTP configurado, apenas loga no console para facilitar o teste
    const isEthereal = !this.configService.get<string>('SMTP_HOST');
    
    if (isEthereal) {
      this.logger.log(`[DEV] Link de recuperação para ${email}: ${resetUrl}`);
      return;
    }

    const mailOptions = {
      from: '"Suporte" <noreply@exemplo.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este link expira em 1 hora.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail de recuperação enviado para ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${email}`, error);
      throw error;
    }
  }
}
