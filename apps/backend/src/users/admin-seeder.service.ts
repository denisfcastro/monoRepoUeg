import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedUser();
  }

  private async seedAdmin() {
    const adminExists = await this.userRepository.findOne({
      where: { role: 'ADMIN' },
    });

    if (!adminExists) {
      this.logger.log('Nenhum usuário administrador encontrado. Criando admin padrão...');

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = this.userRepository.create({
        name: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'ADMIN',
        active: true, // Admin já nasce ativo
      });

      await this.userRepository.save(admin);
      this.logger.log('Usuário administrador criado com sucesso: admin@admin.com / admin123');
    } else {
      this.logger.log('Usuário administrador já existe.');
    }
  }

  private async seedUser() {
    const userExists = await this.userRepository.findOne({
      where: { email: 'user@user.com' },
    });

    if (!userExists) {
      this.logger.log('Nenhum usuário comum de testes encontrado. Criando...');

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('user123', salt);

      const user = this.userRepository.create({
        name: 'Usuario Comum',
        email: 'user@user.com',
        password: hashedPassword,
        role: 'USER',
        active: true, // Usuário comum de testes ativo
      });

      await this.userRepository.save(user);
      this.logger.log('Usuário comum de testes criado com sucesso: user@user.com / user123');
    } else {
      this.logger.log('Usuário comum de testes já existe.');
    }
  }
}
