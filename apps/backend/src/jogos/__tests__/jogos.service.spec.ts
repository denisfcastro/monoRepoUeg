import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JogosService } from '../jogos.service';
import { Jogo } from '../jogo.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CreateJogoDto, UpdateJogoDto } from '@repo/utils';
import { HttpStatus } from '@nestjs/common';

describe('JogosService', () => {
  let service: JogosService;
  let repository: Repository<Jogo>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JogosService,
        {
          provide: getRepositoryToken(Jogo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JogosService>(JogosService);
    repository = module.get<Repository<Jogo>>(getRepositoryToken(Jogo));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a game successfully if all inputs are valid', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dataStr = tomorrow.toISOString().split('T')[0];

      const createDto: CreateJogoDto = {
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: dataStr,
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue({ id: '1', ...createDto, encerrado: false });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw JOGO_001 if date is in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dataStr = yesterday.toISOString().split('T')[0];

      const createDto: CreateJogoDto = {
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: dataStr,
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
      };

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('JOGO_001', 'Não é possível cadastrar jogo com data/hora no passado', HttpStatus.BAD_REQUEST)
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw JOGO_002 if game already exists with same teams, date, and time', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dataStr = tomorrow.toISOString().split('T')[0];

      const createDto: CreateJogoDto = {
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: dataStr,
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
      };

      mockRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException('JOGO_002', 'Já existe um jogo cadastrado para estas seleções nesta data e horário', HttpStatus.CONFLICT)
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update game successfully if not finished', async () => {
      const existingGame = {
        id: '1',
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: '2030-12-12',
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
        encerrado: false,
      } as Jogo;

      const updateDto: UpdateJogoDto = {
        estadio: 'Mineirão',
      };

      mockRepository.findOne.mockResolvedValueOnce(existingGame);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce({ ...existingGame, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(result.estadio).toBe('Mineirão');
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw JOGO_003 when trying to update a finished game', async () => {
      const finishedGame = {
        id: '1',
        selecaoCasa: 'Brasil',
        selecaoVisitante: 'Argentina',
        dataJogo: '2020-12-12',
        horarioJogo: '16:00',
        estadio: 'Maracanã',
        nomeJuiz: 'Daronco',
        encerrado: true,
      } as Jogo;

      const updateDto: UpdateJogoDto = {
        estadio: 'Mineirão',
      };

      mockRepository.findOne.mockResolvedValue(finishedGame);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new BusinessException('JOGO_003', 'Não é possível editar ou excluir um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw JOGO_003 when trying to delete a finished game', async () => {
      const finishedGame = {
        id: '1',
        encerrado: true,
      } as Jogo;

      mockRepository.findOne.mockResolvedValue(finishedGame);

      await expect(service.remove('1')).rejects.toThrow(
        new BusinessException('JOGO_003', 'Não é possível editar ou excluir um jogo encerrado', HttpStatus.BAD_REQUEST)
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete game successfully if not finished', async () => {
      const openGame = {
        id: '1',
        encerrado: false,
      } as Jogo;

      mockRepository.findOne.mockResolvedValue(openGame);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
