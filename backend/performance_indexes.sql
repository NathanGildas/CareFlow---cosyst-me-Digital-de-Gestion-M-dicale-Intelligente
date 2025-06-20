-- INDEX DE PERFORMANCE CAREFLOW SÉNÉGAL - VERSION CAMELCASE (PRISMA)
-- À ajouter après les migrations Prisma
-- =====================================================
-- INDEX POUR RECHERCHES FRÉQUENTES
-- =====================================================
-- Users : recherche par email (authentification)
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_users_active ON users("isActive")
WHERE
    "isActive" = true;

-- Patients : recherche par région et contact
CREATE INDEX idx_patients_region ON patients(region);

CREATE INDEX idx_patients_region_city ON patients(region, city);

CREATE INDEX idx_patients_national_id ON patients("nationalId");

-- Médecins : recherche par spécialité et localisation
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

CREATE INDEX idx_doctors_establishment ON doctors("establishmentId");

CREATE INDEX idx_doctors_specialty_establishment ON doctors(specialty, "establishmentId");

CREATE INDEX idx_doctors_active ON doctors("isActive")
WHERE
    "isActive" = true;

-- Établissements : recherche géographique
CREATE INDEX idx_establishments_region ON establishments(region);

CREATE INDEX idx_establishments_type_region ON establishments(type, region);

CREATE INDEX idx_establishments_city ON establishments(city);

CREATE INDEX idx_establishments_active ON establishments("isActive")
WHERE
    "isActive" = true;

-- Compagnies d'assurance : recherche par région
CREATE INDEX idx_insurance_companies_name ON insurance_companies(name);

CREATE INDEX idx_insurance_companies_regions ON insurance_companies USING GIN("regionsServed");

CREATE INDEX idx_insurance_companies_active ON insurance_companies("isActive")
WHERE
    "isActive" = true;

-- =====================================================
-- INDEX POUR RENDEZ-VOUS ET CONSULTATIONS
-- =====================================================
-- Rendez-vous : recherche par date et statut
CREATE INDEX idx_appointments_date ON appointments("appointmentDate");

CREATE INDEX idx_appointments_patient_date ON appointments("patientId", "appointmentDate");

CREATE INDEX idx_appointments_doctor_date ON appointments("doctorId", "appointmentDate");

CREATE INDEX idx_appointments_establishment_date ON appointments("establishmentId", "appointmentDate");

CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_appointments_doctor_status_date ON appointments("doctorId", status, "appointmentDate");

CREATE INDEX idx_appointments_urgent ON appointments("isUrgent")
WHERE
    "isUrgent" = true;

-- Consultations : recherche par date et acteurs
CREATE INDEX idx_consultations_date ON consultations("createdAt");

CREATE INDEX idx_consultations_patient ON consultations("patientId");

CREATE INDEX idx_consultations_doctor ON consultations("doctorId");

CREATE INDEX idx_consultations_appointment ON consultations("appointmentId");

-- Prescriptions : recherche par consultation et statut
CREATE INDEX idx_prescriptions_consultation ON prescriptions("consultationId");

CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE INDEX idx_prescriptions_medication ON prescriptions(medication);

-- =====================================================
-- INDEX POUR ASSURANCE ET FACTURATION
-- =====================================================
-- Assurances : recherche par patient et compagnie
CREATE INDEX idx_insurance_patient ON insurance("patientId");

CREATE INDEX idx_insurance_company ON insurance("companyId");

CREATE INDEX idx_insurance_insurer ON insurance("insurerId");

CREATE INDEX idx_insurance_policy ON insurance("policyNumber");

CREATE INDEX idx_insurance_dates ON insurance("startDate", "endDate");

CREATE INDEX idx_insurance_active_policies ON insurance("startDate", "endDate")
WHERE
    "endDate" > CURRENT_DATE;

-- Formules d'assurance : recherche par compagnie et type
CREATE INDEX idx_plan_details_company ON insurance_plan_details("companyId");

CREATE INDEX idx_plan_details_type ON insurance_plan_details("planType");

CREATE INDEX idx_plan_details_active ON insurance_plan_details("isActive")
WHERE
    "isActive" = true;

-- Claims : recherche par statut et date
CREATE INDEX idx_claims_status ON claims(status);

CREATE INDEX idx_claims_submitted_date ON claims("submittedAt");

CREATE INDEX idx_claims_insurance_status ON claims("insuranceId", status);

CREATE INDEX idx_claims_processed_date ON claims("processedAt");

-- Factures : recherche par statut et date d'échéance
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_invoices_due_date ON invoices("dueDate");

CREATE INDEX idx_invoices_consultation ON invoices("consultationId");

CREATE INDEX idx_invoices_overdue ON invoices("dueDate", status)
WHERE
    status IN ('PENDING', 'PARTIALLY_PAID')
    AND "dueDate" < CURRENT_DATE;

-- =====================================================
-- INDEX COMPOSITES POUR REQUÊTES COMPLEXES
-- =====================================================
-- Recherche médecins disponibles par spécialité et établissement
CREATE INDEX idx_doctors_search ON doctors(specialty, "establishmentId", "isActive")
WHERE
    "isActive" = true;

-- Recherche établissements par région et type
CREATE INDEX idx_establishments_search ON establishments(region, type, "isActive")
WHERE
    "isActive" = true;

-- Recherche rendez-vous futurs par médecin
CREATE INDEX idx_appointments_future_doctor ON appointments("doctorId", "appointmentDate", status)
WHERE
    "appointmentDate" > CURRENT_DATE
    AND status IN ('SCHEDULED', 'CONFIRMED');

-- =====================================================
-- INDEX FULL-TEXT SEARCH (SIMPLIFIÉ)
-- =====================================================
-- Recherche textuelle dans les noms d'établissements
CREATE INDEX idx_establishments_search_text2 ON establishments USING GIN(
    to_tsvector('french', name || ' ' || COALESCE(address, ''))
);

-- Recherche textuelle dans les noms d'utilisateurs
CREATE INDEX idx_users_search_text ON users USING GIN(
    to_tsvector('french', "firstName" || ' ' || "lastName")
);

-- =====================================================
-- INDEX POUR ANALYTICS ET MONITORING
-- =====================================================
-- Index pour rapports mensuels
CREATE INDEX idx_appointments_monthly ON appointments(DATE_TRUNC('month', "appointmentDate"));

CREATE INDEX idx_consultations_monthly ON consultations(DATE_TRUNC('month', "createdAt"));

CREATE INDEX idx_prescriptions_monthly ON prescriptions(DATE_TRUNC('month', "createdAt"));

-- Index pour analytics par région
CREATE INDEX idx_patients_analytics ON patients(region, "createdAt");

CREATE INDEX idx_doctors_analytics ON doctors(specialty, "createdAt");

-- Index pour performance établissements
CREATE INDEX idx_appointments_establishment_analytics ON appointments("establishmentId", status, "appointmentDate");

-- =====================================================
-- INDEX POUR NOTIFICATIONS ET ALERTES
-- =====================================================
-- Index pour rappels de rendez-vous
CREATE INDEX idx_appointments_reminders ON appointments("appointmentDate", status)
WHERE
    status = 'CONFIRMED'
    AND "appointmentDate" BETWEEN CURRENT_DATE
    AND CURRENT_DATE + INTERVAL '7 days';

-- Index pour polices d'assurance expirant bientôt
CREATE INDEX idx_insurance_expiring ON insurance("endDate")
WHERE
    "endDate" BETWEEN CURRENT_DATE
    AND CURRENT_DATE + INTERVAL '30 days';

-- Index pour prescriptions actives
CREATE INDEX idx_prescriptions_active ON prescriptions(status, "createdAt")
WHERE
    status = 'ACTIVE';

-- =====================================================
-- CONTRAINTES D'INTÉGRITÉ ADDITIONNELLES
-- =====================================================
-- Empêcher les doublons de rendez-vous au même moment pour un médecin
CREATE UNIQUE INDEX idx_doctor_appointment_slot ON appointments("doctorId", "appointmentDate")
WHERE
    status NOT IN ('CANCELLED', 'NO_SHOW');

-- Assurer l'unicité des numéros de licence
CREATE UNIQUE INDEX idx_doctors_license ON doctors("licenseNumber");

CREATE UNIQUE INDEX idx_insurers_license ON insurers("licenseNumber");

-- Index pour optimiser les jointures fréquentes
CREATE INDEX idx_user_patient_join ON patients("userId");

CREATE INDEX idx_user_doctor_join ON doctors("userId");

CREATE INDEX idx_user_insurer_join ON insurers("userId");