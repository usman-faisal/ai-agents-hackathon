import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { IcpAgentModule } from './icp-agent/icp-agent.module';
import { IcpModule } from './icp/icp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    IcpModule,
    IcpAgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
