import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/users.repository';
import { JwtService } from '../jwt/jwt.service';
import { RolesModule } from '../roles/roles.module';
import { MiddlewareModule } from '../middleware/middleware.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    forwardRef(() => MiddlewareModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, JwtService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
