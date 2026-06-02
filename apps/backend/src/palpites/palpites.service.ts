import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Palpite } from './palpite.entity';
import { JogosService } from '../jogos/jogos.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { CreatePalpiteDto, UpdatePalpiteDto } from '@repo/utils';

@Injectable()
export class PalpitesService {
  constructor(
    @InjectRepository(Palpite)
    private palpitesRepository: Repository<Palpite>,
    private jogosService: JogosService,
  ) {}

  async create(createDto: CreatePalpiteDto): Promise<Palpite> {
    const jogo = await this.jogosService.findOne(createDto.jogoId);

    // Validação PALPITE_002: Não pode criar palpite de jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'PALPITE_002',
        'Não é possível criar ou alterar palpites para um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação PALPITE_003: Placar entre 0 e 20
    if (
      createDto.golsCasa < 0 ||
      createDto.golsCasa > 20 ||
      createDto.golsVisitante < 0 ||
      createDto.golsVisitante > 20
    ) {
      throw new BusinessException(
        'PALPITE_003',
        'O placar deve ser um valor inteiro entre 0 e 20 gols',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação PALPITE_001: Máximo de 4 palpites por jogo
    const count = await this.palpitesRepository.count({
      where: { jogoId: createDto.jogoId },
    });
    if (count >= 4) {
      throw new BusinessException(
        'PALPITE_001',
        'Não é possível ter mais de 4 palpites recomendados para o mesmo jogo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const palpite = this.palpitesRepository.create(createDto);
    return this.palpitesRepository.save(palpite);
  }

  async findByJogo(jogoId: string): Promise<Palpite[]> {
    return this.palpitesRepository.find({
      where: { jogoId },
    });
  }

  async findOne(id: string): Promise<Palpite> {
    const palpite = await this.palpitesRepository.findOne({
      where: { id },
    });

    if (!palpite) {
      throw new BusinessException(
        'PALPITE_NOT_FOUND',
        'Palpite não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    return palpite;
  }

  async update(id: string, updateDto: UpdatePalpiteDto): Promise<Palpite> {
    const palpite = await this.findOne(id);
    const jogo = await this.jogosService.findOne(palpite.jogoId);

    // Validação PALPITE_002: Não pode alterar palpite de jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'PALPITE_002',
        'Não é possível criar ou alterar palpites para um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação PALPITE_003: Placar entre 0 e 20
    const golsCasa = updateDto.golsCasa !== undefined ? updateDto.golsCasa : palpite.golsCasa;
    const golsVisitante = updateDto.golsVisitante !== undefined ? updateDto.golsVisitante : palpite.golsVisitante;

    if (golsCasa < 0 || golsCasa > 20 || golsVisitante < 0 || golsVisitante > 20) {
      throw new BusinessException(
        'PALPITE_003',
        'O placar deve ser um valor inteiro entre 0 e 20 gols',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.palpitesRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const palpite = await this.findOne(id);
    const jogo = await this.jogosService.findOne(palpite.jogoId);

    // Validação PALPITE_002: Não pode excluir palpite de jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'PALPITE_002',
        'Não é possível criar ou alterar palpites para um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.palpitesRepository.delete(id);
  }
}
