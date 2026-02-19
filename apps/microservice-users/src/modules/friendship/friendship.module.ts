import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { InfraModule } from '../infra/infra.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports:[
    InfraModule, 
    ClientsModule.register([
    {
      name: 'GATEWAY_CLIENT',
      transport: Transport.TCP,
      options: {
        host: process.env.GATEWAY_HOST || '0.0.0.0',
        port: 4002,
      },
    },
    ]),],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService]
})
export class FriendshipModule {}
