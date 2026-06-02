import { IsOptional, IsInt, Min, Max, IsNumber } from 'class-validator';
import { UpdatePalpiteDto as IUpdatePalpiteDto } from '@repo/utils';

export class UpdatePalpiteDto implements IUpdatePalpiteDto {
  @IsOptional()
  @IsInt({ message: 'Os gols do time da casa devem ser um número inteiro' })
  @Min(0, { message: 'O placar não pode ser negativo' })
  @Max(20, { message: 'O placar limite recomendado é de no máximo 20 gols' })
  golsCasa?: number;

  @IsOptional()
  @IsInt({ message: 'Os gols do time visitante devem ser um número inteiro' })
  @Min(0, { message: 'O placar não pode ser negativo' })
  @Max(20, { message: 'O placar limite recomendado é de no máximo 20 gols' })
  golsVisitante?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.0)
  odd?: number;
}
