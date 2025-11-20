import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { Payload } from './interfaces/payload.interface';

@Injectable()
export class JwtService {
  private config: {
    auth: { secret: string; expiresIn: string };
    refresh: { secret: string; expiresIn: string };
  };

  constructor(private configService: ConfigService) {
    const authSecret = this.configService.get<string>('JWT_AUTH_SECRET');
    const authExpires = this.configService.get<string>('JWT_AUTH_EXPIRES');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpires = this.configService.get<string>('JWT_REFRESH_EXPIRES');

    if (!authSecret) {
      throw new Error('Missing env: JWT_AUTH_SECRET');
    }
    if (!authExpires) {
      throw new Error('Missing env: JWT_AUTH_EXPIRES');
    }
    if (!refreshSecret) {
      throw new Error('Missing env: JWT_REFRESH_SECRET');
    }
    if (!refreshExpires) {
      throw new Error('Missing env: JWT_REFRESH_EXPIRES');
    }

    this.config = {
      auth: {
        secret: authSecret,
        expiresIn: authExpires,
      },
      refresh: {
        secret: refreshSecret,
        expiresIn: refreshExpires,
      },
    };
  }

  private getEnvString(key: string): string {
    const value = this.configService.get<string>(key);
    if (typeof value !== 'string') {
      throw new Error(`Missing env var: ${key}`);
    }
    return value;
  }

  generateToken(payload: { email: string }, type: 'JWT_REFRESH' | 'JWT_AUTH' = 'JWT_AUTH'): string {
    const secret = this.getEnvString(`${type}_SECRET`);
    const expiresIn = this.getEnvString(`${type}_EXPIRES`);

    if (!secret || !expiresIn) {
      throw new Error(`Missing JWT config for ${type}`);
    }

    // TODO: Resolver el unsafe return of a value of type error
    return sign(payload, secret, {
      expiresIn: expiresIn as NonNullable<SignOptions['expiresIn']>,
    });
  }

  refreshToken(refreshToken: string): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const payload = this.getPayload(refreshToken, 'JWT_REFRESH');
      // Obtiene el tiempo restante en minutos hasta la expiración
      const timeToExpire = dayjs.unix(payload.exp).diff(dayjs(), 'minute');
      return {
        accessToken: this.generateToken({ email: payload.email }),
        refreshToken:
          timeToExpire < 20
            ? this.generateToken({ email: payload.email }, 'JWT_REFRESH')
            : refreshToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  getPayload(token: string, type: 'JWT_REFRESH' | 'JWT_AUTH' = 'JWT_AUTH'): Payload {
    const secret = this.getEnvString(`${type}_SECRET`);

    // TODO: Solucionar el error de Unsafe call of a(n) `error` type typed value
    const decoded = verify(token, secret) as Payload;

    if (typeof decoded === 'string') {
      throw new Error('Invalid token: expected object payload, got string');
    }

    return decoded;
  }
}
