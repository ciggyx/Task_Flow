import { Body, Controller, Get, HttpCode, Post, UseGuards, Param, Patch, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@shared/dtos';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDoc } from './docs/register.doc';
import { LoginDoc } from './docs/login.doc';
import { ApiTags } from '@nestjs/swagger';
import { PasswordResetDto } from './dto/password-reset.dto';
import { MessagePattern } from '@nestjs/microservices';
import { PasswordRestoreDto } from '@shared/dtos';
// Importamos los Guards
import { JwtRs256Guard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { User } from '@api-gateway/common/decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-user.dto';

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

  // PROTEGEMOS este endpoint porque no queremos que cualquiera consulte emails
  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Get('user-by-email/:email')
  async getUserByEmail(@Param('email') email: string) { // Cambiado a @Param ya que está en la URL
    return this.authService.getUserByEmail(email);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Get('user-by-id/:id')
  async getFullUserById(@Param('id') id: number,
  @User('sub') userId:number) { // Cambiado a @Param ya que está en la URL
    return this.authService.getFullUserById(id, userId);
  }

  @UseGuards(JwtRs256Guard, PermissionsGuard)
  @Patch('update-profile/:id')
  @HttpCode(200)
  async updateProfile(
    @Param('id', ParseIntPipe) profileId: number,
    @User('sub') userId: number,
    @Body() updateProfileDto: UpdateProfileDto, 
  ) {
    // 1. Validación de seguridad
    if (profileId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar este perfil.');
    }

    // 2. Enviamos ID y datos al servicio
    return this.authService.updateProfile(profileId, updateProfileDto);
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
    console.log('gw : ', payload)
    return this.authService.getUsersById(payload);
  }
    
  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(){
    return this.authService.getAllUsers();
  }
}