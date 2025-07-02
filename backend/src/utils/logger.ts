// ===================================================================
// FICHIER: /src/utils/logger.ts
// Logger Winston pour CareFlow
// ===================================================================

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Assurer que le dossier logs existe
const logsDir = path.join(process.cwd(), 'logs');

// Transport pour fichiers rotatifs
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'careflow-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  createSymlink: true,
  symlinkName: 'careflow-current.log',
});

// Transport pour erreurs
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'careflow-error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  createSymlink: true,
  symlinkName: 'careflow-error-current.log',
});

// Configuration du logger principal
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [fileRotateTransport, errorTransport],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// En développement, ajouter console
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Export par défaut et nommé
export { logger };
export default logger;
