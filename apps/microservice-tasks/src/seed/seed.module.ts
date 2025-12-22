import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { DatabaseModule } from '@microservice-tasks/database/database.module';
import { InfraModule } from '@microservice-tasks/infra/infra.module';

@Module({
  imports: [
    DatabaseModule,
    InfraModule,
  ],
  controllers: [],
  providers: [SeedService],
})
export class SeedModule { }
