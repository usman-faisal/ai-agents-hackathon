// src/search/search.service.ts
import { HttpService } from '@nestjs/axios';
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/services/prisma.service';
import { ICP } from '@prisma/client';
import { IcpDataForAgentDto, ProfileDto } from './dto/profile.dto';
import { SearchProfilesResponseDto } from './dto/search-profiles.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);
    private pythonAgentUrl: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.pythonAgentUrl = this.configService.get<string>('PYTHON_AGENT_URL');
        if (!this.pythonAgentUrl) {
            this.logger.error(
                'PYTHON_AGENT_URL is not configured in environment variables.',
            );
            throw new InternalServerErrorException(
                'Python agent URL not configured.',
            );
        }
    }

    private mapPrismaIcpToAgentDto(prismaIcp: ICP): IcpDataForAgentDto {
        // Prisma stores arrays directly, so direct mapping should work for most fields.
        // If there were type differences (e.g. Decimal to number), they'd be handled here.
        const {
            id,
            userId,
            name,
            description,
            isActive,
            createdAt,
            updatedAt,
            ...restOfIcp
        } = prismaIcp;

        // Ensure all fields expected by IcpDataForAgentDto are present, defaulting to empty arrays if null/undefined
        const agentDto: IcpDataForAgentDto = {
            industries: restOfIcp.industries ?? [],
            locations: restOfIcp.locations ?? [],
            technologiesUsed: restOfIcp.technologiesUsed ?? [],
            businessModels: restOfIcp.businessModels ?? [],
            companyKeywords: restOfIcp.companyKeywords ?? [],
            jobTitles: restOfIcp.jobTitles ?? [],
            seniorityLevels: restOfIcp.seniorityLevels ?? [],
            departments: restOfIcp.departments ?? [],
            skillsKeywords: restOfIcp.skillsKeywords ?? [],
            responsibilitiesKeywords: restOfIcp.responsibilitiesKeywords ?? [],
            actionTakerSignals: restOfIcp.actionTakerSignals ?? [],
            painPointsKeywords: restOfIcp.painPointsKeywords ?? [],
            excludedIndustries: restOfIcp.excludedIndustries ?? [],
            excludedJobTitles: restOfIcp.excludedJobTitles ?? [],
            excludedCompanyKeywords: restOfIcp.excludedCompanyKeywords ?? [],
            excludedIndividualKeywords: restOfIcp.excludedIndividualKeywords ?? [],
            // Ensure fundingStages is mapped if it exists in your Prisma model and agent DTO
            // fundingStages: restOfIcp.fundingStages ?? [], // Example, add if present
        };
        return agentDto;
    }

    async findProfiles(
        userId: string,
        overrideIcpData?: IcpDataForAgentDto,
    ): Promise<SearchProfilesResponseDto> {
        let icpDataForAgent: IcpDataForAgentDto;

        if (overrideIcpData) {
            this.logger.log(`Using provided ICP data for user ${userId}`);
            icpDataForAgent = overrideIcpData;
        } else {
            this.logger.log(`Fetching saved ICP data for user ${userId}`);
            const userIcp = await this.prisma.iCP.findUnique({
                where: { userId },
            });

            if (!userIcp) {
                throw new NotFoundException(
                    `ICP not found for user ${userId}. Please create an ICP first.`,
                );
            }
            icpDataForAgent = this.mapPrismaIcpToAgentDto(userIcp);
        }

        const pythonAgentSearchUrl = `${this.pythonAgentUrl}/search/find-profiles`;
        this.logger.log(
            `Sending search request to Python agent at ${pythonAgentSearchUrl}`,
        );

        try {
            const response = await firstValueFrom(
                this.httpService.post<{
                    found_profiles: ProfileDto[];
                    message?: string;
                }>(
                    pythonAgentSearchUrl,
                    { icp_data: icpDataForAgent }, // Python agent expects 'icp_data'
                ),
            );

            this.logger.log(`Received response from Python agent for user ${userId}`);
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error calling Python search agent for user ${userId}: ${error.message}`,
                error.stack,
            );
            if (error.response) {
                this.logger.error(
                    `Python agent response data: ${JSON.stringify(error.response.data)}`,
                );
                this.logger.error(
                    `Python agent response status: ${error.response.status}`,
                );
            }
            throw new InternalServerErrorException(
                'Failed to search profiles via Python agent.',
            );
        }
    }
}
