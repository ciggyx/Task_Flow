import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [
    InfraModule,
    ClientsModule.register([
      {
        name: 'GATEWAY_CLIENT',
        transport: Transport.TCP,
        options: {
          host: process.env.GATEWAY_HOST || '0.0.0.0',
          port: parseInt(process.env.GATEWAY_PORT) || 4002,
        },
      },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [],
})
export class DashboardModule { }
