import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InfraModule } from '../infra/infra.module';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
  imports: [InfraModule, FriendshipModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
