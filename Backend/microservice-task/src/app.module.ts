import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { StatusModule } from './status/status.module';
import { PriorityModule } from './priority/priority.module';

@Module({
  imports: [TaskModule, StatusModule, PriorityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
