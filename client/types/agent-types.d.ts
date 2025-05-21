// ai-agents-hackathon-main/client/types/agent-types.d.ts

// Mirrors ProfileDto from NestJS/Python
export interface ProfileDto {
    name: string;
    title: string;
    company: string;
    location: string;
    industry?: string;
    summary?: string;
}

// Mirrors IcpDataForAgentDto from NestJS/Python
// This should align with the ICPData model in your Python agent
export interface IcpDataForAgentDto {
    industries?: string[];
    locations?: string[];
    technologiesUsed?: string[];
    businessModels?: string[];
    companyKeywords?: string[];
    jobTitles?: string[];
    seniorityLevels?: string[];
    departments?: string[];
    skillsKeywords?: string[];
    responsibilitiesKeywords?: string[];
    actionTakerSignals?: string[];
    painPointsKeywords?: string[];
    excludedIndustries?: string[];
    excludedJobTitles?: string[];
    excludedCompanyKeywords?: string[];
    excludedIndividualKeywords?: string[];
    // Add other ICP fields if your Python agent expects them, e.g., fundingStages
}