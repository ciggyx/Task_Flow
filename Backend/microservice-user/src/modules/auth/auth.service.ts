import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  HttpException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { compareSync, hash } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Payload } from '../jwt/interfaces/payload.interface';
import { IRoleRepository } from '../roles/infrastructure/roles.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
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
      const isDuplicateError =
        error.code === '23505' || error.code === 'ER_DUP_ENTRY';

      if (isDuplicateError) {
        throw new ConflictException('Email or Username already registered.');
      }

      console.error('Error creating user:', error);
      throw new HttpException(
        'Internal server error during registration.',
        500,
      );
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
      user = await this.usersService.findByName(loginUserDto.identifierName, [
        'roles',
      ]);
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
   *  Forgot password: genera un enlace simulado
   */
  async forgotPassword(email: string) {
    const user =
      await this.usersService.findOneByEmailWithRolesAndPermissions(email);

    if (!user) {
      throw new BadRequestException('Email not found');
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
   *  Restore password: actualiza la contraseña
   */
  async restorePassword(body: RestorePasswordDto) {
    const { email, password } = body;

    const user =
      await this.usersService.findOneByEmailWithRolesAndPermissions(email);
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    await this.usersService.updatePassword(user.id, password);

    return { message: 'Password updated successfully' };
  }

  async validateTokenAndPermissions(
    authorization: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const token = authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(
        'Token no proporcionado o formato incorrecto.',
      );
    }
    let payload: Payload;
    try {
      payload = this.jwtService.getPayload(token, 'JWT_AUTH');
    } catch (e) {
      // El getPayload lanza errores en caso de fallo de verificación/expiración
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const userEmail = payload.email;

    const user =
      await this.usersService.findOneByEmailWithRolesAndPermissions(userEmail);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    // Mapear los roles del usuario para obtener una lista plana de todos sus permisos.
    const userPermissions: string[] = user.roles.flatMap(
      (role) => role.permissions.map((p) => p.name), // Asumiendo que el permiso tiene una propiedad 'name'
    );

    // Comprueba si el usuario tiene TODOS los permisos requeridos
    const hasAllPermissions = requiredPermissions.every((requiredPerm) =>
      userPermissions.includes(requiredPerm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('No tienes los permisos requeridos.');
    }

    return true;
  }
}
