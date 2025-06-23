// ===================================================================
// FICHIER: /src/utils/swagger.ts
// Configuration Swagger pour documentation APIs CareFlow
// ===================================================================

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CareFlow Sénégal API",
      version: "1.0.0",
      description:
        "API complète pour la plateforme e-santé CareFlow adaptée au contexte sénégalais",
      contact: {
        name: "Nathan Aklikokou",
        email: "nathan@careflow.sn",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Serveur de développement",
      },
      {
        url: "https://api.careflow.sn",
        description: "Serveur de production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT pour authentification",
        },
      },
      schemas: {
        // ===== SCHEMAS DE BASE =====
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            firstName: { type: "string", minLength: 2, maxLength: 100 },
            lastName: { type: "string", minLength: 2, maxLength: 100 },
            phone: { type: "string", pattern: "^\\+221[0-9]{8,9}$" },
            role: {
              type: "string",
              enum: ["PATIENT", "DOCTOR", "INSURER", "ADMIN"],
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ===== RÉFÉRENTIELS =====
        SenegalRegion: {
          type: "object",
          properties: {
            code: {
              type: "string",
              enum: [
                "DAKAR",
                "THIES",
                "SAINT_LOUIS",
                "DIOURBEL",
                "LOUGA",
                "TAMBACOUNDA",
                "KAOLACK",
                "ZIGUINCHOR",
                "FATICK",
                "KOLDA",
                "MATAM",
                "KAFFRINE",
                "KEDOUGOU",
                "SEDHIOU",
              ],
            },
            name: { type: "string" },
            population: { type: "integer" },
            area: { type: "number", description: "Superficie en km²" },
            capital: { type: "string" },
            departments: {
              type: "array",
              items: { type: "string" },
            },
          },
        },

        MedicalSpecialty: {
          type: "object",
          properties: {
            code: {
              type: "string",
              enum: [
                "MEDECINE_GENERALE",
                "PEDIATRIE",
                "GYNECOLOGIE_OBSTETRIQUE",
                "CHIRURGIE_GENERALE",
                "CARDIOLOGIE",
                "MALADIES_INFECTIEUSES",
                "MEDECINE_TROPICALE",
                "NEUROLOGIE",
                "DERMATOLOGIE",
                "OPHTALMOLOGIE",
                "SANTE_PUBLIQUE",
                "MEDECINE_TRADITIONNELLE",
              ],
            },
            name: { type: "string" },
            description: { type: "string" },
            consultationFee: {
              type: "object",
              properties: {
                min: { type: "integer" },
                max: { type: "integer" },
                currency: { type: "string", default: "FCFA" },
              },
            },
            category: {
              type: "string",
              enum: [
                "PRIMARY_CARE",
                "SPECIALIST",
                "SURGICAL",
                "TROPICAL",
                "PUBLIC_HEALTH",
                "TRADITIONAL",
              ],
            },
          },
        },

        InsuranceCompany: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            shortName: { type: "string" },
            type: {
              type: "string",
              enum: ["IPM", "MUTUELLE_SANTE", "ASSURANCE_PRIVEE", "CMU"],
            },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
            website: { type: "string", format: "uri" },
            headOfficeAddress: { type: "string" },
            regionsServed: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SenegalRegion/properties/code",
              },
            },
            isActive: { type: "boolean" },
          },
        },

        // ===== ÉTABLISSEMENTS =====
        Establishment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", minLength: 3, maxLength: 200 },
            type: {
              type: "string",
              enum: ["HOSPITAL", "CLINIC", "HEALTH_CENTER", "PRIVATE_PRACTICE"],
            },
            region: {
              $ref: "#/components/schemas/SenegalRegion/properties/code",
            },
            city: { type: "string" },
            address: { type: "string" },
            phone: { type: "string", pattern: "^\\+221[0-9]{8,9}$" },
            email: { type: "string", format: "email" },
            website: { type: "string", format: "uri" },
            description: { type: "string" },
            capacity: { type: "integer", minimum: 1 },
            hasEmergency: { type: "boolean" },
            hasMaternity: { type: "boolean" },
            hasICU: { type: "boolean" },
            languagesSpoken: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "FRANCAIS",
                  "WOLOF",
                  "PULAAR",
                  "SERER",
                  "MANDINKA",
                  "DIOLA",
                  "SONINKE",
                ],
              },
            },
            acceptedInsurances: {
              type: "array",
              items: { type: "string", format: "uuid" },
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ===== RÉPONSES STANDARDS =====
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", default: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: { type: "object" },
            },
          },
        },

        PaginationMeta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
            hasNextPage: { type: "boolean" },
            hasPrevPage: { type: "boolean" },
          },
        },
      },
    },

    // ===== TAGS POUR ORGANISATION =====
    tags: [
      {
        name: "Authentication",
        description: "Endpoints d'authentification et gestion utilisateurs",
      },
      {
        name: "Referentials",
        description:
          "APIs des référentiels sénégalais (régions, spécialités, etc.)",
      },
      {
        name: "Establishments",
        description: "Gestion des établissements de santé",
      },
      {
        name: "Patients",
        description: "Gestion des patients",
      },
      {
        name: "Doctors",
        description: "Gestion des médecins",
      },
      {
        name: "Appointments",
        description: "Système de rendez-vous médicaux",
      },
    ],

    // ===== DÉFINITION DES PATHS =====
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check du serveur",
          description: "Vérifie l'état de santé de l'API",
          responses: {
            "200": {
              description: "Serveur opérationnel",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "OK" },
                      timestamp: { type: "string", format: "date-time" },
                      uptime: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Inscription d'un nouvel utilisateur",
          description: "Créer un compte utilisateur avec rôle spécifique",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "email",
                    "password",
                    "firstName",
                    "lastName",
                    "role",
                  ],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                    firstName: { type: "string", minLength: 2 },
                    lastName: { type: "string", minLength: 2 },
                    phone: { type: "string", pattern: "^\\+221[0-9]{8,9}$" },
                    role: {
                      type: "string",
                      enum: ["PATIENT", "DOCTOR", "INSURER"],
                      description: "ADMIN réservé aux administrateurs système",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Utilisateur créé avec succès",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              user: { $ref: "#/components/schemas/User" },
                              token: { type: "string" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "400": {
              description: "Données invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Email déjà utilisé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Connexion utilisateur",
          description: "Authentification avec email et mot de passe",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Connexion réussie",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              user: { $ref: "#/components/schemas/User" },
                              token: { type: "string" },
                              refreshToken: { type: "string" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description: "Identifiants invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      "/api/referentials/regions": {
        get: {
          tags: ["Referentials"],
          summary: "Liste des régions du Sénégal",
          description:
            "Récupère toutes les régions sénégalaises avec informations démographiques",
          parameters: [
            {
              name: "search",
              in: "query",
              description:
                "Recherche textuelle dans nom, capitale ou départements",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              description: "Nombre maximum de résultats",
              required: false,
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 20,
              },
            },
          ],
          responses: {
            "200": {
              description: "Liste des régions",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/SenegalRegion",
                            },
                          },
                          meta: {
                            type: "object",
                            properties: {
                              total: { type: "integer" },
                              filtered: { type: "integer" },
                              returned: { type: "integer" },
                              search: { type: "string" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },

      "/api/referentials/medical-specialties": {
        get: {
          tags: ["Referentials"],
          summary: "Spécialités médicales adaptées au Sénégal",
          description:
            "Liste des spécialités médicales avec tarifs et catégories",
          responses: {
            "200": {
              description: "Liste des spécialités médicales",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/MedicalSpecialty",
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },

      "/api/referentials/insurance-companies": {
        get: {
          tags: ["Referentials"],
          summary: "Compagnies d'assurance sénégalaises",
          description:
            "Liste des organismes d'assurance avec filtres par type et région",
          parameters: [
            {
              name: "type",
              in: "query",
              description: "Type d'assurance",
              required: false,
              schema: {
                type: "string",
                enum: ["IPM", "MUTUELLE_SANTE", "ASSURANCE_PRIVEE", "CMU"],
              },
            },
            {
              name: "region",
              in: "query",
              description: "Région servie",
              required: false,
              schema: {
                $ref: "#/components/schemas/SenegalRegion/properties/code",
              },
            },
            {
              name: "search",
              in: "query",
              description: "Recherche par nom",
              required: false,
              schema: { type: "string" },
            },
            {
              name: "limit",
              in: "query",
              description: "Limite de résultats",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            },
          ],
          responses: {
            "200": {
              description: "Liste des compagnies d'assurance",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              $ref: "#/components/schemas/InsuranceCompany",
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },

      "/api/establishments": {
        get: {
          tags: ["Establishments"],
          summary: "Recherche d'établissements de santé",
          description: "Recherche et filtrage d'établissements avec pagination",
          parameters: [
            {
              name: "region",
              in: "query",
              description: "Filtrer par région",
              required: false,
              schema: {
                $ref: "#/components/schemas/SenegalRegion/properties/code",
              },
            },
            {
              name: "type",
              in: "query",
              description: "Type d'établissement",
              required: false,
              schema: {
                type: "string",
                enum: [
                  "HOSPITAL",
                  "CLINIC",
                  "HEALTH_CENTER",
                  "PRIVATE_PRACTICE",
                ],
              },
            },
            {
              name: "specialty",
              in: "query",
              description: "Spécialité médicale disponible",
              required: false,
              schema: {
                $ref: "#/components/schemas/MedicalSpecialty/properties/code",
              },
            },
            {
              name: "search",
              in: "query",
              description: "Recherche textuelle",
              required: false,
              schema: { type: "string", minLength: 2 },
            },
            {
              name: "hasEmergency",
              in: "query",
              description: "Avec service d'urgence",
              required: false,
              schema: { type: "boolean" },
            },
            {
              name: "hasMaternity",
              in: "query",
              description: "Avec maternité",
              required: false,
              schema: { type: "boolean" },
            },
            {
              name: "hasICU",
              in: "query",
              description: "Avec soins intensifs",
              required: false,
              schema: { type: "boolean" },
            },
            {
              name: "acceptsInsurance",
              in: "query",
              description: "Accepte cette assurance (ID)",
              required: false,
              schema: { type: "string", format: "uuid" },
            },
            {
              name: "page",
              in: "query",
              description: "Numéro de page",
              required: false,
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              name: "limit",
              in: "query",
              description: "Éléments par page",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
            },
            {
              name: "sortBy",
              in: "query",
              description: "Trier par",
              required: false,
              schema: {
                type: "string",
                enum: ["name", "capacity", "region", "type", "createdAt"],
                default: "name",
              },
            },
            {
              name: "sortOrder",
              in: "query",
              description: "Ordre de tri",
              required: false,
              schema: {
                type: "string",
                enum: ["asc", "desc"],
                default: "asc",
              },
            },
          ],
          responses: {
            "200": {
              description: "Liste des établissements trouvés",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "array",
                            items: {
                              allOf: [
                                { $ref: "#/components/schemas/Establishment" },
                                {
                                  properties: {
                                    specialtiesAvailable: {
                                      type: "array",
                                      items: { type: "string" },
                                    },
                                    stats: {
                                      type: "object",
                                      properties: {
                                        totalDoctors: { type: "integer" },
                                        totalAppointments: { type: "integer" },
                                        averageRating: { type: "number" },
                                      },
                                    },
                                  },
                                },
                              ],
                            },
                          },
                          pagination: {
                            $ref: "#/components/schemas/PaginationMeta",
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "400": {
              description: "Paramètres de recherche invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },

        post: {
          tags: ["Establishments"],
          summary: "Créer un nouvel établissement",
          description: "Création d'établissement (Admin/Insurer uniquement)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "name",
                    "type",
                    "region",
                    "city",
                    "address",
                    "phone",
                  ],
                  properties: {
                    name: { type: "string", minLength: 3, maxLength: 200 },
                    type: {
                      type: "string",
                      enum: [
                        "HOSPITAL",
                        "CLINIC",
                        "HEALTH_CENTER",
                        "PRIVATE_PRACTICE",
                      ],
                    },
                    region: {
                      $ref: "#/components/schemas/SenegalRegion/properties/code",
                    },
                    city: { type: "string", minLength: 2, maxLength: 100 },
                    address: { type: "string", minLength: 5, maxLength: 500 },
                    phone: { type: "string", pattern: "^\\+221[0-9]{8,9}$" },
                    email: { type: "string", format: "email" },
                    website: { type: "string", format: "uri" },
                    description: { type: "string", maxLength: 1000 },
                    capacity: { type: "integer", minimum: 1 },
                    hasEmergency: { type: "boolean", default: false },
                    hasMaternity: { type: "boolean", default: false },
                    hasICU: { type: "boolean", default: false },
                    languagesSpoken: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: [
                          "FRANCAIS",
                          "WOLOF",
                          "PULAAR",
                          "SERER",
                          "MANDINKA",
                          "DIOLA",
                          "SONINKE",
                        ],
                      },
                    },
                    acceptedInsurances: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Établissement créé avec succès",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: { $ref: "#/components/schemas/Establishment" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "400": {
              description: "Données invalides",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "403": {
              description: "Permissions insuffisantes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Établissement déjà existant",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },

      "/api/establishments/{id}": {
        get: {
          tags: ["Establishments"],
          summary: "Détails d'un établissement",
          description: "Récupère les informations complètes d'un établissement",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de l'établissement",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Détails de l'établissement",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            allOf: [
                              { $ref: "#/components/schemas/Establishment" },
                              {
                                properties: {
                                  doctors: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        id: { type: "string", format: "uuid" },
                                        mainSpecialty: { type: "string" },
                                        user: {
                                          type: "object",
                                          properties: {
                                            firstName: { type: "string" },
                                            lastName: { type: "string" },
                                          },
                                        },
                                      },
                                    },
                                  },
                                  acceptedInsuranceDetails: {
                                    type: "array",
                                    items: {
                                      $ref: "#/components/schemas/InsuranceCompany",
                                    },
                                  },
                                  statistics: {
                                    type: "object",
                                    properties: {
                                      totalDoctors: { type: "integer" },
                                      specialtiesCount: { type: "object" },
                                      appointmentStats: { type: "object" },
                                      occupancyRate: { type: "number" },
                                      averageWaitTime: { type: "integer" },
                                      patientSatisfaction: { type: "number" },
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "404": {
              description: "Établissement non trouvé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },

        put: {
          tags: ["Establishments"],
          summary: "Modifier un établissement",
          description: "Mise à jour des informations d'établissement",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de l'établissement",
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", minLength: 3, maxLength: 200 },
                    description: { type: "string", maxLength: 1000 },
                    phone: { type: "string", pattern: "^\\+221[0-9]{8,9}$" },
                    email: { type: "string", format: "email" },
                    website: { type: "string", format: "uri" },
                    capacity: { type: "integer", minimum: 1 },
                    hasEmergency: { type: "boolean" },
                    hasMaternity: { type: "boolean" },
                    hasICU: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Établissement mis à jour",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: { $ref: "#/components/schemas/Establishment" },
                        },
                      },
                    ],
                  },
                },
              },
            },
            "403": {
              description: "Permissions insuffisantes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Établissement non trouvé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },

        delete: {
          tags: ["Establishments"],
          summary: "Supprimer un établissement",
          description: "Désactivation d'établissement (Admin uniquement)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID de l'établissement",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Établissement désactivé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiResponse" },
                },
              },
            },
            "403": {
              description: "Permissions insuffisantes",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Établissement non trouvé",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Impossible de supprimer (contraintes métier)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const specs = swaggerJsdoc(options);
export { swaggerUi };
