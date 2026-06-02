import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { UpdateJogoDto as IUpdateJogoDto } from '@repo/utils';

export class UpdateJogoDto implements IUpdateJogoDto {
  @IsOptional()
  @IsString()
  selecaoCasa?: string;

  @IsOptional()
  @IsString()
  selecaoVisitante?: string;

  @IsOptional()
  @IsString()
  dataJogo?: string;

  @IsOptional()
  @IsString()
  horarioJogo?: string;

  @IsOptional()
  @IsString()
  estadio?: string;

  @IsOptional()
  @IsString()
  nomeJuiz?: string;

  @IsOptional()
  @IsBoolean()
  encerrado?: boolean;
}
