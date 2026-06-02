import { IsNotEmpty, IsUUID, IsInt, Min, Max, IsNumber } from 'class-validator';
import { CreatePalpiteDto as ICreatePalpiteDto } from '@repo/utils';

export class CreatePalpiteDto implements ICreatePalpiteDto {
  @IsNotEmpty({ message: 'O ID do jogo é obrigatório' })
  @IsUUID('all', { message: 'O ID do jogo deve ser um UUID válido' })
  jogoId: string;

  @IsNotEmpty({ message: 'A quantidade de gols da casa é obrigatória' })
  @IsInt({ message: 'Os gols do time da casa devem ser um número inteiro' })
  @Min(0, { message: 'O placar não pode ser negativo' })
  @Max(20, { message: 'O placar limite recomendado é de no máximo 20 gols' })
  golsCasa: number;

  @IsNotEmpty({ message: 'A quantidade de gols do visitante é obrigatória' })
  @IsInt({ message: 'Os gols do time visitante devem ser um número inteiro' })
  @Min(0, { message: 'O placar não pode ser negativo' })
  @Max(20, { message: 'O placar limite recomendado é de no máximo 20 gols' })
  golsVisitante: number;

  @IsNumber({}, { message: 'A odd deve ser um número' })
  @Min(1.0, { message: 'A odd mínima é 1.0' })
  odd: number;
}
