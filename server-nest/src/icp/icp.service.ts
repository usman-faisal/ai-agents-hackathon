import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { MulterFile } from '../common/types/type';
import { User } from '@prisma/client';
import { IcpAgentService } from '../icp-agent/icp-agent.service';
import { ICPInputData, ICPSchema } from 'src/icp-agent/tools/structured-output';
import { z } from "zod"
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class IcpService {
    constructor(private readonly icpAgentService: IcpAgentService, private readonly prismaService: PrismaService) { }
    async generateIcp(user: User, message: string, files: MulterFile[]) {
        try {
            const llmOutput = await this.icpAgentService.generateIcpStructuredOutput(
                message,
                files ? files : [],
            );
            let validatedLlmData: ICPInputData;
            validatedLlmData = ICPSchema.parse(llmOutput);

            const IcpDataToSave = {
                ...validatedLlmData,
                name: 'any name',
                description: 'any description',
            }

            const newIcp = await this.prismaService.iCP.create({
                data: {
                    userId: user.id,
                    ...IcpDataToSave
                }
            })

            return {
                success: true,
                data: newIcp,
            }
        } catch (error) {
            console.error(error)
            if (error instanceof z.ZodError) {
                console.error('Zod Validation Error:', error.errors);
                throw new BadRequestException({
                    message: 'Invalid data structure received from ICP generation.',
                    errors: error.flatten().fieldErrors,
                });
            }
            throw new InternalServerErrorException("Something Went Wrong");
        }
    }
}
