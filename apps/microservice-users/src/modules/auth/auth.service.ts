import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    await this.usersService.register(createUserDto);
    return { status: 'User created successfully' };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.login(loginUserDto);

    const permissions = user.roles.flatMap((r) => r.permissions.map((p) => p.name));

    const payload = {
      email: user.email,
      sub: user.id,
      rolesId: user.roles.map((r) => r.id),
      rolesCode: user.roles.map((r) => r.code),
      permissions,
    };

    // ACCESS TOKEN
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    // REFRESH TOKEN
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '15d' });

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) throw new BadRequestException('Email not found');

    const simulatedUrl = `http://localhost:4200/auth/restore-password?email=${email}`;

    return {
      message: 'User found. Navigate to this URL to reset password (simulation).',
      url: simulatedUrl,
    };
  }

  async restorePassword(body: RestorePasswordDto) {
    const { email, password } = body;
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);

    if (!user) throw new BadRequestException('Email not found');

    await this.usersService.updatePassword(user.id, password);
    return { message: 'Password updated successfully' };
  }
}
