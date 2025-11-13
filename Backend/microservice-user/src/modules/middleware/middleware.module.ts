import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { AuthGuard } from './auth.middleware';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RolesModule),
    forwardRef(() => UsersModule),
    ConfigModule,
  ],
  controllers: [],
  providers: [AuthService, JwtService, AuthGuard, UsersService],
  exports: [AuthService, AuthGuard],
})
export class MiddlewareModule {}
