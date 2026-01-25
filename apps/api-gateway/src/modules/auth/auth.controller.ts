import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@shared/dtos';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDoc } from './docs/register.doc';
import { LoginDoc } from './docs/login.doc';
import { ApiTags } from '@nestjs/swagger';
import { PasswordResetDto } from './dto/password-reset.dto';
import { MessagePattern } from '@nestjs/microservices';
import { PasswordRestoreDto } from './dto/password-restore.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RegisterDoc()
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @LoginDoc()
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body('email') email: string) {
    const mailData: PasswordResetDto = await this.authService.forgotPassword(email);

    await this.authService.sendPasswordResetMail(mailData);

    return { message: 'Password reset email sent' };
  }
  @Get('user-by-email/:email')
  async getUserByEmail(@Body('email') email: string) {
    return this.authService.getUserByEmail(email);
  }

  @Post('restore-password')
  @HttpCode(200)
  async restorePassword(@Body() passwordRestoreDto: PasswordRestoreDto){
    return this.authService.restorePassword(passwordRestoreDto);
  }

  @MessagePattern({ cmd: 'get_user_by_email' })
    async getUserByEmailMicroservice(payload: { email: string }) {
      const { email } = payload;
      return this.authService.getUserByEmail(email);
    }

  @MessagePattern({ cmd: 'get_user_by_id' })
    async getUserByIdMicroservice(payload: { id: number}){
      return this.authService.getUserById(payload.id);
    }
  @MessagePattern({ cmd: 'get_users_by_id' })
    async getUsersByIdMicroservice(payload : number[]){
      return this.authService.getUsersById(payload);
    }

}
