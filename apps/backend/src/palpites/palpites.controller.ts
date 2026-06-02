import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PalpitesService } from './palpites.service';
import { CreatePalpiteDto } from './dto/create-palpite.dto';
import { UpdatePalpiteDto } from './dto/update-palpite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('palpites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('palpites')
export class PalpitesController {
  constructor(private readonly palpitesService: PalpitesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar um palpite recomendado para um jogo (Somente ADMIN)' })
  @ApiResponse({ status: 201, description: 'Palpite criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos, limite excedido ou jogo encerrado' })
  create(@Body() createPalpiteDto: CreatePalpiteDto) {
    return this.palpitesService.create(createPalpiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar palpites recomendados filtrados por ID do jogo' })
  @ApiResponse({ status: 200, description: 'Lista de palpites recuperada' })
  findByJogo(@Query('jogoId') jogoId: string) {
    return this.palpitesService.findByJogo(jogoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar palpite recomendado por ID' })
  @ApiResponse({ status: 200, description: 'Palpite encontrado' })
  @ApiResponse({ status: 404, description: 'Palpite não encontrado' })
  findOne(@Param('id') id: string) {
    return this.palpitesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar um palpite recomendado (Somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Palpite atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Jogo encerrado ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Palpite não encontrado' })
  update(@Param('id') id: string, @Body() updatePalpiteDto: UpdatePalpiteDto) {
    return this.palpitesService.update(id, updatePalpiteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Excluir um palpite recomendado (Somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Palpite excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Jogo encerrado' })
  @ApiResponse({ status: 404, description: 'Palpite não encontrado' })
  remove(@Param('id') id: string) {
    return this.palpitesService.remove(id);
  }
}
