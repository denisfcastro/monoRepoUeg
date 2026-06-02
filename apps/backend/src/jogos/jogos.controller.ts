import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JogosService } from './jogos.service';
import { CreateJogoDto } from './dto/create-jogo.dto';
import { UpdateJogoDto } from './dto/update-jogo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('jogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jogos')
export class JogosController {
  constructor(private readonly jogosService: JogosService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar um novo jogo (Somente ADMIN)' })
  @ApiResponse({ status: 201, description: 'Jogo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou data no passado' })
  @ApiResponse({ status: 409, description: 'Jogo duplicado' })
  create(@Body() createJogoDto: CreateJogoDto) {
    return this.jogosService.create(createJogoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os jogos ordenados por horário' })
  @ApiResponse({ status: 200, description: 'Lista de jogos recuperada' })
  findAll() {
    return this.jogosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um jogo pelo ID' })
  @ApiResponse({ status: 200, description: 'Jogo encontrado' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.jogosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualizar informações de um jogo (Somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogo atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Jogo encerrado ou dados inválidos' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado' })
  update(@Param('id') id: string, @Body() updateJogoDto: UpdateJogoDto) {
    return this.jogosService.update(id, updateJogoDto);
  }

  @Patch(':id/encerrar')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Encerrar escolha de palpites para o jogo (Somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogo encerrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado' })
  encerrar(@Param('id') id: string) {
    return this.jogosService.encerrar(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Excluir um jogo (Somente ADMIN)' })
  @ApiResponse({ status: 200, description: 'Jogo excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Jogo encerrado' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado' })
  remove(@Param('id') id: string) {
    return this.jogosService.remove(id);
  }
}
