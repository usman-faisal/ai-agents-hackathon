-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileImage" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ICP" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "industries" TEXT[],
    "locations" TEXT[],
    "fundingStages" TEXT[],
    "technologiesUsed" TEXT[],
    "businessModels" TEXT[],
    "companyKeywords" TEXT[],
    "jobTitles" TEXT[],
    "seniorityLevels" TEXT[],
    "departments" TEXT[],
    "skillsKeywords" TEXT[],
    "responsibilitiesKeywords" TEXT[],
    "actionTakerSignals" TEXT[],
    "painPointsKeywords" TEXT[],
    "excludedIndustries" TEXT[],
    "excludedJobTitles" TEXT[],
    "excludedCompanyKeywords" TEXT[],
    "excludedIndividualKeywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ICP_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ICP" ADD CONSTRAINT "ICP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
