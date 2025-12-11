import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // endpoint sin permisos declarados
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException('User has no permissions in JWT');
    }

    const userPerms = new Set(user.permissions);

    for (const p of requiredPermissions) {
      if (!userPerms.has(p)) {
        throw new ForbiddenException(`Missing permission: ${p}`);
      }
    }

    return true;
  }
}
