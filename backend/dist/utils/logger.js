"use strict";
// ===================================================================
// FICHIER: /src/utils/logger.ts
// Logger Winston pour CareFlow
// ===================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
// Configuration des formats
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
}));
// Assurer que le dossier logs existe
const logsDir = path_1.default.join(process.cwd(), 'logs');
// Transport pour fichiers rotatifs
const fileRotateTransport = new winston_daily_rotate_file_1.default({
    filename: path_1.default.join(logsDir, 'careflow-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    createSymlink: true,
    symlinkName: 'careflow-current.log',
});
// Transport pour erreurs
const errorTransport = new winston_daily_rotate_file_1.default({
    filename: path_1.default.join(logsDir, 'careflow-error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    createSymlink: true,
    symlinkName: 'careflow-error-current.log',
});
// Configuration du logger principal
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [fileRotateTransport, errorTransport],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});
exports.logger = logger;
// En développement, ajouter console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map