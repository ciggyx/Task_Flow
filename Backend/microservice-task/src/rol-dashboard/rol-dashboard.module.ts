import { forwardRef, Module } from '@nestjs/common';
import { RolDashboardService } from './rol-dashboard.service';
import { RolDashboardController } from './rol-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolDashboard } from './entities/rol-dashboard.entity';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { RolDashboardRepository } from './infraestructure/rol-dashboard.repository';
import { ParticipantTypeModule } from 'src/participant-type/participant-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolDashboard]),
    ParticipantTypeModule,
    forwardRef(() => DashboardModule),
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
