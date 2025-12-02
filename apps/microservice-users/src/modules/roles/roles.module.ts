import { Module, forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MiddlewareModule } from '../middleware/middleware.module';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [InfraModule, forwardRef(() => MiddlewareModule)],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [],
})
export class RolesModule {}
