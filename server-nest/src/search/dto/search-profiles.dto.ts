// src/search/dto/search-profiles.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileDto, IcpDataForAgentDto } from './profile.dto';
import { IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ICP } from '@prisma/client'; // Import Prisma ICP type

// The request DTO can optionally take ICP data to override the user's default
export class SearchProfilesRequestDto {
    @ApiPropertyOptional({
        description:
            "Optional ICP data to use for the search. If not provided, the user's saved ICP will be used.",
        type: IcpDataForAgentDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => IcpDataForAgentDto)
    icpData?: IcpDataForAgentDto;
}

export class SearchProfilesResponseDto {
    @ApiProperty({
        type: [ProfileDto],
        description: 'List of profiles found matching the ICP.',
    })
    found_profiles: ProfileDto[];

    @ApiPropertyOptional({
        description: 'Optional message from the search agent.',
    })
    @IsString()
    @IsOptional()
    message?: string;
}
