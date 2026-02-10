import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { USERS_SERVICE } from '@api-gateway/config/microservice.config';
import { ClientsModule } from '@nestjs/microservices';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ClientsModule.register([USERS_SERVICE]), AuthModule],
  controllers: [FriendshipController],
  providers: [FriendshipService],
})
export class FriendshipModule {}
