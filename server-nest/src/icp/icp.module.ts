import { Module } from '@nestjs/common';
import { IcpService } from './icp.service';
import { IcpController } from './icp.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [IcpController],
    providers: [IcpService, PrismaService,],
})
export class IcpModule { }
