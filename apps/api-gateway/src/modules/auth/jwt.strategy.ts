import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_AUTH_SECRET || 'fallback_secret_dev',
    });
  }

  async validate(payload: any) {
    return { 
        sub: payload.sub, 
        email: payload.email,
        roles: payload.rolesCode 
    };
  }
}