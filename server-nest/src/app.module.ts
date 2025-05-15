import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { IcpController } from './icp/icp.controller';
import { IcpService } from './icp/icp.service';
import { IcpAgentModule } from './icp-agent/icp-agent.module';
import { IcpModule } from './icp/icp.module';
import { AgentService } from './common/services/agent.service';
import { IcpAgentService } from './icp-agent/icp-agent.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    IcpModule,
    IcpAgentModule,
  ],
  controllers: [AppController, IcpController],
  providers: [AppService, IcpService, AgentService, IcpAgentService],
})
export class AppModule {}
