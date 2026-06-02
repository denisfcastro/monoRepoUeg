import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApostasService } from '../apostas.service';
import { Aposta } from '../aposta.entity';
import { JogosService } from '../../jogos/jogos.service';
import { Jogo } from '../../jogos/jogo.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CreateApostaDto } from '@repo/utils';
import { HttpStatus } from '@nestjs/common';

import { PalpitesService } from '../../palpites/palpites.service';

describe('ApostasService', () => {
  let service: ApostasService;
  let repository: Repository<Aposta>;
  let jogosService: JogosService;
  let palpitesService: PalpitesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockJogosService = {
    findOne: jest.fn(),
  };

  const mockPalpitesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApostasService,
        {
          provide: getRepositoryToken(Aposta),
          useValue: mockRepository,
        },
        {
          provide: JogosService,
          useValue: mockJogosService,
        },
        {
          provide: PalpitesService,
          useValue: mockPalpitesService,
        },
      ],
    }).compile();

    service = module.get<ApostasService>(ApostasService);
    repository = module.get<Repository<Aposta>>(getRepositoryToken(Aposta));
    jogosService = module.get<JogosService>(JogosService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an aposta successfully if valid', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreateApostaDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.findOne.mockResolvedValue(null); // No existing aposta by user
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: 'aposta-1', ...createDto, userId: 'user-1' });

      const result = await service.create('user-1', createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('aposta-1');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw APOSTA_001 if user already has an aposta for this game', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreateApostaDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.findOne.mockResolvedValue({ id: 'aposta-existing' }); // User already apostou

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        new BusinessException('APOSTA_001', 'Usuário já realizou uma aposta para este jogo', HttpStatus.CONFLICT)
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw APOSTA_002 if game is finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: true } as Jogo;
      const createDto: CreateApostaDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        new BusinessException('APOSTA_002', 'Não é possível apostar em um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw APOSTA_003 if score is negative', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreateApostaDto = {
        jogoId: 'jogo-1',
        golsCasa: -1,
        golsVisitante: 0,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        new BusinessException('APOSTA_003', 'O placar deve ser um valor inteiro entre 0 e 20 gols', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('delete', () => {
    it('should delete aposta successfully if game is not finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const aposta = { id: 'aposta-1', jogoId: 'jogo-1', userId: 'user-1' } as Aposta;

      mockRepository.findOne.mockResolvedValue(aposta);
      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('user-1', 'aposta-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('aposta-1');
    });

    it('should throw APOSTA_002 if game is finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: true } as Jogo;
      const aposta = { id: 'aposta-1', jogoId: 'jogo-1', userId: 'user-1' } as Aposta;

      mockRepository.findOne.mockResolvedValue(aposta);
      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.remove('user-1', 'aposta-1')).rejects.toThrow(
        new BusinessException('APOSTA_002', 'Não é possível excluir aposta de um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw FORBIDDEN if user tries to delete another user\'s aposta', async () => {
      const aposta = { id: 'aposta-1', jogoId: 'jogo-1', userId: 'user-2' } as Aposta; // Owned by user-2

      mockRepository.findOne.mockResolvedValue(aposta);

      await expect(service.remove('user-1', 'aposta-1')).rejects.toThrow(
        new BusinessException('FORBIDDEN', 'Você não tem permissão para excluir esta aposta', HttpStatus.FORBIDDEN)
      );
    });
  });
});
