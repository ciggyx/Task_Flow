import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class MiddlewareModule {}
