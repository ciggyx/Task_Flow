import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RolDashboardService } from './rol-dashboard.service';
import { RolDashboardController } from './rol-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolDashboard, ParticipantType, Dashboard]),
    HttpModule,
  ],
  controllers: [RolDashboardController],
  providers: [RolDashboardService],
})
export class RolDashboardModule {}
