import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Palpite } from './palpite.entity';
import { PalpitesService } from './palpites.service';
import { PalpitesController } from './palpites.controller';
import { JogosModule } from '../jogos/jogos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Palpite]), JogosModule],
  controllers: [PalpitesController],
  providers: [PalpitesService],
  exports: [PalpitesService],
})
export class PalpitesModule {}
