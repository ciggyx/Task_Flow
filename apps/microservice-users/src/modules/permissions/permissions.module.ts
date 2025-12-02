import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [],
})
export class PermissionsModule {}
