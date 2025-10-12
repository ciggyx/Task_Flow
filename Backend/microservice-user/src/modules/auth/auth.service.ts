import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { UsersService } from '../users/users.service';
import { RoleRepository } from '../roles/infrastructure/roles.repository';
import { JwtService } from '../jwt/jwt.service';
import { compareSync, hash } from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly roleRepo: RoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro de usuario nuevo
   */
  async register(body: CreateUserDto): Promise<{ status: string }> {
    const user = new User();
    Object.assign(user, body);
    user.password = await hash(user.password, 10);
    user.description = body.description ?? '';

    const defaultRole = await this.roleRepo.findOneBy('USER');
    if (!defaultRole) {
      throw new NotFoundException('Default Role not found');
    }

    if (!user.roles) {
      user.roles = [];
    }
    user.roles.push(defaultRole);

    try {
      await this.usersService.saveUser(user);
      return { status: 'User successfully created' };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new HttpException('Error creating user', 500);
    }
  }

  /**
   * Inicio de sesión
   */
  async login(loginUserDto: LoginUserDto) {
    let user = await this.usersService.findByEmail(
      loginUserDto.identifierName,
      ['roles'],
    );

    if (!user) {
      user = await this.usersService.findByName(
        loginUserDto.identifierName,
        ['roles'],
      );
    }

    if (!user) {
      throw new UnauthorizedException('User or password wrong.');
    }

    const compareResult = compareSync(loginUserDto.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('User or password wrong');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException(
        'The user does not have a role assigned.',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      rolesId: user.roles.map((r) => r.id),
      rolesCode: user.roles.map((r) => r.code),
    };

    return {
      accessToken: this.jwtService.generateToken(payload, 'JWT_AUTH'),
      refreshToken: this.jwtService.generateToken(payload, 'JWT_REFRESH'),
    };
  }

  /**
   * 🔹 Forgot password: genera un enlace simulado
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);

    if (!user) {
      throw new BadRequestException(['Email not found']);
    }

    // URL simulada para restaurar contraseña (puede reemplazarse por un envío de email real)
    const simulatedUrl = `http://localhost:4200/auth/restore-password?email=${email}`;

    return {
      message:
        'User found. Navigate to this URL to reset password (simulation).',
      url: simulatedUrl,
    };
  }

  /**
   * 🔹 Restore password: actualiza la contraseña
   */
  async restorePassword(body: RestorePasswordDto) {
    const { email, password } = body;

    const user =
      await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) {
      throw new BadRequestException(['Email not found']);
    }
    
    await this.usersService.updatePassword(user.id, password);

    return { message: 'Password updated successfully' };
  }
}
