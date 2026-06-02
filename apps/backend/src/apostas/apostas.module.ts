import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aposta } from './aposta.entity';
import { ApostasService } from './apostas.service';
import { ApostasController } from './apostas.controller';
import { JogosModule } from '../jogos/jogos.module';
import { PalpitesModule } from '../palpites/palpites.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aposta]), JogosModule, PalpitesModule],
  controllers: [ApostasController],
  providers: [ApostasService],
  exports: [ApostasService],
})
export class ApostasModule {}
