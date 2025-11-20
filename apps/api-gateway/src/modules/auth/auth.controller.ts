import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea un usuario enviando los datos básicos necesarios.',
  })
  @ApiBody({
    description: 'Datos requeridos para registrar un usuario.',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente.',
    schema: {
      example: {
        success: true,
        data: {
          message: 'User successfully created',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email o username ya registrados.',
    schema: {
      example: {
        success: false,
        error: {
          statusCode: 'error',
          message: 'Internal server error',
          details: null,
        },
      },
    },
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({
    summary: 'Loguear un usuario',
    description: 'Loguea un usuario retornando su jwt',
  })
  @ApiBody({
    description: 'Datos requeridos para loguear un usuario.',
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario logueado correctamente.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: '',
          refreshToken: '',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Error generalizado',
    schema: {
      example: {
        success: false,
        error: {
          statusCode: 'error',
          message: 'Internal server error',
        },
      },
    },
  })
  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
