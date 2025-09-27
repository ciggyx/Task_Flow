import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RestorePasswordDto } from './dto/restore-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) {
      throw new BadRequestException(['Email not found']);
    }
    // simulamos URL de reset
    const simulatedUrl = `http://localhost:4200/auth/restore-password?email=${email}`;
    return { message: 'User found. Navigate to this URL to reset password.', url: simulatedUrl };
  }
  @Post('restore-password')
  async restorePassword(@Body() body: RestorePasswordDto) {
    const { email, password } = body;
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) {
      throw new BadRequestException(['Email not found']);
    }
    await this.usersService.updatePassword(user.id, password);
    return { message: 'Password updated successfully' };
  }
}
