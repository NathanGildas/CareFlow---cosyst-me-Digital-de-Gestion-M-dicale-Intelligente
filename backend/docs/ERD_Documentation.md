# Documentation ERD - CareFlow Sénégal

## 🎯 Vue d'Ensemble de l'Architecture

Le système CareFlow Sénégal est conçu autour de **3 acteurs principaux** avec des entités spécialisées pour le contexte sénégalais.

## 📊 Entités Principales

### **👥 ACTEURS SYSTÈME**

#### **User (Table Centrale)**
- **Rôle** : Table polymorphe pour tous les utilisateurs
- **Types** : PATIENT, DOCTOR, INSURER, ADMIN
- **Relations** : 1:1 avec Patient, Doctor, ou Insurer selon le rôle

#### **Patient**
- **Spécificités Sénégal** : région, langues parlées, numéro social sénégalais
- **Géolocalisation** : région (SenegalRegion), ville, district
- **Relations** : 1:1 User, 1:1 Insurance, 1:N Appointments, 1:N MedicalRecords

#### **Doctor**
- **Spécificités Sénégal** : spécialités adaptées (médecine tropicale, etc.), tarifs FCFA
- **Localisation** : région d'exercice, établissement rattaché
- **Tarification** : consultation générale/spécialisée, téléconsultation, visite domicile
- **Relations** : 1:1 User, N:1 Establishment, 1:N Appointments, 1:N DoctorAvailability

#### **Insurer (Agent Assurance)**
- **Spécificités** : lié à une compagnie d'assurance, niveau d'autorisation
- **Géographie** : régions couvertes par l'agent
- **Relations** : 1:1 User, N:1 InsuranceCompany, 1:N Insurance

### **🏥 INFRASTRUCTURE MÉDICALE**

#### **Establishment**
- **Spécificités Sénégal** : région, spécialités disponibles, langues du personnel
- **Caractéristiques** : capacité lits, urgences, maternité, soins intensifs
- **Assurances** : liste des compagnies acceptées
- **Relations** : 1:N Doctor

#### **InsuranceCompany**
- **Réalisme Sénégal** : NSIA, ASKIA, AXA, CNART, IPM avec coordonnées exactes
- **Types** : IPM, MUTUELLE_SANTE, ASSURANCE_PRIVEE, CMU
- **Géographie** : régions servies
- **Relations** : 1:N InsurancePlanDetails, 1:N Insurer, 1:N Insurance

#### **InsurancePlanDetails**
- **Formules Réelles** : Bronze (50%), Argent (70%), Or (85%) selon assureurs sénégalais
- **Couvertures Détaillées** : taux par type de soin (consultation, hospitalisation, etc.)
- **Conditions** : délai stage, plafonds, franchise
- **Relations** : N:1 InsuranceCompany, 1:N Insurance

### **💼 PROCESSUS MÉTIER**

#### **Appointment**
- **Types** : CONSULTATION, TELECONSULTATION, EMERGENCY, FOLLOWUP, SURGERY
- **Statuts** : SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED
- **Relations** : N:1 Patient, N:1 Doctor, 1:1 Consultation

#### **Consultation**
- **Contenu Médical** : symptômes, diagnostic, traitement, signes vitaux
- **Adaptations Locales** : support pathologies tropicales
- **Relations** : 1:1 Appointment, 1:N Prescription, 1:1 Invoice

#### **Insurance**
- **Police Complète** : patient assuré avec formule spécifique
- **Relations Complexes** : Patient ↔ Insurer ↔ InsuranceCompany ↔ PlanDetails
- **Facturation** : 1:N Claim

## 🔄 Flux de Données Principaux

### **Workflow Prise RDV**
```
Patient → recherche Doctor → vérifie Insurance → crée Appointment → génère Consultation → calcule Invoice → traite Claim
```

### **Workflow Assurance**
```
InsuranceCompany → définit InsurancePlanDetails → Insurer vend → Patient souscrit Insurance → utilise pour Claims
```

## 📈 Optimisations Performance

### **Index Critiques**
- **Recherche Médecins** : `(mainSpecialty, practiceRegion, isAvailable)`
- **Recherche Géographique** : `(region, city)` sur patients et établissements
- **Planning RDV** : `(doctorId, dateTime, status)`
- **Facturation** : `(status, dueDate)` sur invoices

### **Relations Optimisées**
- **GIN Index** : pour arrays (spécialités, langues, assurances acceptées)
- **Partial Index** : sur records actifs uniquement
- **Composite Index** : pour requêtes multi-critères fréquentes

## 🌍 Spécificités Contexte Sénégal

### **Énumérations Locales**
- **SenegalRegion** : 14 régions officielles (DAKAR, THIES, etc.)
- **MedicalSpecialty** : spécialités adaptées (MEDECINE_TROPICALE, MALADIES_INFECTIEUSES)
- **LanguageSpoken** : langues locales (FRANCAIS, WOLOF, PULAAR, SERER)
- **InsuranceType** : système réel (IPM, MUTUELLE_SANTE, ASSURANCE_PRIVEE)

### **Tarifications Réalistes**
- **Consultations** : 10-30k FCFA selon spécialité
- **Assurances** : taux 40-90% selon formule
- **Délais** : remboursement 7-20 jours selon assureur

### **Contraintes Métier**
- **Délai Stage** : 1-2 mois selon assureur
- **Conventionnement** : médecin agréé par assurance
- **Géolocalisation** : 70% médecins concentrés à Dakar

## 🔐 Sécurité et Intégrité

### **Contraintes Referentielles**
- **CASCADE DELETE** : User → Patient/Doctor/Insurer
- **RESTRICT** : pas de suppression si relations actives
- **UNIQUE** : email, licenseNumber, policyNumber

### **Validation Données**
- **Téléphones** : format sénégalais (+221...)
- **Dates** : cohérence startDate < endDate
- **Montants** : > 0 pour tarifs et plafonds

## 📋 Métriques Base de Données

### **Volume Estimé Production**
- **Users** : ~10k (patients) + ~500 (médecins) + ~50 (assureurs)
- **Appointments** : ~100k/an
- **Consultations** : ~80k/an
- **Insurance** : ~8k polices actives

### **Performance Cible**
- **Recherche Médecins** : < 100ms
- **Prise RDV** : < 500ms
- **Calcul Assurance** : < 200ms
- **Rapports Analytics** : < 2s
