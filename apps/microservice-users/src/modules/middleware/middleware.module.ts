import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { AuthGuard } from './auth.middleware';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule, forwardRef(() => UsersModule), ConfigModule],
  controllers: [],
  providers: [AuthService, JwtService, AuthGuard, UsersService],
  exports: [AuthService, AuthGuard],
})
export class MiddlewareModule {}
