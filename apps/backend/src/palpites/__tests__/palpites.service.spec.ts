import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PalpitesService } from '../palpites.service';
import { Palpite } from '../palpite.entity';
import { JogosService } from '../../jogos/jogos.service';
import { Jogo } from '../../jogos/jogo.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CreatePalpiteDto, UpdatePalpiteDto } from '@repo/utils';
import { HttpStatus } from '@nestjs/common';

describe('PalpitesService', () => {
  let service: PalpitesService;
  let repository: Repository<Palpite>;
  let jogosService: JogosService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJogosService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PalpitesService,
        {
          provide: getRepositoryToken(Palpite),
          useValue: mockRepository,
        },
        {
          provide: JogosService,
          useValue: mockJogosService,
        },
      ],
    }).compile();

    service = module.get<PalpitesService>(PalpitesService);
    repository = module.get<Repository<Palpite>>(getRepositoryToken(Palpite));
    jogosService = module.get<JogosService>(JogosService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a palpite suggestions successfully', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreatePalpiteDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.count.mockResolvedValue(2); // Has 2, adding 1 more is fine (total 3 <= 4)
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: 'palpite-1', ...createDto });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('palpite-1');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw PALPITE_001 if game already has 4 palpites', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreatePalpiteDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.count.mockResolvedValue(4); // already has 4

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('PALPITE_001', 'Não é possível ter mais de 4 palpites recomendados para o mesmo jogo', HttpStatus.BAD_REQUEST)
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw PALPITE_002 if game is already finished (encerrado)', async () => {
      const jogo = { id: 'jogo-1', encerrado: true } as Jogo;
      const createDto: CreatePalpiteDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('PALPITE_002', 'Não é possível criar ou alterar palpites para um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw PALPITE_003 if score is invalid (less than 0)', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreatePalpiteDto = {
        jogoId: 'jogo-1',
        golsCasa: -1,
        golsVisitante: 1,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('PALPITE_003', 'O placar deve ser um valor inteiro entre 0 e 20 gols', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw PALPITE_003 if score is invalid (greater than 20)', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const createDto: CreatePalpiteDto = {
        jogoId: 'jogo-1',
        golsCasa: 2,
        golsVisitante: 21,
      };

      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('PALPITE_003', 'O placar deve ser um valor inteiro entre 0 e 20 gols', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('update', () => {
    it('should update successfully if game is not finished and scores are valid', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const palpite = { id: 'palpite-1', jogoId: 'jogo-1', golsCasa: 1, golsVisitante: 1 } as Palpite;
      const updateDto: UpdatePalpiteDto = { golsCasa: 3 };

      mockRepository.findOne.mockResolvedValueOnce(palpite);
      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({ ...palpite, ...updateDto });

      const result = await service.update('palpite-1', updateDto);

      expect(result.golsCasa).toBe(3);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should throw PALPITE_002 if game is finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: true } as Jogo;
      const palpite = { id: 'palpite-1', jogoId: 'jogo-1', golsCasa: 1, golsVisitante: 1 } as Palpite;
      const updateDto: UpdatePalpiteDto = { golsCasa: 3 };

      mockRepository.findOne.mockResolvedValue(palpite);
      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.update('palpite-1', updateDto)).rejects.toThrow(
        new BusinessException('PALPITE_002', 'Não é possível criar ou alterar palpites para um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('delete', () => {
    it('should delete successfully if game is not finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: false } as Jogo;
      const palpite = { id: 'palpite-1', jogoId: 'jogo-1' } as Palpite;

      mockRepository.findOne.mockResolvedValue(palpite);
      mockJogosService.findOne.mockResolvedValue(jogo);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('palpite-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('palpite-1');
    });

    it('should throw PALPITE_002 if game is finished', async () => {
      const jogo = { id: 'jogo-1', encerrado: true } as Jogo;
      const palpite = { id: 'palpite-1', jogoId: 'jogo-1' } as Palpite;

      mockRepository.findOne.mockResolvedValue(palpite);
      mockJogosService.findOne.mockResolvedValue(jogo);

      await expect(service.remove('palpite-1')).rejects.toThrow(
        new BusinessException('PALPITE_002', 'Não é possível criar ou alterar palpites para um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
    });
  });
});
