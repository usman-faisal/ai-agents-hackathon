import { z } from 'zod';

export const ICPSchema = z.object({
  industries: z
    .array(z.string().min(1, { message: 'Industry cannot be an empty string' }))
    .min(1, { message: 'At least one industry is required' }),
  locations: z
    .array(z.string().min(1, { message: 'Location cannot be an empty string' }))
    .min(1, { message: 'At least one location is required' }),
  fundingStages: z
    .array(
      z.string().min(1, { message: 'Funding stage cannot be an empty string' }),
    )
    .min(1, { message: 'At least one funding stage is required' }),
  technologiesUsed: z
    .array(
      z
        .string()
        .min(1, { message: 'Technology used cannot be an empty string' }),
    )
    .min(1, { message: 'At least one technology used is required' }),
  businessModels: z
    .array(
      z
        .string()
        .min(1, { message: 'Business model cannot be an empty string' }),
    )
    .min(1, { message: 'At least one business model is required' }),
  companyKeywords: z
    .array(
      z
        .string()
        .min(1, { message: 'Company keyword cannot be an empty string' }),
    )
    .min(1, { message: 'At least one company keyword is required' }),

  jobTitles: z
    .array(
      z.string().min(1, { message: 'Job title cannot be an empty string' }),
    )
    .min(1, { message: 'At least one job title is required' }),
  seniorityLevels: z
    .array(
      z
        .string()
        .min(1, { message: 'Seniority level cannot be an empty string' }),
    )
    .min(1, { message: 'At least one seniority level is required' }),
  departments: z
    .array(
      z.string().min(1, { message: 'Department cannot be an empty string' }),
    )
    .min(1, { message: 'At least one department is required' }),
  skillsKeywords: z
    .array(
      z.string().min(1, { message: 'Skill keyword cannot be an empty string' }),
    )
    .min(1, { message: 'At least one skill keyword is required' }),
  responsibilitiesKeywords: z
    .array(
      z.string().min(1, {
        message: 'Responsibility keyword cannot be an empty string',
      }),
    )
    .min(1, { message: 'At least one responsibility keyword is required' }),
  actionTakerSignals: z
    .array(
      z
        .string()
        .min(1, { message: 'Action taker signal cannot be an empty string' }),
    )
    .min(1, { message: 'At least one action taker signal is required' }),
  painPointsKeywords: z
    .array(
      z
        .string()
        .min(1, { message: 'Pain point keyword cannot be an empty string' }),
    )
    .min(1, { message: 'At least one pain point keyword is required' }),

  excludedIndustries: z
    .array(
      z
        .string()
        .min(1, { message: 'Excluded industry cannot be an empty string' }),
    )
    .min(1, {
      message:
        "At least one excluded industry is required (or ensure empty array means 'no exclusions')",
    }),
  excludedJobTitles: z
    .array(
      z
        .string()
        .min(1, { message: 'Excluded job title cannot be an empty string' }),
    )
    .min(1, {
      message:
        "At least one excluded job title is required (or ensure empty array means 'no exclusions')",
    }),
  excludedCompanyKeywords: z
    .array(
      z.string().min(1, {
        message: 'Excluded company keyword cannot be an empty string',
      }),
    )
    .min(1, {
      message:
        "At least one excluded company keyword is required (or ensure empty array means 'no exclusions')",
    }),
  excludedIndividualKeywords: z
    .array(
      z.string().min(1, {
        message: 'Excluded individual keyword cannot be an empty string',
      }),
    )
    .min(1, {
      message:
        "At least one excluded individual keyword is required (or ensure empty array means 'no exclusions')",
    }),
});
