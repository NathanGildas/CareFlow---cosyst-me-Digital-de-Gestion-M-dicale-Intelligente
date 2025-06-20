-- CreateEnum
CREATE TYPE "SenegalRegion" AS ENUM ('DAKAR', 'THIES', 'SAINT_LOUIS', 'DIOURBEL', 'LOUGA', 'TAMBACOUNDA', 'KAOLACK', 'ZIGUINCHOR', 'FATICK', 'KOLDA', 'MATAM', 'KAFFRINE', 'KEDOUGOU', 'SEDHIOU');

-- CreateEnum
CREATE TYPE "MedicalSpecialty" AS ENUM ('MEDECINE_GENERALE', 'PEDIATRIE', 'GYNECOLOGIE_OBSTETRIQUE', 'CHIRURGIE_GENERALE', 'MEDECINE_INTERNE', 'CARDIOLOGIE', 'NEUROLOGIE', 'DERMATOLOGIE', 'OPHTALMOLOGIE', 'ORL', 'ORTHOPEDE', 'UROLOGIE', 'ANESTHESIE_REANIMATION', 'RADIOLOGIE', 'MALADIES_INFECTIEUSES', 'MEDECINE_TROPICALE', 'SANTE_PUBLIQUE', 'MEDECINE_TRADITIONNELLE');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('IPM', 'MUTUELLE_SANTE', 'ASSURANCE_PRIVEE', 'CMU', 'PRIVE');

-- CreateEnum
CREATE TYPE "InsurancePlan" AS ENUM ('BRONZE', 'ARGENT', 'OR', 'PREMIUM');

-- CreateEnum
CREATE TYPE "LanguageSpoken" AS ENUM ('FRANCAIS', 'WOLOF', 'PULAAR', 'SERER', 'MANDINKA', 'DIOLA', 'SONINKE');

-- AlterTable
ALTER TABLE "insurance" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "region" "SenegalRegion" NOT NULL DEFAULT 'DAKAR',
ADD COLUMN     "spokenLanguages" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[];

-- CreateTable
CREATE TABLE "doctors_senegal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "orderNumber" TEXT,
    "mainSpecialty" "MedicalSpecialty" NOT NULL,
    "subSpecialties" "MedicalSpecialty"[],
    "practiceRegion" "SenegalRegion" NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "generalConsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 15000,
    "specialistConsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 25000,
    "homeVisitFee" DECIMAL(65,30) NOT NULL DEFAULT 35000,
    "teleconsultationFee" DECIMAL(65,30) NOT NULL DEFAULT 12000,
    "acceptedInsuranceCompanies" TEXT[],
    "spokenLanguages" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[],
    "culturalSensitive" BOOLEAN NOT NULL DEFAULT true,
    "experienceYears" INTEGER NOT NULL,
    "education" TEXT NOT NULL,
    "certifications" TEXT[],
    "workingHours" JSONB NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_senegal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "reimbursementDelayDays" INTEGER NOT NULL DEFAULT 15,
    "directPaymentAvailable" BOOLEAN NOT NULL DEFAULT true,
    "supervisor" TEXT,
    "regionsServed" "SenegalRegion"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_plan_details" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planType" "InsurancePlan" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPremium" DECIMAL(65,30) NOT NULL,
    "annualCeiling" DECIMAL(65,30) NOT NULL,
    "annualDeductible" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "generalConsultationRate" INTEGER NOT NULL DEFAULT 50,
    "specialistConsultationRate" INTEGER NOT NULL DEFAULT 60,
    "medicationRate" INTEGER NOT NULL DEFAULT 50,
    "hospitalizationRate" INTEGER NOT NULL DEFAULT 70,
    "surgeryRate" INTEGER NOT NULL DEFAULT 60,
    "emergencyRate" INTEGER NOT NULL DEFAULT 80,
    "maternityRate" INTEGER NOT NULL DEFAULT 50,
    "dentalRate" INTEGER NOT NULL DEFAULT 30,
    "opticsRate" INTEGER NOT NULL DEFAULT 25,
    "waitingPeriodMonths" INTEGER NOT NULL DEFAULT 2,
    "maxSubscriptionAge" INTEGER NOT NULL DEFAULT 65,
    "familyIncluded" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_plan_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishments_senegal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EstablishmentType" NOT NULL,
    "region" "SenegalRegion" NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "bedCapacity" INTEGER,
    "hasEmergency" BOOLEAN NOT NULL DEFAULT false,
    "hasMaternity" BOOLEAN NOT NULL DEFAULT false,
    "hasICU" BOOLEAN NOT NULL DEFAULT false,
    "specialties" "MedicalSpecialty"[],
    "languages" "LanguageSpoken"[] DEFAULT ARRAY['FRANCAIS', 'WOLOF']::"LanguageSpoken"[],
    "acceptedInsurances" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establishments_senegal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_senegal_userId_key" ON "doctors_senegal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_senegal_licenseNumber_key" ON "doctors_senegal"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_companies_name_key" ON "insurance_companies"("name");

-- AddForeignKey
ALTER TABLE "doctors_senegal" ADD CONSTRAINT "doctors_senegal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors_senegal" ADD CONSTRAINT "doctors_senegal_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments_senegal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_plan_details" ADD CONSTRAINT "insurance_plan_details_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "insurance_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance" ADD CONSTRAINT "insurance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "insurance_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
