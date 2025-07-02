// backend/prisma/seed.ts - SEED MASSIF CORRIGÉ 500+ ENREGISTREMENTS
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =====================================================
// DONNÉES DE RÉFÉRENCE SÉNÉGALAISES
// =====================================================

const senegalNames = {
  firstNames: {
    male: [
      "Abdou",
      "Amadou",
      "Moussa",
      "Ibrahim",
      "Ousmane",
      "Mamadou",
      "Cheikh",
      "Modou",
      "Babacar",
      "Alioune",
      "Thierno",
      "Samba",
      "Daouda",
      "Pape",
      "Omar",
      "Fallou",
      "Ibrahima",
      "Souleymane",
      "Lamine",
      "Mbacké",
    ],
    female: [
      "Fatou",
      "Awa",
      "Mariama",
      "Aissatou",
      "Aminata",
      "Khady",
      "Astou",
      "Ndèye",
      "Bineta",
      "Mame",
      "Coumba",
      "Rokhaya",
      "Adja",
      "Amy",
      "Dieynaba",
      "Nogaye",
      "Seynabou",
      "Yacine",
      "Rama",
      "Ndeye",
    ],
  },
  lastNames: [
    "Diallo",
    "Fall",
    "Ndiaye",
    "Sow",
    "Ba",
    "Sy",
    "Diop",
    "Sarr",
    "Kane",
    "Faye",
    "Diouf",
    "Gueye",
    "Mbaye",
    "Thiam",
    "Cissé",
    "Ndour",
    "Seck",
    "Samb",
    "Sene",
    "Diagne",
    "Wade",
    "Niang",
    "Tall",
    "Toure",
    "Ciss",
  ],
};

const senegalCities = {
  DAKAR: ["Dakar", "Pikine", "Guédiawaye", "Rufisque"],
  THIES: ["Thiès", "Mbour", "Tivaouane"],
  SAINT_LOUIS: ["Saint-Louis", "Dagana", "Podor"],
  DIOURBEL: ["Diourbel", "Touba", "Mbacké"],
  KAOLACK: ["Kaolack", "Kaffrine", "Nioro"],
  ZIGUINCHOR: ["Ziguinchor", "Oussouye", "Bignona"],
  FATICK: ["Fatick", "Foundioune", "Gossas"],
  LOUGA: ["Louga", "Kébémer", "Linguère"],
  TAMBACOUNDA: ["Tambacounda", "Bakel", "Goudiry"],
  KOLDA: ["Kolda", "Vélingara", "Médina Yoro Foulah"],
  MATAM: ["Matam", "Kanel", "Ranérou"],
  KAFFRINE: ["Kaffrine", "Birkelane", "Koungheul"],
  KEDOUGOU: ["Kédougou", "Salemata", "Saraya"],
  SEDHIOU: ["Sédhiou", "Bounkiling", "Goudomp"],
};

// =====================================================
// UTILITAIRES
// =====================================================

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSenegalPhone(): string {
  const prefixes = ["70", "76", "77", "78"];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `+221${prefix}${number}`;
}

// FONCTION CORRIGÉE POUR EMAILS UNIQUES
function generateUniqueEmail(
  firstName: string,
  lastName: string,
  index: number,
  domain: string = "example.com"
): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index}@${domain}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function main() {
  console.log(
    "🌱 Démarrage du seed MASSIF CareFlow Sénégal (500+ enregistrements)..."
  );

  // =====================================================
  // 1. COMPAGNIES D'ASSURANCE (5)
  // =====================================================

  console.log("📋 Création des compagnies d'assurance...");

  const insuranceCompanies = await Promise.all([
    prisma.insuranceCompany.create({
      data: {
        name: "NSIA Assurances",
        address: "Immeuble NSIA, Avenue Léopold Sédar Senghor, Dakar",
        phone: "+221338234567",
        email: "contact@nsia-senegal.com",
        website: "https://nsia-senegal.com",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS", "DIOURBEL", "KAOLACK"],
      },
    }),
    prisma.insuranceCompany.create({
      data: {
        name: "ASKIA Assurance",
        address: "Rue de la République x Rue Parchappe, Dakar",
        phone: "+221338456789",
        email: "info@askia-assurance.sn",
        website: "https://askia-assurance.sn",
        regionsServed: ["DAKAR", "THIES", "DIOURBEL"],
      },
    }),
    prisma.insuranceCompany.create({
      data: {
        name: "AXA Assurances Sénégal",
        address: "Immeuble Kebe Mansour, Place de l'Indépendance, Dakar",
        phone: "+221338567890",
        email: "contact@axa.sn",
        website: "https://axa.sn",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS"],
      },
    }),
    prisma.insuranceCompany.create({
      data: {
        name: "Allianz Sénégal",
        address: "Avenue Hassan II, Dakar",
        phone: "+221338678901",
        email: "info@allianz.sn",
        website: "https://allianz.sn",
        regionsServed: ["DAKAR", "THIES"],
      },
    }),
    prisma.insuranceCompany.create({
      data: {
        name: "SONAM Assurances",
        address: "Rue Wagane Diouf x Boulevard de la République, Dakar",
        phone: "+221338789012",
        email: "contact@sonam.sn",
        website: "https://sonam.sn",
        regionsServed: ["DAKAR", "THIES", "SAINT_LOUIS"],
      },
    }),
  ]);

  console.log(`✅ ${insuranceCompanies.length} compagnies d'assurance créées`);

  // =====================================================
  // 2. FORMULES D'ASSURANCE (15 = 3 par compagnie)
  // =====================================================

  console.log("📋 Création des formules d'assurance...");

  const allPlans: Awaited<
    ReturnType<typeof prisma.insurancePlanDetails.create>
  >[] = [];

  for (const company of insuranceCompanies) {
    const plans = await Promise.all([
      // Formule Bronze
      prisma.insurancePlanDetails.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Bronze`,
          planType: "BRONZE",
          coveragePercentage: 40 + Math.floor(Math.random() * 10), // 40-50%
          monthlyPremium: 15000 + Math.floor(Math.random() * 10000), // 15k-25k FCFA
          annualLimit: 500000 + Math.floor(Math.random() * 300000), // 500k-800k
          copayment: 3000 + Math.floor(Math.random() * 2000), // 3k-5k
          description: "Couverture de base pour soins essentiels",
          benefits: [
            "Consultation généraliste",
            "Médicaments de base",
            "Urgences",
          ],
          exclusions: [
            "Soins dentaires",
            "Optique",
            "Hospitalisation de confort",
          ],
        },
      }),
      // Formule Argent
      prisma.insurancePlanDetails.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Argent`,
          planType: "ARGENT",
          coveragePercentage: 60 + Math.floor(Math.random() * 10), // 60-70%
          monthlyPremium: 25000 + Math.floor(Math.random() * 15000), // 25k-40k FCFA
          annualLimit: 1000000 + Math.floor(Math.random() * 500000), // 1M-1.5M
          copayment: 2000 + Math.floor(Math.random() * 1500), // 2k-3.5k
          description: "Couverture étendue avec spécialistes",
          benefits: [
            "Consultation généraliste et spécialiste",
            "Médicaments",
            "Examens de laboratoire",
            "Hospitalisation",
          ],
          exclusions: ["Chirurgie esthétique", "Soins hors Sénégal"],
        },
      }),
      // Formule Or
      prisma.insurancePlanDetails.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Or`,
          planType: "OR",
          coveragePercentage: 75 + Math.floor(Math.random() * 10), // 75-85%
          monthlyPremium: 40000 + Math.floor(Math.random() * 20000), // 40k-60k FCFA
          annualLimit: 2000000 + Math.floor(Math.random() * 1000000), // 2M-3M
          copayment: 1000 + Math.floor(Math.random() * 1000), // 1k-2k
          description: "Couverture premium complète",
          benefits: [
            "Couverture totale soins courants",
            "Chirurgie",
            "Soins dentaires",
            "Optique",
            "Maternité",
            "Évacuation sanitaire",
          ],
          exclusions: ["Chirurgie esthétique non médicale"],
        },
      }),
    ]);
    allPlans.push(...plans);
  }

  console.log(`✅ ${allPlans.length} formules d'assurance créées`);

  // =====================================================
  // 3. ÉTABLISSEMENTS DE SANTÉ (25)
  // =====================================================

  console.log("🏥 Création des établissements de santé...");

  const establishments: Awaited<
    ReturnType<typeof prisma.establishment.create>
  >[] = [];

  // 15 établissements à Dakar
  const dakarEstablishments = [
    {
      name: "Hôpital Principal de Dakar",
      type: "HOSPITAL" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Hôpital Aristide Le Dantec",
      type: "HOSPITAL" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Clinique Casahous",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Polyclinique Madina",
      type: "CLINIC" as const,
      city: "Pikine",
      region: "DAKAR" as const,
    },
    {
      name: "Centre Hospitalier Universitaire de Fann",
      type: "HOSPITAL" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Clinique du Cap",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Hôpital Idrissa Pouye de Grand Yoff",
      type: "HOSPITAL" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Polyclinique Internationale Sainte Marie",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Centre de Santé de Guédiawaye",
      type: "HEALTH_CENTER" as const,
      city: "Guédiawaye",
      region: "DAKAR" as const,
    },
    {
      name: "Clinique Suma",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Cabinet Médical Point E",
      type: "PRIVATE_PRACTICE" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Polyclinique Cours Sainte Marie",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Centre Hospitalier de Pikine",
      type: "HOSPITAL" as const,
      city: "Pikine",
      region: "DAKAR" as const,
    },
    {
      name: "Clinique Mermoz",
      type: "CLINIC" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
    {
      name: "Cabinet Médical Almadies",
      type: "PRIVATE_PRACTICE" as const,
      city: "Dakar",
      region: "DAKAR" as const,
    },
  ];

  // 10 établissements en régions
  const regionEstablishments = [
    {
      name: "Hôpital Régional de Thiès",
      type: "HOSPITAL" as const,
      city: "Thiès",
      region: "THIES" as const,
    },
    {
      name: "Hôpital Régional de Saint-Louis",
      type: "HOSPITAL" as const,
      city: "Saint-Louis",
      region: "SAINT_LOUIS" as const,
    },
    {
      name: "Centre Hospitalier Régional de Ziguinchor",
      type: "HOSPITAL" as const,
      city: "Ziguinchor",
      region: "ZIGUINCHOR" as const,
    },
    {
      name: "Hôpital de Kaolack",
      type: "HOSPITAL" as const,
      city: "Kaolack",
      region: "KAOLACK" as const,
    },
    {
      name: "Centre de Santé de Mbour",
      type: "HEALTH_CENTER" as const,
      city: "Mbour",
      region: "THIES" as const,
    },
    {
      name: "Hôpital de Diourbel",
      type: "HOSPITAL" as const,
      city: "Diourbel",
      region: "DIOURBEL" as const,
    },
    {
      name: "Centre Hospitalier de Tambacounda",
      type: "HOSPITAL" as const,
      city: "Tambacounda",
      region: "TAMBACOUNDA" as const,
    },
    {
      name: "Poste de Santé de Fatick",
      type: "HEALTH_CENTER" as const,
      city: "Fatick",
      region: "FATICK" as const,
    },
    {
      name: "Clinique de Louga",
      type: "CLINIC" as const,
      city: "Louga",
      region: "LOUGA" as const,
    },
    {
      name: "Centre de Santé de Kolda",
      type: "HEALTH_CENTER" as const,
      city: "Kolda",
      region: "KOLDA" as const,
    },
  ];

  const allEstablishmentData = [
    ...dakarEstablishments,
    ...regionEstablishments,
  ];

  for (const estData of allEstablishmentData) {
    const establishment = await prisma.establishment.create({
      data: {
        name: estData.name,
        type: estData.type,
        address: `Adresse ${estData.name}, ${estData.city}`,
        city: estData.city,
        region: estData.region,
        phone: generateSenegalPhone(),
        email: `contact@${estData.name.toLowerCase().replace(/\s+/g, "")}.sn`,
        website: `https://${estData.name.toLowerCase().replace(/\s+/g, "")}.sn`,
        capacity:
          estData.type === "HOSPITAL"
            ? 100 + Math.floor(Math.random() * 200)
            : 20 + Math.floor(Math.random() * 80),
        isActive: true,
      },
    });
    establishments.push(establishment);
  }

  console.log(`✅ ${establishments.length} établissements créés`);

  // =====================================================
  // 4. MÉDECINS (80)
  // =====================================================

  console.log("👨‍⚕️ Création des médecins...");

  const specialties = [
    "MEDECINE_GENERALE",
    "PEDIATRIE",
    "GYNECOLOGIE_OBSTETRIQUE",
    "CARDIOLOGIE",
    "CHIRURGIE_GENERALE",
    "DERMATOLOGIE",
    "NEUROLOGIE",
    "MEDECINE_INTERNE",
    "MALADIES_INFECTIEUSES",
    "MEDECINE_TROPICALE",
  ];

  const doctors: Awaited<ReturnType<typeof prisma.doctor.create>>[] = [];

  // 56 médecins à Dakar (70%)
  const dakarEstablishments_filtered = establishments.filter(
    (e) => e.region === "DAKAR"
  );
  const regionEstablishments_filtered = establishments.filter(
    (e) => e.region !== "DAKAR"
  );

  for (let i = 0; i < 56; i++) {
    const isMale = Math.random() > 0.4; // 60% hommes
    const firstName = getRandomElement(
      isMale ? senegalNames.firstNames.male : senegalNames.firstNames.female
    );
    const lastName = getRandomElement(senegalNames.lastNames);
    const specialty = getRandomElement(specialties);

    // EMAIL UNIQUE avec index
    const doctorUser = await prisma.user.create({
      data: {
        email: generateUniqueEmail(
          firstName,
          lastName,
          i,
          "doctors.careflow.sn"
        ),
        password: "$2a$10$hashedPassword", // Mot de passe haché fictif
        firstName,
        lastName,
        phone: generateSenegalPhone(),
        role: "DOCTOR",
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        licenseNumber: `SN-DOC-${2024}-${String(i + 1).padStart(4, "0")}`,
        specialty: specialty as any,
        subSpecialty: Math.random() > 0.7 ? "Consultation générale" : undefined,
        experienceYears: 5 + Math.floor(Math.random() * 20),
        education: "Faculté de Médecine de Dakar - UCAD",
        languagesSpoken: ["FRANCAIS", "WOLOF"],
        consultationFee:
          specialty === "MEDECINE_GENERALE"
            ? 8000 + Math.floor(Math.random() * 7000)
            : 15000 + Math.floor(Math.random() * 20000),
        establishmentId: getRandomElement(dakarEstablishments_filtered).id,
        isActive: true,
        bio: `Dr ${firstName} ${lastName}, spécialiste en ${specialty.toLowerCase().replace(/_/g, " ")}`,
      },
    });

    doctors.push(doctor);
  }

  // 24 médecins en région (30%)
  for (let i = 56; i < 80; i++) {
    const isMale = Math.random() > 0.4;
    const firstName = getRandomElement(
      isMale ? senegalNames.firstNames.male : senegalNames.firstNames.female
    );
    const lastName = getRandomElement(senegalNames.lastNames);
    const specialty = getRandomElement([
      "MEDECINE_GENERALE",
      "PEDIATRIE",
      "GYNECOLOGIE_OBSTETRIQUE",
      "MEDECINE_TROPICALE",
    ]);

    // EMAIL UNIQUE avec index
    const doctorUser = await prisma.user.create({
      data: {
        email: generateUniqueEmail(
          firstName,
          lastName,
          i,
          "doctors.careflow.sn"
        ),
        password: "$2a$10$hashedPassword",
        firstName,
        lastName,
        phone: generateSenegalPhone(),
        role: "DOCTOR",
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        licenseNumber: `SN-DOC-${2024}-${String(i + 1).padStart(4, "0")}`,
        specialty: specialty as any,
        experienceYears: 3 + Math.floor(Math.random() * 15),
        education: "Faculté de Médecine de Dakar - UCAD",
        languagesSpoken: ["FRANCAIS", "WOLOF"],
        consultationFee: 6000 + Math.floor(Math.random() * 9000), // Tarifs régions moins chers
        establishmentId: getRandomElement(regionEstablishments_filtered).id,
        isActive: true,
        bio: `Dr ${firstName} ${lastName}, médecin en région`,
      },
    });

    doctors.push(doctor);
  }

  console.log(`✅ ${doctors.length} médecins créés`);

  // =====================================================
  // 5. AGENTS ASSUREURS (15)
  // =====================================================

  console.log("👥 Création des agents assureurs...");

  const insurers: Awaited<ReturnType<typeof prisma.insurer.create>>[] = [];

  for (let i = 0; i < 15; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = getRandomElement(
      isMale ? senegalNames.firstNames.male : senegalNames.firstNames.female
    );
    const lastName = getRandomElement(senegalNames.lastNames);

    // EMAIL UNIQUE avec index
    const insurerUser = await prisma.user.create({
      data: {
        email: generateUniqueEmail(
          firstName,
          lastName,
          i,
          "agents.careflow.sn"
        ),
        password: "$2a$10$hashedPassword",
        firstName,
        lastName,
        phone: generateSenegalPhone(),
        role: "INSURER",
      },
    });

    const insurer = await prisma.insurer.create({
      data: {
        userId: insurerUser.id,
        licenseNumber: `SN-INS-${2024}-${String(i + 1).padStart(3, "0")}`,
        companyId: getRandomElement(insuranceCompanies).id,
        department: getRandomElement([
          "Commercial",
          "Sinistres",
          "Souscription",
          "Technique",
        ]),
        isActive: true,
      },
    });

    insurers.push(insurer);
  }

  console.log(`✅ ${insurers.length} agents assureurs créés`);

  // =====================================================
  // 6. PATIENTS (200)
  // =====================================================

  console.log("🧑‍⚕️ Création des patients...");

  const patients: Awaited<ReturnType<typeof prisma.patient.create>>[] = [];

  // 130 patients à Dakar (65%)
  for (let i = 0; i < 130; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = getRandomElement(
      isMale ? senegalNames.firstNames.male : senegalNames.firstNames.female
    );
    const lastName = getRandomElement(senegalNames.lastNames);
    const birthDate = randomDate(new Date(1950, 0, 1), new Date(2010, 11, 31));

    // EMAIL UNIQUE avec index
    const patientUser = await prisma.user.create({
      data: {
        email: generateUniqueEmail(
          firstName,
          lastName,
          i,
          "patients.careflow.sn"
        ),
        password: "$2a$10$hashedPassword",
        firstName,
        lastName,
        phone: generateSenegalPhone(),
        role: "PATIENT",
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        dateOfBirth: birthDate,
        gender: isMale ? "MALE" : "FEMALE",
        address: `Adresse ${firstName} ${lastName}, ${getRandomElement(senegalCities.DAKAR)}`,
        city: getRandomElement(senegalCities.DAKAR),
        region: "DAKAR",
        nationalId: `SN-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emergencyContact: generateSenegalPhone(),
        bloodType: getRandomElement([
          "O+",
          "A+",
          "B+",
          "AB+",
          "O-",
          "A-",
          "B-",
          "AB-",
        ]),
        allergies: Math.random() > 0.8 ? ["Pénicilline"] : undefined,
        chronicConditions: Math.random() > 0.9 ? ["Hypertension"] : undefined,
      },
    });

    patients.push(patient);
  }

  // 70 patients en région (35%)
  for (let i = 130; i < 200; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = getRandomElement(
      isMale ? senegalNames.firstNames.male : senegalNames.firstNames.female
    );
    const lastName = getRandomElement(senegalNames.lastNames);
    const birthDate = randomDate(new Date(1950, 0, 1), new Date(2010, 11, 31));

    const regions = Object.keys(senegalCities).filter((r) => r !== "DAKAR");
    const selectedRegion = getRandomElement(
      regions
    ) as keyof typeof senegalCities;

    // EMAIL UNIQUE avec index
    const patientUser = await prisma.user.create({
      data: {
        email: generateUniqueEmail(
          firstName,
          lastName,
          i,
          "patients.careflow.sn"
        ),
        password: "$2a$10$hashedPassword",
        firstName,
        lastName,
        phone: generateSenegalPhone(),
        role: "PATIENT",
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        dateOfBirth: birthDate,
        gender: isMale ? "MALE" : "FEMALE",
        address: `Adresse ${firstName} ${lastName}, ${getRandomElement(senegalCities[selectedRegion])}`,
        city: getRandomElement(senegalCities[selectedRegion]),
        region: selectedRegion as any,
        nationalId: `SN-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emergencyContact: generateSenegalPhone(),
        bloodType: getRandomElement([
          "O+",
          "A+",
          "B+",
          "AB+",
          "O-",
          "A-",
          "B-",
          "AB-",
        ]),
        allergies: Math.random() > 0.8 ? ["Pénicilline"] : undefined,
        chronicConditions: Math.random() > 0.9 ? ["Hypertension"] : undefined,
      },
    });

    patients.push(patient);
  }

  console.log(`✅ ${patients.length} patients créés`);

  // =====================================================
  // 7. POLICES D'ASSURANCE (120 = 60% des patients)
  // =====================================================

  console.log("📋 Création des polices d'assurance...");

  const insurancePolicies: Awaited<
    ReturnType<typeof prisma.insurance.create>
  >[] = [];
  const insuredPatients = patients.slice(0, 120); // 60% des patients ont une assurance

  for (let i = 0; i < insuredPatients.length; i++) {
    const patient = insuredPatients[i];
    const plan = getRandomElement(allPlans);
    const insurer = getRandomElement(insurers);
    const startDate = randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    const insurance = await prisma.insurance.create({
      data: {
        patientId: patient.id,
        insurerId: insurer.id,
        companyId: plan.companyId,
        planId: plan.id,
        policyNumber: `POL-${2024}-${String(i + 1).padStart(6, "0")}`,
        startDate,
        endDate,
        coverageLimit: plan.annualLimit,
        deductible: plan.copayment,
        copayment: plan.copayment,
      },
    });

    insurancePolicies.push(insurance);
  }

  console.log(`✅ ${insurancePolicies.length} polices d'assurance créées`);

  // =====================================================
  // 8. RENDEZ-VOUS (150)
  // =====================================================

  console.log("📅 Création des rendez-vous...");

  const appointments: Awaited<ReturnType<typeof prisma.appointment.create>>[] =
    [];
  const appointmentStatuses = [
    "SCHEDULED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ];

  for (let i = 0; i < 150; i++) {
    const patient = getRandomElement(patients);
    const doctor = getRandomElement(doctors);
    const appointmentDate = randomDate(
      new Date(2024, 0, 1),
      new Date(2025, 5, 30)
    );
    const status = getRandomElement(appointmentStatuses);

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        establishmentId: doctor.establishmentId,
        appointmentDate,
        duration: 30 + Math.floor(Math.random() * 30), // 30-60 minutes
        type: getRandomElement(["CONSULTATION", "FOLLOWUP", "EMERGENCY"]),
        status: status as any,
        reason: getRandomElement([
          "Consultation de routine",
          "Douleurs abdominales",
          "Fièvre persistante",
          "Contrôle tension artérielle",
          "Suivi diabète",
          "Maux de tête",
          "Troubles digestifs",
          "Fatigue chronique",
        ]),
        notes: Math.random() > 0.5 ? "Notes du rendez-vous" : undefined,
        cost: doctor.consultationFee,
        isUrgent: Math.random() > 0.9,
      },
    });

    appointments.push(appointment);
  }

  console.log(`✅ ${appointments.length} rendez-vous créés`);

  // =====================================================
  // 9. CONSULTATIONS (100)
  // =====================================================

  console.log("🩺 Création des consultations...");

  const consultations: Awaited<
    ReturnType<typeof prisma.consultation.create>
  >[] = [];
  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  );

  for (let i = 0; i < Math.min(100, completedAppointments.length); i++) {
    const appointment = completedAppointments[i];

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        symptoms: getRandomElement([
          ["Fièvre", "Maux de tête"],
          ["Douleurs abdominales", "Nausées"],
          ["Toux", "Difficultés respiratoires"],
          ["Fatigue", "Perte d'appétit"],
          ["Douleurs articulaires"],
          ["Éruptions cutanées"],
          ["Troubles digestifs"],
        ]),
        examination: "Examen clinique réalisé",
        diagnosis: getRandomElement([
          "Paludisme simple",
          "Infection respiratoire",
          "Gastro-entérite",
          "Hypertension artérielle",
          "Diabète de type 2",
          "Anémie",
          "Infection urinaire",
          "Dermatite",
          "Céphalées de tension",
        ]),
        treatment: "Traitement prescrit selon diagnostic",
        notes:
          Math.random() > 0.5
            ? "Notes additionnelles de consultation"
            : undefined,
        vitalSigns: {
          temperature: 36.5 + Math.random() * 2,
          bloodPressure: `${120 + Math.floor(Math.random() * 40)}/${80 + Math.floor(Math.random() * 20)}`,
          heartRate: 60 + Math.floor(Math.random() * 40),
          weight: 50 + Math.floor(Math.random() * 50),
        },
      },
    });

    consultations.push(consultation);
  }

  console.log(`✅ ${consultations.length} consultations créées`);

  // =====================================================
  // 10. PRESCRIPTIONS (80+)
  // =====================================================

  console.log("💊 Création des prescriptions...");

  const prescriptions: Awaited<
    ReturnType<typeof prisma.prescription.create>
  >[] = [];
  const medications = [
    "Paracétamol 1g",
    "Amoxicilline 500mg",
    "Artémether + Luméfantrine",
    "Métformine 850mg",
    "Amlodipine 5mg",
    "Fer + Acide folique",
    "Ibuprofène 400mg",
    "Oméprazole 20mg",
    "Cotrimoxazole",
    "Dexaméthasone",
  ];

  for (let i = 0; i < Math.min(80, consultations.length); i++) {
    const consultation = consultations[i];
    const medication = getRandomElement(medications);

    const prescription = await prisma.prescription.create({
      data: {
        consultationId: consultation.id,
        medication,
        dosage: getRandomElement([
          "1 comprimé",
          "2 comprimés",
          "1 cuillère à soupe",
          "5ml",
        ]),
        frequency: getRandomElement([
          "1 fois/jour",
          "2 fois/jour",
          "3 fois/jour",
          "Matin et soir",
        ]),
        duration: getRandomElement([
          "3 jours",
          "5 jours",
          "7 jours",
          "10 jours",
          "14 jours",
        ]),
        instructions: getRandomElement([
          "À prendre après les repas",
          "À prendre avant les repas",
          "À prendre le matin à jeun",
          "À prendre au coucher",
        ]),
        status: getRandomElement(["ACTIVE", "COMPLETED", "EXPIRED"]),
      },
    });

    prescriptions.push(prescription);
  }

  console.log(`✅ ${prescriptions.length} prescriptions créées`);

  // =====================================================
  // RÉSUMÉ FINAL
  // =====================================================

  const totalRecords =
    insuranceCompanies.length +
    allPlans.length +
    establishments.length +
    doctors.length +
    insurers.length +
    patients.length +
    insurancePolicies.length +
    appointments.length +
    consultations.length +
    prescriptions.length;

  console.log("🎉 Seed CareFlow Sénégal MASSIF terminé avec succès !");
  console.log("📊 Résumé des données créées :");
  console.log(`   - ${insuranceCompanies.length} compagnies d'assurance`);
  console.log(`   - ${allPlans.length} formules d'assurance`);
  console.log(`   - ${establishments.length} établissements de santé`);
  console.log(`   - ${doctors.length} médecins`);
  console.log(`   - ${insurers.length} agents assureurs`);
  console.log(`   - ${patients.length} patients`);
  console.log(`   - ${insurancePolicies.length} polices d'assurance`);
  console.log(`   - ${appointments.length} rendez-vous`);
  console.log(`   - ${consultations.length} consultations`);
  console.log(`   - ${prescriptions.length} prescriptions`);
  console.log(`   ═══════════════════════════════════════`);
  console.log(`   🎯 TOTAL: ${totalRecords} ENREGISTREMENTS`);
  console.log(`   ✅ Objectif 500+ enregistrements ATTEINT !`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
