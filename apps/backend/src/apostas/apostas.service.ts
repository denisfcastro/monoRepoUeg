import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aposta } from './aposta.entity';
import { JogosService } from '../jogos/jogos.service';
import { PalpitesService } from '../palpites/palpites.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { CreateApostaDto } from '@repo/utils';

@Injectable()
export class ApostasService {
  constructor(
    @InjectRepository(Aposta)
    private apostasRepository: Repository<Aposta>,
    private jogosService: JogosService,
    private palpitesService: PalpitesService,
  ) {}

  async create(userId: string, createDto: CreateApostaDto): Promise<Aposta> {
    const jogo = await this.jogosService.findOne(createDto.jogoId);

    // Validação APOSTA_002: Não pode apostar em jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'APOSTA_002',
        'Não é possível apostar em um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação APOSTA_003: Placar entre 0 e 20
    if (
      createDto.golsCasa < 0 ||
      createDto.golsCasa > 20 ||
      createDto.golsVisitante < 0 ||
      createDto.golsVisitante > 20
    ) {
      throw new BusinessException(
        'APOSTA_003',
        'O placar deve ser um valor inteiro entre 0 e 20 gols',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validação APOSTA_001: Usuário só pode apostar 1x por jogo
    const existing = await this.apostasRepository.findOne({
      where: { jogoId: createDto.jogoId, userId },
    });
    if (existing) {
      throw new BusinessException(
        'APOSTA_001',
        'Usuário já realizou uma aposta para este jogo',
        HttpStatus.CONFLICT,
      );
    }

    let odd = 1.50; // Odd base para palpites customizados

    if (createDto.palpiteId) {
      // Se selecionou recomendação, usa a Odd que o ADMIN configurou
      const palpite = await this.palpitesService.findOne(createDto.palpiteId);
      odd = Number(palpite.odd);
    } else {
      // Cálculo Dinâmico para Palpite Customizado
      // Odd = 1.50 + (Total de Gols * 0.50) + (Diferença de Gols * 0.75)
      const totalGols = createDto.golsCasa + createDto.golsVisitante;
      const diferencaGols = Math.abs(createDto.golsCasa - createDto.golsVisitante);
      odd = 1.50 + (totalGols * 0.50) + (diferencaGols * 0.75);
    }

    const aposta = this.apostasRepository.create({
      ...createDto,
      userId,
      odd,
    });

    return this.apostasRepository.save(aposta);
  }

  async findByUser(userId: string): Promise<Aposta[]> {
    return this.apostasRepository.find({
      where: { userId },
      relations: ['jogo', 'palpite'],
    });
  }

  async findOne(id: string): Promise<Aposta> {
    const aposta = await this.apostasRepository.findOne({
      where: { id },
      relations: ['jogo'],
    });

    if (!aposta) {
      throw new BusinessException(
        'APOSTA_NOT_FOUND',
        'Aposta não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    return aposta;
  }

  async remove(userId: string, id: string): Promise<void> {
    const aposta = await this.findOne(id);

    // Validação de propriedade: Somente o dono da aposta pode excluir
    if (aposta.userId !== userId) {
      throw new BusinessException(
        'FORBIDDEN',
        'Você não tem permissão para excluir esta aposta',
        HttpStatus.FORBIDDEN,
      );
    }

    const jogo = await this.jogosService.findOne(aposta.jogoId);

    // Validação APOSTA_002: Não pode excluir aposta de jogo encerrado
    if (jogo.encerrado) {
      throw new BusinessException(
        'APOSTA_002',
        'Não é possível excluir aposta de um jogo encerrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.apostasRepository.delete(id);
  }
}
