import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '../jwt/jwt.service';
import { MiddlewareModule } from '../middleware/middleware.module';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule, forwardRef(() => MiddlewareModule), ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
