import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateTokenAndPermissions(
    token: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const payload = this.jwtService.getPayload(token);

    const user = await this.usersService.findOneByEmailWithRolesAndPermissions(
      payload.email,
    );
    if (!user) {
      throw new Error(`No user`);
    }

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException(
        'Roles o permisos no definidos para el usuario.',
      );
    }

    const permissionsStrings = user.roles.flatMap((role) =>
      role.permissions.map((p) => p.name),
    );

    const hasAllPermissions = requiredPermissions.every((perm) =>
      permissionsStrings.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new UnauthorizedException('No tiene permisos suficientes');
    }
    return true;
  }
}
