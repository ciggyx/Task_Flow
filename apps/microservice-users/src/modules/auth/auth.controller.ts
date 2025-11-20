import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiBody({ type: CreateUserDto })
  @MessagePattern({ cmd: 'user_register' })
  register(data: { createUserDto: CreateUserDto }) {
    return this.authService.register(data.createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso o error de credenciales',
  })
  @ApiBody({ type: LoginUserDto })
  @MessagePattern({ cmd: 'user_login' })
  login(data: { loginUserDto: LoginUserDto }) {
    return this.authService.login(data.loginUserDto);
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('restore-password')
  async restorePassword(@Body() body: RestorePasswordDto) {
    return this.authService.restorePassword(body);
  }

  @Post('validate-permissions')
  validatePermission(
    @Headers('authorization') authorization: string,
    @Body('requiredPermissions') requiredPermissions: string[],
  ): Promise<boolean> {
    // Llama al método del servicio para ejecutar la lógica de negocio
    return this.authService.validateTokenAndPermissions(authorization, requiredPermissions);
  }
}
