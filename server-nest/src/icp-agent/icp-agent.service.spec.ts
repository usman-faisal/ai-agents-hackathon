import { Test, TestingModule } from '@nestjs/testing';
import { IcpAgentService } from './icp-agent.service';

describe('IcpAgentService', () => {
  let service: IcpAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IcpAgentService],
    }).compile();

    service = module.get<IcpAgentService>(IcpAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
