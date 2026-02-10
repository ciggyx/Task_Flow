import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports:[InfraModule],
  controllers: [FriendshipController],
  providers: [FriendshipService],
})
export class FriendshipModule {}
