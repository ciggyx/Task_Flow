import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './service.middleware';
import { Request } from 'express';
import { Permissions } from './decorator/permission.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error(`No hay token`);
    }
    const permissions: string[] = this.reflector.get(
      Permissions,
      context.getHandler(),
    );

    await this.authService.validateTokenAndPermissions(token, permissions);
    return true;
  }
}
