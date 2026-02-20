import { Post, Body, Headers, Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordRestoreDto } from '@shared/dtos';
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
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern({ cmd: 'user_login' })
  login(data: { loginUserDto: LoginUserDto }) {
    return this.authService.login(data.loginUserDto);
  }

  @Post('forgot-password')
  async forgotPasswordHttp(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPasswordMicro(data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @Post('restore-password')
  async restorePassword(@Body() body: PasswordRestoreDto) {
    return this.authService.restorePassword(body);
  }

  @MessagePattern({ cmd: 'restore_password' })
  async restorePasswordMicro(data: PasswordRestoreDto) {
    return this.authService.restorePassword(data);
  }
}
