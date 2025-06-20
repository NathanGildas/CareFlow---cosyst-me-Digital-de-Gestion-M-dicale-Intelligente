/*
  Warnings:

  - You are about to drop the column `consultationFee` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `subSpecialty` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `insurance` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `insurance` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `insurers` table. All the data in the column will be lost.
  - You are about to drop the `doctors_senegal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `establishments_senegal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `experienceYears` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mainSpecialty` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `practiceRegion` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `establishments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `establishments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `insurance` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `insurance` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `companyId` to the `insurers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `insurers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "doctors_senegal" DROP CONSTRAINT "doctors_senegal_establishmentId_fkey";

-- DropForeignKey
ALTER TABLE "doctors_senegal" DROP CONSTRAINT "doctors_senegal_userId_fkey";

-- DropForeignKey
ALTER TABLE "insurance" DROP CONSTRAINT "insurance_companyId_fkey";

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "consultationFee",
DROP COLUMN "experience",
DROP COLUMN "languages",
DROP COLUMN "specialty",
DROP COLUMN "subSpecialty",
ADD COLUMN     "acceptedInsuranceCompanies" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "culturalSensitive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experienceYears" INTEGER NOT NULL,
ADD COLUMN     "generalConsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 15000,
ADD COLUMN     "homeVisitFee" DECIMAL(65,30) NOT NULL DEFAULT 35000,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mainSpecialty" "MedicalSpecialty" NOT NULL,
ADD COLUMN     "orderNumber" TEXT,
ADD COLUMN     "practiceRegion" "SenegalRegion" NOT NULL,
ADD COLUMN     "specialistConsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 25000,
ADD COLUMN     "spokenLanguages" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[],
ADD COLUMN     "subSpecialties" "MedicalSpecialty"[],
ADD COLUMN     "teleconsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 12000,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "acceptedInsurances" TEXT[],
ADD COLUMN     "bedCapacity" INTEGER,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "hasEmergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasICU" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasMaternity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "languages" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[],
ADD COLUMN     "region" "SenegalRegion" NOT NULL,
ADD COLUMN     "specialties" "MedicalSpecialty"[],
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "insurance" DROP COLUMN "companyName",
DROP COLUMN "planType",
ADD COLUMN     "planId" TEXT NOT NULL,
ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "insurers" DROP COLUMN "companyName",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "regionsServed" "SenegalRegion"[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "city" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "doctors_senegal";

-- DropTable
DROP TABLE "establishments_senegal";

-- AddForeignKey
ALTER TABLE "insurers" ADD CONSTRAINT "insurers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "insurance_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "insurance_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "insurance_plan_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
