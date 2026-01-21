import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DASHBOARD_SERVICE } from '@api-gateway/config/microservice.config';

@Module({
  imports: [ClientsModule.register([DASHBOARD_SERVICE])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule { }
