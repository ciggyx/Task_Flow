import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { InfraModule } from '../infra/infra.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, InfraModule],
  providers: [SeedService],
})
export class SeedModule {}
