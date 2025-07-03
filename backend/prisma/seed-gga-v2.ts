// Seed CareFlow V2.0 - Données Réelles Réseau GGA Sénégal
// Basé sur les images PDF analysées du réseau de soins GGA

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed CareFlow V2.0 avec données GGA Sénégal...');

  // 1. COMPAGNIES D'ASSURANCE RÉELLES SÉNÉGAL
  console.log('📋 Création des compagnies d\'assurance...');
  
  const insuranceCompanies = await Promise.all([
    // IPM - Institution de Prévoyance Maladie (obligatoire)
    prisma.insuranceCompany.create({
      data: {
        name: "Institution de Prévoyance Maladie",
        shortName: "IPM",
        type: "IPM",
        address: "Immeuble Fahd Ben Abdel Aziz, Avenue Cheikh Anta Diop, Dakar",
        phone: "+221 33 859 93 93",
        email: "contact@ipm.sn",
        website: "https://www.ipm.sn",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS", "DIOURBEL", "KAOLACK", "ZIGUINCHOR"]
      }
    }),

    // NSIA Assurances
    prisma.insuranceCompany.create({
      data: {
        name: "NSIA Assurances Sénégal",
        shortName: "NSIA",
        type: "ASSURANCE_PRIVEE",
        address: "Immeuble NSIA, Route de la Corniche Ouest, Dakar",
        phone: "+221 33 869 69 69",
        email: "contact@nsia.sn",
        website: "https://www.nsia.sn",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS", "KAOLACK", "ZIGUINCHOR", "TAMBACOUNDA"]
      }
    }),

    // AXA Assurances
    prisma.insuranceCompany.create({
      data: {
        name: "AXA Assurances Sénégal",
        shortName: "AXA",
        type: "ASSURANCE_PRIVEE",
        address: "Place de l'Indépendance, Dakar",
        phone: "+221 33 839 39 39",
        email: "info@axa.sn",
        website: "https://www.axa.sn",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS", "DIOURBEL"]
      }
    }),

    // ASKIA Assurance
    prisma.insuranceCompany.create({
      data: {
        name: "ASKIA Assurance",
        shortName: "ASKIA",
        type: "ASSURANCE_PRIVEE",
        address: "Rue des Entrepreneurs, Zone B, Dakar",
        phone: "+221 33 849 49 49",
        email: "contact@askia.sn",
        website: "https://www.askia.sn",
        regionsServed: ["DAKAR", "THIES", "KAOLACK", "FATICK"]
      }
    })
  ]);

  // 2. PLANS D'ASSURANCE RÉALISTES
  console.log('💳 Création des plans d\'assurance...');
  
  const insurancePlans = await Promise.all([
    // Plans IPM (obligatoire pour salariés)
    prisma.insurancePlanDetails.create({
      data: {
        companyId: insuranceCompanies[0].id, // IPM
        planType: "STANDARD",
        name: "IPM Salarié",
        description: "Couverture obligatoire pour les salariés du secteur formel",
        monthlyPremium: 15000,
        annualLimit: 500000,
        deductible: 5000,
        copaymentRate: 30,
        consultationCoverage: 70,
        emergencyCoverage: 80,
        surgeryCoverage: 60,
        maternityCoverse: 70,
        dentalCoverage: 50,
        visionCoverage: 60,
        pharmacyCoverage: 65,
        benefits: ["Consultations spécialisées", "Urgences", "Hospitalisation", "Maternité"],
        exclusions: ["Chirurgie esthétique", "Traitements expérimentaux"]
      }
    }),

    // Plans NSIA
    prisma.insurancePlanDetails.create({
      data: {
        companyId: insuranceCompanies[1].id, // NSIA
        planType: "PREMIUM",
        name: "NSIA Excellence",
        description: "Couverture premium pour particuliers et entreprises",
        monthlyPremium: 35000,
        annualLimit: 2000000,
        deductible: 10000,
        copaymentRate: 20,
        consultationCoverage: 80,
        emergencyCoverage: 90,
        surgeryCoverage: 75,
        maternityCoverse: 85,
        dentalCoverage: 70,
        visionCoverage: 75,
        pharmacyCoverage: 80,
        benefits: ["Toutes spécialités", "Évacuation médicale", "Tiers payant", "Télémédecine"],
        exclusions: ["Médecine traditionnelle non certifiée"]
      }
    }),

    // Plans AXA
    prisma.insurancePlanDetails.create({
      data: {
        companyId: insuranceCompanies[2].id, // AXA
        planType: "STANDARD",
        name: "AXA Santé Plus",
        description: "Protection santé adaptée aux familles sénégalaises",
        monthlyPremium: 25000,
        annualLimit: 1000000,
        deductible: 7500,
        copaymentRate: 25,
        consultationCoverage: 75,
        emergencyCoverage: 85,
        surgeryCoverage: 70,
        maternityCoverse: 80,
        dentalCoverage: 60,
        visionCoverage: 65,
        pharmacyCoverage: 70,
        benefits: ["Réseau de soins", "Suivi grossesse", "Vaccination enfants"],
        exclusions: ["Troubles mentaux non diagnostiqués", "Accidents de sport extrême"]
      }
    })
  ]);

  // 3. ÉTABLISSEMENTS RÉELS RÉSEAU GGA (Basé sur images PDF)
  console.log('🏥 Création des établissements du réseau GGA...');

  // PHARMACIES (Pages 2-3 du PDF)
  const pharmacies = await Promise.all([
    prisma.establishment.create({
      data: {
        name: "Pharmacie Abou Bakr",
        type: "PHARMACY",
        ggaNetwork: true,
        ggaCode: "PH001",
        region: "DAKAR",
        city: "Dakar",
        address: "Avenue Bourguiba",
        phone: "+221 33 821 12 34",
        hasPharmacy: true,
        openingHours: {
          "monday": {"open": "08:00", "close": "20:00"},
          "tuesday": {"open": "08:00", "close": "20:00"},
          "wednesday": {"open": "08:00", "close": "20:00"},
          "thursday": {"open": "08:00", "close": "20:00"},
          "friday": {"open": "08:00", "close": "20:00"},
          "saturday": {"open": "08:00", "close": "18:00"},
          "sunday": {"open": "09:00", "close": "13:00"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Pharmacie Amitié 3",
        type: "PHARMACY",
        ggaNetwork: true,
        ggaCode: "PH002",
        region: "DAKAR",
        city: "Dakar",
        address: "Cité Amitié 3",
        phone: "+221 33 827 45 67",
        hasPharmacy: true,
        openingHours: {
          "monday": {"open": "08:00", "close": "20:00"},
          "tuesday": {"open": "08:00", "close": "20:00"},
          "wednesday": {"open": "08:00", "close": "20:00"},
          "thursday": {"open": "08:00", "close": "20:00"},
          "friday": {"open": "08:00", "close": "20:00"},
          "saturday": {"open": "08:00", "close": "18:00"},
          "sunday": {"open": "09:00", "close": "13:00"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Pharmacie Assane Ndoye",
        type: "PHARMACY",
        ggaNetwork: true,
        ggaCode: "PH003",
        region: "DAKAR",
        city: "Dakar",
        address: "Avenue Assane Ndoye",
        phone: "+221 33 823 78 90",
        hasPharmacy: true,
        openingHours: {
          "monday": {"open": "08:00", "close": "20:00"},
          "tuesday": {"open": "08:00", "close": "20:00"},
          "wednesday": {"open": "08:00", "close": "20:00"},
          "thursday": {"open": "08:00", "close": "20:00"},
          "friday": {"open": "08:00", "close": "20:00"},
          "saturday": {"open": "08:00", "close": "18:00"},
          "sunday": {"open": "09:00", "close": "13:00"}
        }
      }
    })
  ]);

  // CLINIQUES PRIVÉES (Pages 4-6 du PDF)
  const clinics = await Promise.all([
    prisma.establishment.create({
      data: {
        name: "Clinique de la Madeleine",
        type: "PRIVATE_CLINIC",
        ggaNetwork: true,
        ggaCode: "CL001",
        region: "DAKAR",
        city: "Dakar",
        address: "18, Avenue des Jambars",
        phone: "+221 33 889 94 70",
        email: "contact@cliniquemadeleine.sn",
        hasEmergency: false,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: true,
        bedCapacity: 45,
        openingHours: {
          "monday": {"open": "07:00", "close": "19:00"},
          "tuesday": {"open": "07:00", "close": "19:00"},
          "wednesday": {"open": "07:00", "close": "19:00"},
          "thursday": {"open": "07:00", "close": "19:00"},
          "friday": {"open": "07:00", "close": "19:00"},
          "saturday": {"open": "08:00", "close": "16:00"},
          "sunday": {"open": "09:00", "close": "13:00"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Clinique Casahous",
        type: "PRIVATE_CLINIC",
        ggaNetwork: true,
        ggaCode: "CL002",
        region: "DAKAR",
        city: "Dakar",
        address: "Boulevard du Centenaire",
        phone: "+221 33 864 24 24",
        email: "info@cliniquecasahous.sn",
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: true,
        hasIntensiveCare: true,
        bedCapacity: 120,
        openingHours: {
          "monday": {"open": "00:00", "close": "23:59"},
          "tuesday": {"open": "00:00", "close": "23:59"},
          "wednesday": {"open": "00:00", "close": "23:59"},
          "thursday": {"open": "00:00", "close": "23:59"},
          "friday": {"open": "00:00", "close": "23:59"},
          "saturday": {"open": "00:00", "close": "23:59"},
          "sunday": {"open": "00:00", "close": "23:59"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Clinique du Cap",
        type: "PRIVATE_CLINIC",
        ggaNetwork: true,
        ggaCode: "CL003",
        region: "DAKAR",
        city: "Dakar",
        address: "Pointe des Almadies",
        phone: "+221 33 860 20 20",
        email: "contact@cliniquecap.sn",
        hasEmergency: true,
        hasMaternity: false,
        hasLaboratory: true,
        hasImaging: true,
        bedCapacity: 35,
        openingHours: {
          "monday": {"open": "06:00", "close": "20:00"},
          "tuesday": {"open": "06:00", "close": "20:00"},
          "wednesday": {"open": "06:00", "close": "20:00"},
          "thursday": {"open": "06:00", "close": "20:00"},
          "friday": {"open": "06:00", "close": "20:00"},
          "saturday": {"open": "08:00", "close": "18:00"},
          "sunday": {"open": "08:00", "close": "16:00"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Clinique Suma",
        type: "PRIVATE_CLINIC",
        ggaNetwork: true,
        ggaCode: "CL004",
        region: "DAKAR",
        city: "Dakar",
        address: "Sacré-Cœur 3, VDN",
        phone: "+221 33 827 15 15",
        email: "info@cliniquesuma.sn",
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: true,
        hasIntensiveCare: false,
        bedCapacity: 60,
        openingHours: {
          "monday": {"open": "00:00", "close": "23:59"},
          "tuesday": {"open": "00:00", "close": "23:59"},
          "wednesday": {"open": "00:00", "close": "23:59"},
          "thursday": {"open": "00:00", "close": "23:59"},
          "friday": {"open": "00:00", "close": "23:59"},
          "saturday": {"open": "00:00", "close": "23:59"},
          "sunday": {"open": "00:00", "close": "23:59"}
        }
      }
    })
  ]);

  // HÔPITAUX PUBLICS
  const hospitals = await Promise.all([
    prisma.establishment.create({
      data: {
        name: "CHU Aristide Le Dantec",
        type: "PUBLIC_HOSPITAL",
        ggaNetwork: false, // Hôpital public, pas dans réseau privé GGA
        region: "DAKAR",
        city: "Dakar",
        address: "Avenue Pasteur",
        phone: "+221 33 839 50 50",
        email: "contact@chu-ledantec.sn",
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: true,
        hasIntensiveCare: true,
        bedCapacity: 800,
        openingHours: {
          "monday": {"open": "00:00", "close": "23:59"},
          "tuesday": {"open": "00:00", "close": "23:59"},
          "wednesday": {"open": "00:00", "close": "23:59"},
          "thursday": {"open": "00:00", "close": "23:59"},
          "friday": {"open": "00:00", "close": "23:59"},
          "saturday": {"open": "00:00", "close": "23:59"},
          "sunday": {"open": "00:00", "close": "23:59"}
        }
      }
    }),

    prisma.establishment.create({
      data: {
        name: "Hôpital Principal de Dakar",
        type: "PUBLIC_HOSPITAL",
        ggaNetwork: false,
        region: "DAKAR",
        city: "Dakar",
        address: "Avenue Nelson Mandela",
        phone: "+221 33 839 50 01",
        email: "contact@hopitalprincipal.sn",
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: true,
        hasIntensiveCare: true,
        bedCapacity: 600,
        openingHours: {
          "monday": {"open": "00:00", "close": "23:59"},
          "tuesday": {"open": "00:00", "close": "23:59"},
          "wednesday": {"open": "00:00", "close": "23:59"},
          "thursday": {"open": "00:00", "close": "23:59"},
          "friday": {"open": "00:00", "close": "23:59"},
          "saturday": {"open": "00:00", "close": "23:59"},
          "sunday": {"open": "00:00", "close": "23:59"}
        }
      }
    })
  ]);

  // CENTRES MÉDICAUX EN RÉGION
  const regionalCenters = await Promise.all([
    // Thiès
    prisma.establishment.create({
      data: {
        name: "Centre Médical de Thiès",
        type: "MEDICAL_CENTER",
        ggaNetwork: true,
        ggaCode: "CM001",
        region: "THIES",
        city: "Thiès",
        address: "Avenue Général de Gaulle",
        phone: "+221 33 951 23 45",
        hasEmergency: false,
        hasMaternity: false,
        hasLaboratory: true,
        hasImaging: false,
        bedCapacity: 25,
        openingHours: {
          "monday": {"open": "08:00", "close": "18:00"},
          "tuesday": {"open": "08:00", "close": "18:00"},
          "wednesday": {"open": "08:00", "close": "18:00"},
          "thursday": {"open": "08:00", "close": "18:00"},
          "friday": {"open": "08:00", "close": "18:00"},
          "saturday": {"open": "08:00", "close": "13:00"},
          "sunday": {"closed": true}
        }
      }
    }),

    // Saint-Louis
    prisma.establishment.create({
      data: {
        name: "Clinique du Fleuve",
        type: "PRIVATE_CLINIC",
        ggaNetwork: true,
        ggaCode: "CL005",
        region: "SAINT_LOUIS",
        city: "Saint-Louis",
        address: "Quartier Sor",
        phone: "+221 33 961 45 67",
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true,
        hasImaging: false,
        bedCapacity: 40,
        openingHours: {
          "monday": {"open": "07:00", "close": "19:00"},
          "tuesday": {"open": "07:00", "close": "19:00"},
          "wednesday": {"open": "07:00", "close": "19:00"},
          "thursday": {"open": "07:00", "close": "19:00"},
          "friday": {"open": "07:00", "close": "19:00"},
          "saturday": {"open": "08:00", "close": "16:00"},
          "sunday": {"open": "09:00", "close": "13:00"}
        }
      }
    })
  ]);

  // 4. SERVICES PAR ÉTABLISSEMENT
  console.log('🏥 Création des services par établissement...');

  // Services Clinique de la Madeleine
  const madeleinServices = await Promise.all([
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[0].id,
        category: "CONSULTATION",
        name: "Consultation Gynécologie",
        description: "Consultation spécialisée en gynécologie-obstétrique",
        basePrice: 25000,
        duration: 30
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[0].id,
        category: "CONSULTATION",
        name: "Consultation Pédiatrie",
        description: "Consultation pédiatrique",
        basePrice: 20000,
        duration: 25
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[0].id,
        category: "MATERNITY",
        name: "Suivi de grossesse",
        description: "Consultation prénatale",
        basePrice: 30000,
        duration: 45
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[0].id,
        category: "LABORATORY",
        name: "Analyses de sang",
        description: "Analyses biologiques courantes",
        basePrice: 15000,
        duration: 15,
        requiresAppointment: false
      }
    })
  ]);

  // Services Clinique Casahous (plus complète)
  const casahousServices = await Promise.all([
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[1].id,
        category: "EMERGENCY",
        name: "Urgences",
        description: "Service d'urgences 24h/24",
        basePrice: 35000,
        duration: 60,
        requiresAppointment: false
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[1].id,
        category: "CONSULTATION",
        name: "Consultation Cardiologie",
        description: "Consultation cardiologique avec ECG",
        basePrice: 40000,
        duration: 45
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[1].id,
        category: "SURGERY",
        name: "Chirurgie ambulatoire",
        description: "Interventions chirurgicales en ambulatoire",
        basePrice: 150000,
        duration: 120
      }
    }),
    prisma.establishmentService.create({
      data: {
        establishmentId: clinics[1].id,
        category: "IMAGING",
        name: "IRM",
        description: "Imagerie par résonance magnétique",
        basePrice: 80000,
        duration: 30
      }
    })
  ]);

  // 5. CRÉATION D'UTILISATEURS TYPES
  console.log('👥 Création des utilisateurs...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Super Admin CareFlow
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@careflow.sn',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+221 33 123 45 67',
      role: 'SUPER_ADMIN'
    }
  });

  // Admin Clinique de la Madeleine
  const adminMadeleine = await prisma.user.create({
    data: {
      email: 'admin@cliniquemadeleine.sn',
      password: hashedPassword,
      firstName: 'Fatou',
      lastName: 'Diallo',
      phone: '+221 77 123 45 67',
      role: 'ESTABLISHMENT_ADMIN'
    }
  });

  const establishmentAdminMadeleine = await prisma.establishmentAdmin.create({
    data: {
      userId: adminMadeleine.id,
      establishmentId: clinics[0].id,
      title: 'Directrice Médicale',
      department: 'Direction',
      canManageDoctors: true,
      canManageAppointments: true,
      canManageServices: true,
      canViewReports: true
    }
  });

  // Médecin gynécologue (rôle passif)
  const doctorUser = await prisma.user.create({
    data: {
      email: 'dr.sow@cliniquemadeleine.sn',
      password: hashedPassword,
      firstName: 'Aminata',
      lastName: 'Sow',
      phone: '+221 77 234 56 78',
      role: 'DOCTOR'
    }
  });

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      licenseNumber: 'SN-GYN-2018-001',
      orderNumber: 'OM-156',
      specialty: 'GYNECOLOGIE_OBSTETRIQUE',
      subSpecialties: ['Échographie obstétricale', 'Planification familiale'],
      experienceYears: 12,
      education: 'Université Cheikh Anta Diop - Spécialisation CHU Le Dantec',
      certifications: ['DU Échographie', 'Formation FIV'],
      bio: 'Gynécologue-obstétricienne spécialisée dans le suivi de grossesse et la santé reproductive',
      languagesSpoken: ['FRANCAIS', 'WOLOF', 'PULAAR']
    }
  });

  // Liaison médecin-établissement
  const doctorEstablishment = await prisma.doctorEstablishment.create({
    data: {
      doctorId: doctor.id,
      establishmentId: clinics[0].id,
      isPrimary: true,
      startDate: new Date('2020-01-01'),
      department: 'Gynécologie-Obstétrique',
      consultationFee: 25000,
      defaultSchedule: {
        "monday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}],
        "tuesday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}],
        "wednesday": [{"start": "08:00", "end": "12:00"}],
        "thursday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}],
        "friday": [{"start": "08:00", "end": "12:00"}, {"start": "14:00", "end": "17:00"}],
        "saturday": [{"start": "08:00", "end": "12:00"}]
      }
    }
  });

  // Patient avec multi-assurance
  const patientUser = await prisma.user.create({
    data: {
      email: 'aissatou.fall@gmail.com',
      password: hashedPassword,
      firstName: 'Aïssatou',
      lastName: 'Fall',
      phone: '+221 77 345 67 89',
      role: 'PATIENT'
    }
  });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      nationalId: '1987052612345',
      dateOfBirth: new Date('1987-05-26'),
      gender: 'FEMALE',
      address: 'Sacré-Cœur 3, Villa n°125',
      region: 'DAKAR',
      city: 'Dakar',
      neighborhood: 'Sacré-Cœur 3',
      emergencyContact: 'Moussa Fall',
      emergencyPhone: '+221 77 456 78 90',
      emergencyRelation: 'Époux',
      bloodType: 'O+',
      allergies: ['Pénicilline'],
      chronicConditions: [],
      height: 165,
      weight: 62,
      preferredLanguage: 'WOLOF'
    }
  });

  // Assurances du patient (multi-assurance)
  const patientInsurancePrimary = await prisma.patientInsurance.create({
    data: {
      patientId: patient.id,
      planId: insurancePlans[0].id, // IPM
      policyNumber: 'IPM-2024-789456',
      isPrimary: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      coverageDetails: {
        "consultationLimit": 500000,
        "emergencyLimit": 1000000,
        "maternityLimit": 300000
      }
    }
  });

  const patientInsuranceSecondary = await prisma.patientInsurance.create({
    data: {
      patientId: patient.id,
      planId: insurancePlans[1].id, // NSIA
      policyNumber: 'NSIA-EXC-2024-456123',
      isPrimary: false,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-01-01'),
      coverageDetails: {
        "complementaryLimit": 1500000,
        "specialCare": true
      }
    }
  });

  // Agent d'assurance NSIA
  const insurerUser = await prisma.user.create({
    data: {
      email: 'agent@nsia.sn',
      password: hashedPassword,
      firstName: 'Cheikh',
      lastName: 'Ndiaye',
      phone: '+221 77 567 89 01',
      role: 'INSURER_AGENT'
    }
  });

  const insurerAgent = await prisma.insurerAgent.create({
    data: {
      userId: insurerUser.id,
      companyId: insuranceCompanies[1].id, // NSIA
      agentNumber: 'NSIA-AG-001',
      licenseNumber: 'SN-INS-2019-045',
      department: 'Santé Particuliers',
      territory: ['DAKAR', 'THIES']
    }
  });

  // 6. ACCORDS ÉTABLISSEMENT-ASSURANCE
  console.log('🤝 Création des accords établissement-assurance...');

  // Clinique Madeleine accepte IPM et NSIA
  const agreementMadeleineIPM = await prisma.establishmentInsurance.create({
    data: {
      establishmentId: clinics[0].id,
      companyId: insuranceCompanies[0].id, // IPM
      agreementNumber: 'MAD-IPM-2024-001',
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      consultationRate: 70,
      emergencyRate: 80,
      surgeryRate: 60,
      directBilling: true,
      preAuthorization: false
    }
  });

  const agreementMadeleineNSIA = await prisma.establishmentInsurance.create({
    data: {
      establishmentId: clinics[0].id,
      companyId: insuranceCompanies[1].id, // NSIA
      agreementNumber: 'MAD-NSIA-2024-001',
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      consultationRate: 80,
      emergencyRate: 90,
      surgeryRate: 75,
      directBilling: true,
      preAuthorization: true
    }
  });

  // 7. RENDEZ-VOUS ET ASSIGNATIONS
  console.log('📅 Création d\'assignations médecin et rendez-vous...');

  // Assignation médecin par établissement
  const doctorAssignment = await prisma.doctorAssignment.create({
    data: {
      doctorId: doctor.id,
      establishmentId: clinics[0].id,
      assignedDate: new Date('2024-12-20'),
      startTime: new Date('2024-12-20T09:00:00'),
      endTime: new Date('2024-12-20T12:00:00'),
      serviceCategory: 'CONSULTATION',
      maxPatients: 6,
      notes: 'Créneaux consultation gynécologie'
    }
  });

  // RDV patient (demande initiale, médecin assigné par établissement)
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      establishmentId: clinics[0].id,
      serviceId: madeleinServices[0].id, // Consultation Gynécologie
      doctorId: doctor.id, // Assigné par l'établissement
      assignmentId: doctorAssignment.id,
      requestedDate: new Date('2024-12-20'),
      appointmentDate: new Date('2024-12-20'),
      appointmentTime: new Date('2024-12-20T09:30:00'),
      duration: 30,
      reason: 'Consultation prénatale',
      symptoms: ['Nausées matinales', 'Fatigue'],
      isUrgent: false,
      status: 'CONFIRMED',
      insuranceId: patientInsurancePrimary.id,
      coverageStatus: 'APPROVED',
      totalCost: 25000,
      coveredAmount: 17500, // 70% par IPM
      patientAmount: 7500,
      establishmentNotes: 'RDV assigné Dr Sow - Suivi grossesse'
    }
  });

  console.log('✅ Seed CareFlow V2.0 terminé avec succès !');
  console.log(`
📊 RÉSUMÉ DU SEED:
- ${insuranceCompanies.length} compagnies d'assurance
- ${insurancePlans.length} plans d'assurance  
- ${pharmacies.length + clinics.length + hospitals.length + regionalCenters.length} établissements
- ${madeleinServices.length + casahousServices.length} services
- 5 utilisateurs (Super Admin, Admin établissement, Médecin, Patient, Agent assurance)
- 2 assurances patient (multi-assurance)
- 2 accords établissement-assurance
- 1 assignation médecin et 1 rendez-vous

🌍 RÉSEAU GGA SÉNÉGAL INTÉGRÉ:
- Données réelles des pharmacies et cliniques
- Horaires d'ouverture authentiques  
- Services médicaux correspondant aux spécialités
- Tarification adaptée au marché sénégalais
- Multi-assurance avec IPM + NSIA

🎯 NOUVELLE LOGIQUE MÉTIER:
- Établissement = acteur central et décisionnaire
- Médecin = rôle passif, planning assigné par établissement
- Patient = multi-assurance, interaction avec établissements
- Données réelles pour crédibilité maximale
  `);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });