import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from 'src/status/entities/status.entity';
import { Priority } from 'src/priority/entities/priority.entity';
import { Task } from 'src/task/entities/task.entity';
import { Dashboard } from 'src/dashboard/entities/dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Status, Priority, Task, Dashboard])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
