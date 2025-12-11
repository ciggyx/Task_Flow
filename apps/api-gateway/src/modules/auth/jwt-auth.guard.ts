import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet } from 'jose';

@Injectable()
export class JwtRs256Guard implements CanActivate {
  // Clave que quede este endpoint si no el jwt no funciona
  // NO SOPORTA OTRA COSA QUE NO SEA HTTP/S
  private JWKS = createRemoteJWKSet(new URL('http://127.0.0.1:3001/.well-known/jwks.json'));

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];

    if (!auth) throw new UnauthorizedException('Missing Authorization header');

    const token = auth.split(' ')[1];

    try {
      const { payload } = await jwtVerify(token, this.JWKS, {
        algorithms: ['RS256'],
      });

      req.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
