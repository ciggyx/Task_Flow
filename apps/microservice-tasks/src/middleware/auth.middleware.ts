// src/middleware/auth.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ValidatePermissionsResponse } from './decorators/auth.response';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const response = await axios.post<ValidatePermissionsResponse>(
        'http://localhost:3001/auth/validate-token',
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      );

      req['user'] = response.data.user;
      next();
    } catch (error) {
      throw new UnauthorizedException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.response?.data?.message || 'Token inválido',
      );
    }
  }
}
