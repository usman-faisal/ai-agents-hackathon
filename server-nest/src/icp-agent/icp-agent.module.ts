import { Module } from '@nestjs/common';
import { AgentService } from '../common/services/agent.service';
import { IcpAgentService } from './icp-agent.service';

@Module({
  imports: [],
  providers: [AgentService, IcpAgentService],
})
export class IcpAgentModule {}
