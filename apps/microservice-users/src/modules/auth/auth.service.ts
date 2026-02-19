import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PasswordRestoreDto } from '@shared/dtos';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { Payload } from '../jwt/interfaces/payload.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @Inject('API_GATEWAY_SERVICE')
    private readonly apiGatewayClient: ClientProxy,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ status: string }> {
    await this.usersService.register(createUserDto);
    return { status: 'User created successfully' };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.login(loginUserDto);
    const permissions = user.roles.flatMap((role) =>
      role.permissions.map((p) => p.name),
    );

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

  /**
   * Forgot password → envía correo con link de reseteo
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) throw new BadRequestException('Email not found');

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const resetLink = `http://localhost:4200/auth/restore-password?email=${email}`;

    return {
      to: user.email,
      username: user.name,
      resetLink,
    };
  }

  /**
   * Restore password → actualiza la contraseña
   */
  async restorePassword(body: PasswordRestoreDto) {
    const { email, password } = body;
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);

    if (!user) throw new BadRequestException('Email not found');

    await this.usersService.updatePassword(user.id, password);
    return { message: 'Password updated successfully' };
  }
}
