// src/search/dto/profile.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProfileDto {
    @ApiProperty({ description: 'Full name of the individual.' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Job title of the individual.' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Company the individual works for.' })
    @IsString()
    @IsNotEmpty()
    company: string;

    @ApiProperty({ description: 'Location of the individual or company.' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiPropertyOptional({ description: 'Industry of the company.' })
    @IsString()
    @IsOptional()
    industry?: string;

    @ApiPropertyOptional({
        description: 'A brief summary or bio of the individual/company.',
    })
    @IsString()
    @IsOptional()
    summary?: string;
}

// This DTO will represent the ICP data structure expected by the Python agent
// It mirrors the ICPData Pydantic model in the Python service.
export class IcpDataForAgentDto {
    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    industries?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    locations?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    technologiesUsed?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    businessModels?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    companyKeywords?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    jobTitles?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    seniorityLevels?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    departments?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skillsKeywords?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    responsibilitiesKeywords?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    actionTakerSignals?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    painPointsKeywords?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excludedIndustries?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excludedJobTitles?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excludedCompanyKeywords?: string[];

    @ApiPropertyOptional({ type: [String], default: [] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excludedIndividualKeywords?: string[];
}
