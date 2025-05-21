import { z } from 'zod';

export const ICPSchema = z.object({
  industries: z
    .array(z.string().min(1, { message: 'Industry cannot be an empty string' }))
    .default([]),
  locations: z
    .array(z.string().min(1, { message: 'Location cannot be an empty string' }))
    .default([]),
  fundingStages: z
    .array(z.string().min(1, { message: 'Funding stage cannot be an empty string' }))
    .default([]),
  technologiesUsed: z
    .array(z.string().min(1, { message: 'Technology used cannot be an empty string' }))
    .default([]),
  businessModels: z
    .array(z.string().min(1, { message: 'Business model cannot be an empty string' }))
    .default([]),
  companyKeywords: z
    .array(z.string().min(1, { message: 'Company keyword cannot be an empty string' }))
    .default([]),
  jobTitles: z
    .array(z.string().min(1, { message: 'Job title cannot be an empty string' }))
    .default([]),
  seniorityLevels: z
    .array(z.string().min(1, { message: 'Seniority level cannot be an empty string' }))
    .default([]),
  departments: z
    .array(z.string().min(1, { message: 'Department cannot be an empty string' }))
    .default([]),
  skillsKeywords: z
    .array(z.string().min(1, { message: 'Skill keyword cannot be an empty string' }))
    .default([]),
  responsibilitiesKeywords: z
    .array(z.string().min(1, { message: 'Responsibility keyword cannot be an empty string' }))
    .default([]),
  actionTakerSignals: z
    .array(z.string().min(1, { message: 'Action taker signal cannot be an empty string' }))
    .default([]),
  painPointsKeywords: z
    .array(z.string().min(1, { message: 'Pain point keyword cannot be an empty string' }))
    .default([]),
  excludedIndustries: z
    .array(z.string().min(1, { message: 'Excluded industry cannot be an empty string' }))
    .default([]),
  excludedJobTitles: z
    .array(z.string().min(1, { message: 'Excluded job title cannot be an empty string' }))
    .default([]),
  excludedCompanyKeywords: z
    .array(z.string().min(1, { message: 'Excluded company keyword cannot be an empty string' }))
    .default([]),
  excludedIndividualKeywords: z
    .array(z.string().min(1, { message: 'Excluded individual keyword cannot be an empty string' }))
    .default([]),
});

export type ICPInputData = z.infer<typeof ICPSchema>;
