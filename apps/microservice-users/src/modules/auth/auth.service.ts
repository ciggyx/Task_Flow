import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { Payload } from '../jwt/interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ status: string }> {
    const user = await this.usersService.register(createUserDto);
    return { status: 'User created successfully' };
  }

  /**
   * Inicio de sesión
   */
  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.login(loginUserDto);
    const permissions = user.roles.flatMap((role)=> role.permissions.map((p) => p.name));

    const payload = {
      email: user.email,
      sub: user.id,
      rolesId: user.roles.map((r) => r.id),
      rolesCode: user.roles.map((r) => r.code),
      // Estos son los permisos listos para usar
      permissions: permissions,
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
    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // URL simulada para restaurar contraseña (puede reemplazarse por un envío de email real)
    const simulatedUrl = `http://localhost:4200/auth/restore-password?email=${email}`;

    return {
      message: 'User found. Navigate to this URL to reset password (simulation).',
      url: simulatedUrl,
    };
  }

  /**
   *  Restore password: actualiza la contraseña
   */
  async restorePassword(body: RestorePasswordDto) {
    const { email, password } = body;

    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(email);
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
      throw new UnauthorizedException('Token no proporcionado o formato incorrecto.');
    }
    let payload: Payload;
    try {
      payload = this.jwtService.getPayload(token, 'JWT_AUTH');
    } catch (_e) {
      // El getPayload lanza errores en caso de fallo de verificación/expiración
      throw new UnauthorizedException('Token inválido o expirado.');
    }
    const userEmail = payload.email;

    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(userEmail);

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
