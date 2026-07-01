/**
 * utils/Logger.ts
 * -----------------------------------------------------------------------
 * Centralized Winston logger.
 * - Logs to console (colorized) and to rotating-by-run log files.
 * - Provides a `step()` helper so step definitions log a consistent,
 *   readable trail of BDD actions (useful when debugging CI failures).
 * - Exposed as a singleton so every file shares the same transport
 *   configuration (DRY / Single Responsibility).
 * -----------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import { env } from '../config/env';

const LOG_DIR = path.resolve(__dirname, '..', 'reports', 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const timestampedFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
});

const baseLogger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    timestampedFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), timestampedFormat),
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'execution.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'errors.log'),
      level: 'error',
    }),
  ],
});

/**
 * Thin wrapper class so call sites read as `Logger.info(...)`,
 * `Logger.step(...)`, etc., instead of importing winston directly
 * everywhere. This isolates the logging implementation behind one
 * stable interface (Dependency Inversion-friendly).
 */
class FrameworkLogger {
  public info(message: string, meta?: Record<string, unknown>): void {
    baseLogger.info(message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    baseLogger.warn(message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    baseLogger.error(message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    baseLogger.debug(message, meta);
  }

  /**
   * Logs a discrete BDD/test action — prefixed for easy visual scanning
   * in CI logs, e.g. ">> STEP: Clicking Login button"
   */
  public step(message: string): void {
    baseLogger.info(`>> STEP: ${message}`);
  }
}

export const Logger = new FrameworkLogger();
