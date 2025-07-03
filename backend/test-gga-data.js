// Test script pour vérifier les données réelles GGA
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGGAData() {
  console.log('🔍 Test des données réelles GGA Sénégal...\n');
  
  try {
    // 1. Vérifier les compagnies d'assurance
    console.log('📋 COMPAGNIES D\'ASSURANCE:');
    const insuranceCompanies = await prisma.insuranceCompany.findMany({
      select: {
        name: true,
        shortName: true,
        type: true,
        phone: true,
        regionsServed: true
      }
    });
    
    insuranceCompanies.forEach(company => {
      console.log(`• ${company.shortName} - ${company.name}`);
      console.log(`  Tel: ${company.phone}, Régions: ${company.regionsServed.join(', ')}`);
    });
    
    // 2. Vérifier les établissements GGA
    console.log('\n🏥 ÉTABLISSEMENTS RÉSEAU GGA:');
    const ggaEstablishments = await prisma.establishment.findMany({
      where: { ggaNetwork: true },
      select: {
        name: true,
        ggaCode: true,
        type: true,
        city: true,
        phone: true,
        hasEmergency: true,
        hasMaternity: true,
        hasLaboratory: true
      }
    });
    
    ggaEstablishments.forEach(est => {
      console.log(`• ${est.name} (${est.ggaCode})`);
      console.log(`  Type: ${est.type}, Ville: ${est.city}`);
      console.log(`  Tel: ${est.phone}`);
      const services = [];
      if (est.hasEmergency) services.push('Urgences');
      if (est.hasMaternity) services.push('Maternité');
      if (est.hasLaboratory) services.push('Labo');
      console.log(`  Services: ${services.join(', ')}`);
    });
    
    // 3. Vérifier patient multi-assurance
    console.log('\n👥 PATIENT MULTI-ASSURANCE:');
    const patient = await prisma.patient.findFirst({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        insurancePolicies: {
          include: {
            insurancePlan: {
              include: {
                company: { select: { shortName: true } }
              }
            }
          }
        }
      }
    });
    
    if (patient) {
      console.log(`• ${patient.user.firstName} ${patient.user.lastName}`);
      console.log(`  Email: ${patient.user.email}`);
      console.log(`  Région: ${patient.region}, Ville: ${patient.city}`);
      console.log(`  Assurances:`);
      patient.insurancePolicies.forEach(policy => {
        console.log(`    - ${policy.insurancePlan.company.shortName} (${policy.policyNumber}) - ${policy.isPrimary ? 'PRINCIPALE' : 'SECONDAIRE'}`);
      });
    }
    
    // 4. Vérifier médecin avec établissement
    console.log('\n👨‍⚕️ MÉDECIN ASSIGNÉ:');
    const doctor = await prisma.doctor.findFirst({
      include: {
        user: { select: { firstName: true, lastName: true } },
        establishments: {
          include: {
            establishment: { select: { name: true, ggaNetwork: true } }
          }
        }
      }
    });
    
    if (doctor) {
      console.log(`• Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
      console.log(`  Spécialité: ${doctor.specialty}`);
      console.log(`  Licence: ${doctor.licenseNumber}`);
      console.log(`  Expérience: ${doctor.experienceYears} ans`);
      console.log(`  Établissements:`);
      doctor.establishments.forEach(est => {
        console.log(`    - ${est.establishment.name} ${est.establishment.ggaNetwork ? '(GGA)' : ''}`);
      });
    }
    
    // 5. Vérifier RDV avec données complètes
    console.log('\n📅 RENDEZ-VOUS EXEMPLE:');
    const appointment = await prisma.appointment.findFirst({
      include: {
        patient: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        establishment: { select: { name: true } },
        service: { select: { name: true, basePrice: true } },
        insurance: {
          include: {
            insurancePlan: {
              include: {
                company: { select: { shortName: true } }
              }
            }
          }
        }
      }
    });
    
    if (appointment) {
      console.log(`• Patient: ${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`);
      console.log(`• Médecin: Dr. ${appointment.doctor?.user.firstName} ${appointment.doctor?.user.lastName}`);
      console.log(`• Établissement: ${appointment.establishment.name}`);
      console.log(`• Service: ${appointment.service.name}`);
      console.log(`• Date: ${appointment.appointmentDate?.toLocaleDateString('fr-FR')}`);
      console.log(`• Heure: ${appointment.appointmentTime?.toLocaleTimeString('fr-FR')}`);
      console.log(`• Statut: ${appointment.status}`);
      console.log(`• Coût total: ${appointment.totalCost} FCFA`);
      console.log(`• Couvert: ${appointment.coveredAmount} FCFA`);
      console.log(`• Patient paye: ${appointment.patientAmount} FCFA`);
      if (appointment.insurance) {
        console.log(`• Assurance: ${appointment.insurance.insurancePlan.company.shortName}`);
      }
    }
    
    // 6. Statistiques finales
    console.log('\n📊 STATISTIQUES GGA:');
    const stats = await Promise.all([
      prisma.insuranceCompany.count(),
      prisma.establishment.count({ where: { ggaNetwork: true } }),
      prisma.establishment.count({ where: { ggaNetwork: false } }),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count()
    ]);
    
    console.log(`• ${stats[0]} compagnies d'assurance`);
    console.log(`• ${stats[1]} établissements GGA`);
    console.log(`• ${stats[2]} établissements publics`);
    console.log(`• ${stats[3]} patients`);
    console.log(`• ${stats[4]} médecins`);
    console.log(`• ${stats[5]} rendez-vous`);
    
    console.log('\n✅ Test terminé avec succès ! Système opérationnel avec données GGA réelles.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGGAData();