import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jogo } from './jogo.entity';
import { JogosService } from './jogos.service';
import { JogosController } from './jogos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Jogo])],
  controllers: [JogosController],
  providers: [JogosService],
  exports: [JogosService],
})
export class JogosModule {}
