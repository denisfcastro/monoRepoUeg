import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApostasService } from './apostas.service';
import { CreateApostaDto } from './dto/create-aposta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('apostas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('apostas')
export class ApostasController {
  constructor(private readonly apostasService: ApostasService) {}

  @Post()
  @ApiOperation({ summary: 'Realizar uma nova aposta (Usuário Autenticado)' })
  @ApiResponse({ status: 201, description: 'Aposta registrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou jogo encerrado' })
  @ApiResponse({ status: 409, description: 'Aposta duplicada para o mesmo jogo' })
  create(@Request() req: RequestWithUser, @Body() createApostaDto: CreateApostaDto) {
    return this.apostasService.create(req.user.id, createApostaDto);
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Listar todas as apostas do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de apostas recuperada' })
  findMyApostas(@Request() req: RequestWithUser) {
    return this.apostasService.findByUser(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma aposta ativa (Antes do jogo encerrar)' })
  @ApiResponse({ status: 200, description: 'Aposta excluída com sucesso' })
  @ApiResponse({ status: 400, description: 'Jogo encerrado' })
  @ApiResponse({ status: 403, description: 'Permissão negada' })
  @ApiResponse({ status: 404, description: 'Aposta não encontrada' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.apostasService.remove(req.user.id, id);
  }
}
