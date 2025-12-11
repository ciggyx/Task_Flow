import { Module } from '@nestjs/common';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigEnvModule } from './modules/config/config.module';

@Module({
  imports: [ConfigEnvModule, DashboardModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
