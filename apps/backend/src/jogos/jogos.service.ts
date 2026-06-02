import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jogo } from './jogo.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { CreateJogoDto, UpdateJogoDto } from '@repo/utils';

@Injectable()
export class JogosService {
  constructor(
    @InjectRepository(Jogo)
    private jogosRepository: Repository<Jogo>,
  ) {}

  async create(createDto: CreateJogoDto): Promise<Jogo> {
    // Validação JOGO_001: Data/hora no passado
    // Tratando no fuso local ou geral. Criando o objeto Date a partir da data/hora informadas
    const gameDateTime = new Date(`${createDto.dataJogo}T${createDto.horarioJogo}:00`);
    if (isNaN(gameDateTime.getTime()) || gameDateTime < new Date()) {
      throw new BusinessException(
        'JOGO_001',
        'Não é possível cadastrar jogo com data/hora no passado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação JOGO_002: Duplicidade (mesma data + hora + seleções)
    const existing = await this.jogosRepository.findOne({
      where: [
        {
          dataJogo: createDto.dataJogo,
          horarioJogo: createDto.horarioJogo,
          selecaoCasa: createDto.selecaoCasa,
          selecaoVisitante: createDto.selecaoVisitante,
        },
        {
          dataJogo: createDto.dataJogo,
          horarioJogo: createDto.horarioJogo,
          selecaoCasa: createDto.selecaoVisitante,
          selecaoVisitante: createDto.selecaoCasa,
        },
      ],
    });

    if (existing) {
      throw new BusinessException(
        'JOGO_002',
        'Já existe um jogo cadastrado para estas seleções nesta data e horário',
        HttpStatus.CONFLICT,
      );
    }

    const jogo = this.jogosRepository.create({
      ...createDto,
      encerrado: false,
    });

    return this.jogosRepository.save(jogo);
  }

  async findAll(): Promise<Jogo[]> {
    return this.jogosRepository.find({
      relations: ['palpites'],
      order: {
        dataJogo: 'ASC',
        horarioJogo: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Jogo> {
    const jogo = await this.jogosRepository.findOne({
      where: { id },
      relations: ['palpites'],
    });

    if (!jogo) {
      throw new BusinessException(
        'JOGO_NOT_FOUND',
        'Jogo não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return jogo;
  }

  async update(id: string, updateDto: UpdateJogoDto): Promise<Jogo> {
    const jogo = await this.findOne(id);

    // Validação JOGO_003: Não pode editar jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'JOGO_003',
        'Não é possível editar ou excluir um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.jogosRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const jogo = await this.findOne(id);

    // Validação JOGO_003: Não pode excluir jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'JOGO_003',
        'Não é possível editar ou excluir um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.jogosRepository.delete(id);
  }

  async encerrar(id: string): Promise<Jogo> {
    const jogo = await this.findOne(id);
    jogo.encerrado = true;
    return this.jogosRepository.save(jogo);
  }
}
