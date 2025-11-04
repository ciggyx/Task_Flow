import { forwardRef, Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { StatusRepository } from './infraestructure/status.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([Status]), forwardRef(() => TaskModule)],
  controllers: [StatusController],
  providers: [
    StatusService,
    {
      provide: 'IStatusRepository',
      useClass: StatusRepository,
    },
  ],
  exports: ['IStatusRepository'],
})
export class StatusModule {}
