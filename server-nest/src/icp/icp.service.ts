import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MulterFile } from '../common/types/type';
import { User } from '@prisma/client';
import { IcpAgentService } from '../icp-agent/icp-agent.service';

@Injectable()
export class IcpService {
  constructor(private readonly icpAgentService: IcpAgentService) {}
  async generateIcp(user: User, message: string, files: MulterFile[]) {
    try {
      return await this.icpAgentService.generateIcpStructuredOutput(
        message,
        files ? files : [],
      );
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
