/*
  Warnings:

  - You are about to drop the column `dateTime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedInsuranceCompanies` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `culturalSensitive` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `generalConsultationFee` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `homeVisitFee` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `mainSpecialty` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `practiceRegion` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `specialistConsultationFee` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `spokenLanguages` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `subSpecialties` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `teleconsultationFee` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedInsurances` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `bedCapacity` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `hasEmergency` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `hasICU` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `hasMaternity` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `specialties` on the `establishments` table. All the data in the column will be lost.
  - You are about to drop the column `directPaymentAvailable` on the `insurance_companies` table. All the data in the column will be lost.
  - You are about to drop the column `reimbursementDelayDays` on the `insurance_companies` table. All the data in the column will be lost.
  - You are about to drop the column `supervisor` on the `insurance_companies` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `insurance_companies` table. All the data in the column will be lost.
  - You are about to drop the column `annualCeiling` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `annualDeductible` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `dentalRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `familyIncluded` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `generalConsultationRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalizationRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `maternityRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `maxSubscriptionAge` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `medicationRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `opticsRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `specialistConsultationRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `surgeryRate` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `waitingPeriodMonths` on the `insurance_plan_details` table. All the data in the column will be lost.
  - You are about to drop the column `agentNumber` on the `insurers` table. All the data in the column will be lost.
  - You are about to drop the column `authorizationLevel` on the `insurers` table. All the data in the column will be lost.
  - You are about to drop the column `regionsServed` on the `insurers` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `socialNumber` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `spokenLanguages` on the `patients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[licenseNumber]` on the table `insurers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentDate` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishmentId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultationFee` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `annualLimit` to the `insurance_plan_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coveragePercentage` to the `insurance_plan_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNumber` to the `insurers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "insurers_agentNumber_key";

-- DropIndex
DROP INDEX "patients_socialNumber_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "dateTime",
ADD COLUMN     "appointmentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "establishmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "acceptedInsuranceCompanies",
DROP COLUMN "certifications",
DROP COLUMN "culturalSensitive",
DROP COLUMN "generalConsultationFee",
DROP COLUMN "homeVisitFee",
DROP COLUMN "isAvailable",
DROP COLUMN "mainSpecialty",
DROP COLUMN "orderNumber",
DROP COLUMN "practiceRegion",
DROP COLUMN "specialistConsultationFee",
DROP COLUMN "spokenLanguages",
DROP COLUMN "subSpecialties",
DROP COLUMN "teleconsultationFee",
DROP COLUMN "workingHours",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "consultationFee" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "languagesSpoken" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[],
ADD COLUMN     "specialty" "MedicalSpecialty" NOT NULL,
ADD COLUMN     "subSpecialty" TEXT;

-- AlterTable
ALTER TABLE "establishments" DROP COLUMN "acceptedInsurances",
DROP COLUMN "bedCapacity",
DROP COLUMN "district",
DROP COLUMN "hasEmergency",
DROP COLUMN "hasICU",
DROP COLUMN "hasMaternity",
DROP COLUMN "languages",
DROP COLUMN "specialties",
ADD COLUMN     "capacity" INTEGER;

-- AlterTable
ALTER TABLE "insurance_companies" DROP COLUMN "directPaymentAvailable",
DROP COLUMN "reimbursementDelayDays",
DROP COLUMN "supervisor",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "insurance_plan_details" DROP COLUMN "annualCeiling",
DROP COLUMN "annualDeductible",
DROP COLUMN "dentalRate",
DROP COLUMN "emergencyRate",
DROP COLUMN "familyIncluded",
DROP COLUMN "generalConsultationRate",
DROP COLUMN "hospitalizationRate",
DROP COLUMN "maternityRate",
DROP COLUMN "maxSubscriptionAge",
DROP COLUMN "medicationRate",
DROP COLUMN "opticsRate",
DROP COLUMN "specialistConsultationRate",
DROP COLUMN "surgeryRate",
DROP COLUMN "waitingPeriodMonths",
ADD COLUMN     "annualLimit" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "copayment" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "coveragePercentage" INTEGER NOT NULL,
ADD COLUMN     "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "insurers" DROP COLUMN "agentNumber",
DROP COLUMN "authorizationLevel",
DROP COLUMN "regionsServed",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "licenseNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "birthDate",
DROP COLUMN "district",
DROP COLUMN "socialNumber",
DROP COLUMN "spokenLanguages",
ADD COLUMN     "chronicConditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nationalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "insurers_licenseNumber_key" ON "insurers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nationalId_key" ON "patients"("nationalId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
