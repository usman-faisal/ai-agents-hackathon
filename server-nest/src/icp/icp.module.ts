import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { AgentService } from '../common/services/agent.service';
import { IcpAgentService } from '../icp-agent/icp-agent.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
    imports: [],
    controllers: [IcpController],
    providers: [AgentService, IcpService, IcpAgentService, PrismaService,],
})
export class IcpModule { }
