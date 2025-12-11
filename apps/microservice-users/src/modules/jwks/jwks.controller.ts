import { Controller, Get } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { Public } from '../middleware/decorator/permission.decorator';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwtService: JwtService) {}

  // Temporal porque si no me tira que no tengo el JWT
  // en un futuro cercano esto no iria
  @Public()
  @Get('jwks.json')
  getJwks() {
    return this.jwtService.getJwks();
  }
}
