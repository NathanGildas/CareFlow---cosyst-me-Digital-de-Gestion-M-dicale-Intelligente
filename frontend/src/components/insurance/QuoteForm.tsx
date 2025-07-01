// src/components/insurance/QuoteForm.tsx - Formulaire de demande de devis d'assurance
import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  Info,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardContent } from "../ui/Card";
import CardFooter from "../ui/Card";
import { useAuthState } from "../../hooks/AuthHooks";
import type {
  QuoteRequest,
  InsurancePlanType,
  BeneficiaryRelationship,
} from "../../types/insurance.types";
import {
  SENEGAL_REGIONS,
  PLAN_TYPES_LABELS,
} from "../../types/insurance.types";

interface QuoteFormProps {
  selectedPlanIds?: string[];
  onSubmit: (quoteRequest: QuoteRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface BeneficiaryForm {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: BeneficiaryRelationship;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isValid: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  selectedPlanIds = [],
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const { user } = useAuthState();

  // État du formulaire
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<QuoteRequest>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: "",
    phone: user?.phone || "",
    email: user?.email || "",
    city: "",
    region: "",
    planIds: selectedPlanIds,
    planType: "INDIVIDUAL",
    beneficiariesCount: 1,
    hasPreexistingConditions: false,
    preexistingConditions: [],
    preferredStartDate: "",
    additionalNotes: "",
  });

  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryForm[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");

  // Initialiser les bénéficiaires
  useEffect(() => {
    if (formData.planType === "INDIVIDUAL") {
      setBeneficiaries([]);
      setFormData((prev) => ({ ...prev, beneficiariesCount: 1 }));
    }
  }, [formData.planType]);

  // Conditions médicales courantes au Sénégal
  const commonConditions = [
    "Diabète",
    "Hypertension artérielle",
    "Asthme",
    "Paludisme chronique",
    "Troubles cardiaques",
    "Problèmes de vision",
    "Arthrite",
    "Migraine chronique",
    "Allergies alimentaires",
    "Problèmes rénaux",
  ];

  // Définition des étapes
  const steps: FormStep[] = [
    {
      id: "personal",
      title: "Informations personnelles",
      description: "Vos données de contact",
      icon: User,
      isValid: validatePersonalInfo(),
    },
    {
      id: "plan",
      title: "Type de plan",
      description: "Choisissez votre couverture",
      icon: Shield,
      isValid: validatePlanInfo(),
    },
    {
      id: "beneficiaries",
      title: "Bénéficiaires",
      description: "Personnes à couvrir",
      icon: Users,
      isValid: validateBeneficiaries(),
    },
    {
      id: "medical",
      title: "Informations médicales",
      description: "Antécédents de santé",
      icon: FileText,
      isValid: validateMedicalInfo(),
    },
  ];

  // Validation des étapes
  function validatePersonalInfo(): boolean {
    return !!(
      formData.firstName &&
      formData.lastName &&
      formData.dateOfBirth &&
      formData.phone &&
      formData.email &&
      formData.city &&
      formData.region
    );
  }

  function validatePlanInfo(): boolean {
    return !!(formData.planType && formData.beneficiariesCount > 0);
  }

  function validateBeneficiaries(): boolean {
    if (formData.planType === "INDIVIDUAL") return true;
    return beneficiaries.length === formData.beneficiariesCount - 1; // -1 car le demandeur principal n'est pas dans la liste
  }

  function validateMedicalInfo(): boolean {
    if (formData.hasPreexistingConditions) {
      return conditions.length > 0;
    }
    return true;
  }

  // Mettre à jour les données du formulaire
  const updateFormData = <K extends keyof QuoteRequest>(
    field: K,
    value: QuoteRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Effacer l'erreur du champ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Ajouter un bénéficiaire
  const addBeneficiary = () => {
    const newBeneficiary: BeneficiaryForm = {
      id: Date.now().toString(),
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      relationship: "SPOUSE",
    };
    setBeneficiaries((prev) => [...prev, newBeneficiary]);
  };

  // Mettre à jour un bénéficiaire
  const updateBeneficiary = (
    id: string,
    field: keyof BeneficiaryForm,
    value: string
  ) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Supprimer un bénéficiaire
  const removeBeneficiary = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  };

  // Ajouter une condition médicale
  const addCondition = (condition: string) => {
    if (condition && !conditions.includes(condition)) {
      setConditions((prev) => [...prev, condition]);
      setNewCondition("");
    }
  };

  // Supprimer une condition médicale
  const removeCondition = (condition: string) => {
    setConditions((prev) => prev.filter((c) => c !== condition));
  };

  // Navigation entre les étapes
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    const finalFormData: QuoteRequest = {
      ...formData,
      preexistingConditions: formData.hasPreexistingConditions
        ? conditions
        : [],
    };

    onSubmit(finalFormData);
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStepData.isValid;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Indicateur de progression */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Demande de devis
            </h2>
            <span className="text-sm text-gray-600">
              Étape {currentStep + 1} sur {steps.length}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  disabled={index > currentStep}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index < currentStep
                      ? "bg-green-600 border-green-600 text-white"
                      : index === currentStep
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </button>

                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ml-2 ${
                      index < currentStep ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-900">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentStepData.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Message d'erreur global */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-medium">Erreur</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu de l'étape courante */}
      <Card>
        <CardContent className="p-6">
          {/* Étape 1: Informations personnelles */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  error={errors.firstName}
                  placeholder="Votre prénom"
                />

                <Input
                  label="Nom *"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  error={errors.lastName}
                  placeholder="Votre nom"
                />

                <Input
                  label="Date de naissance *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    updateFormData("dateOfBirth", e.target.value)
                  }
                  error={errors.dateOfBirth}
                  max={new Date().toISOString().split("T")[0]} // Pas de date future
                />

                <div>
                  {formData.dateOfBirth && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Âge: {calculateAge(formData.dateOfBirth)} ans
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label="Téléphone *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  error={errors.phone}
                  placeholder="+221771234567"
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  error={errors.email}
                  placeholder="votre@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Région *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => updateFormData("region", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionnez une région</option>
                    {SENEGAL_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Ville *"
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  error={errors.city}
                  placeholder="Votre ville"
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>
            </div>
          )}

          {/* Étape 2: Type de plan */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de plan souhaité *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(PLAN_TYPES_LABELS) as InsurancePlanType[]).map(
                    (type) => (
                      <label
                        key={type}
                        className={`relative flex cursor-pointer rounded-lg border p-4 ${
                          formData.planType === type
                            ? "border-primary-600 bg-primary-50"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="planType"
                          value={type}
                          checked={formData.planType === type}
                          onChange={(e) =>
                            updateFormData(
                              "planType",
                              e.target.value as InsurancePlanType
                            )
                          }
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {PLAN_TYPES_LABELS[type]}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {type === "INDIVIDUAL" &&
                              "Couverture pour une personne"}
                            {type === "FAMILY" &&
                              "Couverture pour toute la famille"}
                            {type === "GROUP" && "Couverture de groupe"}
                            {type === "CORPORATE" && "Couverture d'entreprise"}
                          </p>
                        </div>
                        {formData.planType === type && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </label>
                    )
                  )}
                </div>
              </div>

              {formData.planType !== "INDIVIDUAL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de bénéficiaires *
                  </label>
                  <Input
                    type="number"
                    value={formData.beneficiariesCount}
                    onChange={(e) =>
                      updateFormData(
                        "beneficiariesCount",
                        parseInt(e.target.value) || 1
                      )
                    }
                    min="1"
                    max="10"
                    placeholder="Nombre de personnes à couvrir"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Vous inclus, nombre total de personnes à couvrir
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début souhaitée *
                </label>
                <Input
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={(e) =>
                    updateFormData("preferredStartDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]} // Pas de date passée
                />
              </div>
            </div>
          )}

          {/* Étape 3: Bénéficiaires */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {formData.planType === "INDIVIDUAL" ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Plan individuel
                  </h3>
                  <p className="text-gray-600">
                    Vous êtes le seul bénéficiaire de ce plan
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Bénéficiaires ({beneficiaries.length + 1}/
                      {formData.beneficiariesCount})
                    </h3>
                    {beneficiaries.length < formData.beneficiariesCount - 1 && (
                      <Button
                        onClick={addBeneficiary}
                        variant="outline"
                        size="sm"
                      >
                        Ajouter un bénéficiaire
                      </Button>
                    )}
                  </div>

                  {/* Demandeur principal */}
                  <Card className="border-primary-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-primary-600" />
                        <h4 className="font-medium text-gray-900">
                          Demandeur principal
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Liste des bénéficiaires */}
                  {beneficiaries.map((beneficiary, index) => (
                    <Card key={beneficiary.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Bénéficiaire {index + 2}
                          </h4>
                          <Button
                            onClick={() => removeBeneficiary(beneficiary.id)}
                            variant="outline"
                            size="sm"
                          >
                            Supprimer
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Prénom *"
                            type="text"
                            value={beneficiary.firstName}
                            onChange={(e) =>
                              updateBeneficiary(
                                beneficiary.id,
                                "firstName",
                                e.target.value
                              )
                            }
                            placeholder="Prénom du bénéficiaire"
                          />

                          <Input
                            label="Nom *"
                            type="text"
                            value={beneficiary.lastName}
                            onChange={(e) =>
                              updateBeneficiary(
                                beneficiary.id,
                                "lastName",
                                e.target.value
                              )
                            }
                            placeholder="Nom du bénéficiaire"
                          />

                          <Input
                            label="Date de naissance *"
                            type="date"
                            value={beneficiary.dateOfBirth}
                            onChange={(e) =>
                              updateBeneficiary(
                                beneficiary.id,
                                "dateOfBirth",
                                e.target.value
                              )
                            }
                            max={new Date().toISOString().split("T")[0]}
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Relation *
                            </label>
                            <select
                              value={beneficiary.relationship}
                              onChange={(e) =>
                                updateBeneficiary(
                                  beneficiary.id,
                                  "relationship",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="SPOUSE">Conjoint(e)</option>
                              <option value="CHILD">Enfant</option>
                              <option value="PARENT">Parent</option>
                              <option value="OTHER">Autre</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Étape 4: Informations médicales */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPreexistingConditions}
                    onChange={(e) =>
                      updateFormData(
                        "hasPreexistingConditions",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    J'ai des antécédents médicaux ou conditions préexistantes
                  </span>
                </label>
              </div>

              {formData.hasPreexistingConditions && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Conditions médicales courantes
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonConditions.map((condition) => (
                        <label
                          key={condition}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={conditions.includes(condition)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                addCondition(condition);
                              } else {
                                removeCondition(condition);
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">
                            {condition}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Autre condition médicale
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Décrivez votre condition"
                        onKeyDown={(e) =>
                          e.key === "Enter" && addCondition(newCondition)
                        }
                      />
                      <Button
                        onClick={() => addCondition(newCondition)}
                        variant="outline"
                        size="sm"
                        disabled={!newCondition.trim()}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Conditions sélectionnées */}
                  {conditions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conditions sélectionnées
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map((condition) => (
                          <span
                            key={condition}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                          >
                            {condition}
                            <button
                              onClick={() => removeCondition(condition)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes additionnelles (optionnel)
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    updateFormData("additionalNotes", e.target.value)
                  }
                  placeholder="Informations supplémentaires sur votre situation..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation */}
        <CardFooter className="flex items-center justify-between px-6 py-4 bg-gray-50">
          <Button
            onClick={onCancel || previousStep}
            variant="outline"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 0 ? "Annuler" : "Précédent"}</span>
          </Button>

          <div className="flex items-center space-x-3">
            {!canProceed && (
              <div className="flex items-center text-amber-600">
                <Info className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  Complétez tous les champs requis
                </span>
              </div>
            )}

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isLoading}
                variant="primary"
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isLoading ? "Envoi..." : "Envoyer la demande"}</span>
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <span>Continuer</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuoteForm;
