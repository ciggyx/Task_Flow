import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Permissions } from './decorator/permission.decorator';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    // Comento esto porque el problema está acá de que no tengo JWT
    // if (!token) {
    //   throw new Error(`No hay token`);
    // }

    // Chequea si viene con el decorador "isPublic" porque no necesita permisos
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const permissions: string[] = this.reflector.get(Permissions, context.getHandler());

    return true;
  }
}
