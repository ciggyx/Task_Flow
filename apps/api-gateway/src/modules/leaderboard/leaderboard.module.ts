import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { DASHBOARD_SERVICE } from '@api-gateway/config/microservice.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ClientsModule.register([DASHBOARD_SERVICE]), AuthModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
