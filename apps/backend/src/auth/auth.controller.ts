import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login bem sucedido' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas ou usuário inativo' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Auto-cadastro de usuário' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso (pendente de ativação)' })
  @ApiResponse({ status: 400, description: 'E-mail já cadastrado ou dados inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
