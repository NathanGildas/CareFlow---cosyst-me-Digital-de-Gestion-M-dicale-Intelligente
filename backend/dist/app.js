"use strict";
// ===================================================================
// FICHIER: /src/app.ts
// Application Express mise à jour avec toutes les nouvelles routes
// ===================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_1 = require("./utils/swagger");
const errorHandler_1 = require("./middlewares/errorHandler");
const logger_1 = require("./utils/logger");
// Import des routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const patients_1 = __importDefault(require("./routes/patients"));
const doctors_1 = __importDefault(require("./routes/doctors"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const referentials_1 = __importDefault(require("./routes/referentials"));
const establishments_1 = __importDefault(require("./routes/establishments"));
const insurance_1 = __importDefault(require("./routes/insurance"));
const app = (0, express_1.default)();
// ===================================================================
// MIDDLEWARES DE SÉCURITÉ ET PERFORMANCE
// ===================================================================
// Sécurité de base
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
// CORS configuré pour le développement et la production
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000', // React dev
            'http://localhost:5173', // Vite dev
            'https://careflow.sn', // Production frontend
            'https://app.careflow.sn', // Production app
        ];
        // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Non autorisé par la politique CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use((0, cors_1.default)(corsOptions));
// Compression des réponses
app.use((0, compression_1.default)());
// Parsing JSON et URL-encoded
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting global
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // 10000 requêtes par IP par fenêtre
    message: {
        success: false,
        message: 'Trop de requêtes de cette IP, réessayez dans 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
// Rate limiting spécifique pour l'authentification
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 tentatives de connexion max
    message: {
        success: false,
        message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
    },
});
// Logging des requêtes
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.logger.info(message.trim()) },
}));
// ===================================================================
// ROUTES DE BASE ET SANTÉ
// ===================================================================
// Health check endpoint
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: 'connected', // TODO: Ajouter vrai check DB
        redis: 'connected', // TODO: Ajouter vrai check Redis
    };
    res.status(200).json(healthCheck);
});
// Documentation API avec Swagger
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CareFlow Sénégal API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
    },
}));
// Endpoint de documentation API simple
app.get('/api', (req, res) => {
    res.json({
        name: 'CareFlow Sénégal API',
        version: '1.0.0',
        description: 'API complète pour la plateforme e-santé adaptée au contexte sénégalais',
        documentation: {
            swagger: '/api-docs',
            postman: '/api/postman-collection',
        },
        endpoints: {
            authentication: '/api/auth',
            users: '/api/users',
            patients: '/api/patients',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
            referentials: '/api/referentials',
            establishments: '/api/establishments',
        },
        features: [
            'Authentification JWT multi-rôles',
            'Gestion des patients, médecins, assureurs',
            'Système de rendez-vous médical',
            'Référentiels sénégalais complets',
            'Gestion des établissements de santé',
            'Intégration assurances locales',
            'API RESTful avec documentation Swagger',
        ],
        contact: {
            developer: 'Nathan Aklikokou',
            email: 'nathan@careflow.sn',
            github: 'https://github.com/careflow-senegal',
        },
    });
});
// ===================================================================
// ROUTES PRINCIPALES
// ===================================================================
// Routes d'authentification avec limitation de taux
app.use('/api/auth', authLimiter, auth_1.default);
// Routes des référentiels (accès public)
app.use('/api/referentials', referentials_1.default);
// Routes des établissements
app.use('/api/establishments', establishments_1.default);
// Routes utilisateurs (authentification requise)
app.use('/api/users', users_1.default);
app.use('/api/patients', patients_1.default);
app.use('/api/doctors', doctors_1.default);
app.use('/api/appointments', appointments_1.default);
// Routes des assurances (accès public)
app.use('/api/insurance', insurance_1.default);
// ===================================================================
// ROUTES UTILITAIRES SUPPLÉMENTAIRES
// ===================================================================
// Export collection Postman
app.get('/api/postman-collection', (req, res) => {
    const postmanCollection = {
        info: {
            name: 'CareFlow Sénégal API',
            description: 'Collection complète des endpoints CareFlow',
            version: '1.0.0',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        auth: {
            type: 'bearer',
            bearer: [
                {
                    key: 'token',
                    value: '{{jwt_token}}',
                    type: 'string',
                },
            ],
        },
        variable: [
            {
                key: 'baseUrl',
                value: 'http://localhost:4000',
                type: 'string',
            },
            {
                key: 'jwt_token',
                value: '',
                type: 'string',
            },
        ],
        item: [
            {
                name: 'Authentication',
                item: [
                    {
                        name: 'Register',
                        request: {
                            method: 'POST',
                            header: [
                                {
                                    key: 'Content-Type',
                                    value: 'application/json',
                                },
                            ],
                            body: {
                                mode: 'raw',
                                raw: JSON.stringify({
                                    email: 'test@example.com',
                                    password: 'password123',
                                    firstName: 'Test',
                                    lastName: 'User',
                                    phone: '+221771234567',
                                    role: 'PATIENT',
                                }, null, 2),
                            },
                            url: {
                                raw: '{{baseUrl}}/api/auth/register',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'auth', 'register'],
                            },
                        },
                    },
                    {
                        name: 'Login',
                        request: {
                            method: 'POST',
                            header: [
                                {
                                    key: 'Content-Type',
                                    value: 'application/json',
                                },
                            ],
                            body: {
                                mode: 'raw',
                                raw: JSON.stringify({
                                    email: 'test@example.com',
                                    password: 'password123',
                                }, null, 2),
                            },
                            url: {
                                raw: '{{baseUrl}}/api/auth/login',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'auth', 'login'],
                            },
                        },
                    },
                ],
            },
            {
                name: 'Referentials',
                item: [
                    {
                        name: 'Get Regions',
                        request: {
                            method: 'GET',
                            url: {
                                raw: '{{baseUrl}}/api/referentials/regions',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'referentials', 'regions'],
                            },
                        },
                    },
                    {
                        name: 'Get Medical Specialties',
                        request: {
                            method: 'GET',
                            url: {
                                raw: '{{baseUrl}}/api/referentials/medical-specialties',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'referentials', 'medical-specialties'],
                            },
                        },
                    },
                    {
                        name: 'Get Insurance Companies',
                        request: {
                            method: 'GET',
                            url: {
                                raw: '{{baseUrl}}/api/referentials/insurance-companies',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'referentials', 'insurance-companies'],
                            },
                        },
                    },
                ],
            },
            {
                name: 'Establishments',
                item: [
                    {
                        name: 'Search Establishments',
                        request: {
                            method: 'GET',
                            url: {
                                raw: '{{baseUrl}}/api/establishments?region=DAKAR&hasEmergency=true',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'establishments'],
                                query: [
                                    {
                                        key: 'region',
                                        value: 'DAKAR',
                                    },
                                    {
                                        key: 'hasEmergency',
                                        value: 'true',
                                    },
                                ],
                            },
                        },
                    },
                    {
                        name: 'Get Establishment Details',
                        request: {
                            method: 'GET',
                            url: {
                                raw: '{{baseUrl}}/api/establishments/{{establishment_id}}',
                                host: ['{{baseUrl}}'],
                                path: ['api', 'establishments', '{{establishment_id}}'],
                            },
                        },
                    },
                ],
            },
        ],
    };
    res.json(postmanCollection);
});
// Route pour les statistiques générales de l'API
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            uptime: process.uptime(),
            requests: {
                total: '~' + Math.floor(Math.random() * 10000), // Simulation
                today: '~' + Math.floor(Math.random() * 1000),
            },
            endpoints: {
                authentication: 4,
                referentials: 4,
                establishments: 6,
                users: 5,
                total: 19,
            },
            database: {
                status: 'connected',
                regions: 14,
                specialties: 12,
                insuranceCompanies: 5,
            },
        },
    });
});
// ===================================================================
// GESTION DES ERREURS
// ===================================================================
// Route 404 pour toutes les autres requêtes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} non trouvée`,
        availableEndpoints: {
            documentation: '/api-docs',
            health: '/health',
            api_info: '/api',
            authentication: '/api/auth',
            referentials: '/api/referentials',
            establishments: '/api/establishments',
        },
    });
});
// Middleware de gestion globale des erreurs
app.use(errorHandler_1.errorHandler);
// ===================================================================
// GESTION DES PROCESSUS
// ===================================================================
// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM reçu, arrêt gracieux du serveur...');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT reçu, arrêt gracieux du serveur...');
    process.exit(0);
});
// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Exception non capturée:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Promesse rejetée non gérée:', reason);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map