import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { StatusModule } from './status/status.module';
import { PriorityModule } from './priority/priority.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RolDashboardModule } from './rol-dashboard/rol-dashboard.module';
import { ParticipantTypeModule } from './participant-type/participant-type.module';
import { DatabaseModule } from './database/database.module';
import { CoreModule } from './core/core.module';
import { InfraModule } from './infra/infra.module';
import { ScheduleModule} from '@nestjs/schedule';
import { StatisticsModule } from './statistics/statistics.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../config/configuration';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    DatabaseModule,
    CoreModule,
    InfraModule,
    TaskModule,
    StatusModule,
    StatisticsModule,
    PriorityModule,
    DashboardModule,
    RolDashboardModule,
    ParticipantTypeModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    LeaderboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
