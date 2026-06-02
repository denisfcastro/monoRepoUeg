import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { CreateJogoDto as ICreateJogoDto } from '@repo/utils';

export class CreateJogoDto implements ICreateJogoDto {
  @IsNotEmpty({ message: 'A seleção da casa é obrigatória' })
  @IsString({ message: 'A seleção da casa deve ser uma string' })
  selecaoCasa: string;

  @IsNotEmpty({ message: 'A seleção visitante é obrigatória' })
  @IsString({ message: 'A seleção visitante deve ser uma string' })
  selecaoVisitante: string;

  @IsNotEmpty({ message: 'A data do jogo é obrigatória' })
  @IsString({ message: 'A data do jogo deve ser uma string' })
  dataJogo: string;

  @IsNotEmpty({ message: 'O horário do jogo é obrigatório' })
  @IsString({ message: 'O horário do jogo deve ser uma string' })
  horarioJogo: string;

  @IsNotEmpty({ message: 'O nome do estádio é obrigatório' })
  @IsString({ message: 'O nome do estádio deve ser uma string' })
  estadio: string;

  @IsNotEmpty({ message: 'O nome do juiz é obrigatório' })
  @IsString({ message: 'O nome do juiz deve ser uma string' })
  nomeJuiz: string;
}
