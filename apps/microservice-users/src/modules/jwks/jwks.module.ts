import { Module } from '@nestjs/common';
import { JwksController } from './jwks.controller';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [JwtModule],
  controllers: [JwksController],
  providers: [],
  exports: [],
})
export class JwksModule {}
