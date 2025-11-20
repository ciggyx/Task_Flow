import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './infrastructure/users.repository';
import { JwtService } from '../jwt/jwt.service';
import { RolesModule } from '../roles/roles.module';
import { MiddlewareModule } from '../middleware/middleware.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RolesModule),
    forwardRef(() => MiddlewareModule),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository', UsersService],
})
export class UsersModule {}
