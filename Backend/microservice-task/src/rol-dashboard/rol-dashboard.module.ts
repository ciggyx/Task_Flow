import { Module } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { RolDashboardController } from './rol-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { ParticipantType } from 'src/participant-type/entities/participant-type.entity';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { RolDashboardRepository } from './infraestructure/rol-dashboard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolDashboard, ParticipantType]),
    DashboardModule,
  ],
  controllers: [RolDashboardController],
  providers: [
    RolDashboardService,
    {
      provide: 'IRolDashboardRepository',
      useClass: RolDashboardRepository,
    },
  ],
  exports: ['IRolDashboardRepository'],
})
export class RolDashboardModule {}
