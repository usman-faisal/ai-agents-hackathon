import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { AgentService } from '../common/services/agent.service';
import { IcpAgentService } from '../icp-agent/icp-agent.service';

@Module({
  imports: [],
  providers: [AgentService, IcpService, IcpAgentService],
  controllers: [IcpController],
})
export class IcpModule {}
