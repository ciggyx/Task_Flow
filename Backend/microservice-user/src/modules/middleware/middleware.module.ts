import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './service.middleware';
import { JwtService } from '../jwt/jwt.service';
import { AuthGuard } from './auth.middleware';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/infrastructure/users.repository';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => RolesModule)],
  controllers: [],
  providers: [AuthService, JwtService, AuthGuard, UsersService, UserRepository],
  exports: [AuthService, AuthGuard],
})
export class MiddlewareModule {}
