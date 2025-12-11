import { Controller, Get } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

@Controller('.well-known')
export class JwksController {
  constructor(private readonly jwtService: JwtService) {}

  @Get('jwks.json')
  getJwks() {
    return this.jwtService.getJwks();
  }
}
