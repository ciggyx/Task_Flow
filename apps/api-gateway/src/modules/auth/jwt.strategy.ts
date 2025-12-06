import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('secret gateway', process.env.JWT_AUTH_SECRET)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_AUTH_SECRET || 'fallback_secret_dev',
    });
  }

  async validate(payload: any) {
    console.log(' JwtStrategy: Token validado correctamente via Passport!');
    console.log('Payload:', payload);
    
    return { 
        sub: payload.sub, 
        email: payload.email,
        roles: payload.rolesCode 
    };
  }
}