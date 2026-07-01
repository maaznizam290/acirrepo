/**
 * config/env.ts
 * -----------------------------------------------------------------------
 * Centralized, strongly-typed environment configuration.
 * Loads variables from .env (via dotenv) and exposes a single immutable
 * `env` object so that no other file in the framework calls
 * `process.env` directly. This keeps configuration access consistent,
 * testable, and easy to refactor (Single Responsibility Principle).
 * -----------------------------------------------------------------------
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export type SupportedEnv = 'qa' | 'staging' | 'prod';
export type SupportedBrowser = 'chromium' | 'firefox' | 'webkit' | 'edge';

/**
 * Reads a required environment variable.
 * Throws a descriptive error early (fail-fast) instead of letting
 * `undefined` silently propagate into test logic.
 */
function getRequired(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `[ConfigError] Missing required environment variable "${key}". ` +
        `Please set it in your .env file (see .env.example for reference).`
    );
  }
  return value;
}

function getOptional(key: string, fallback: string): string {
  const value = process.env[key];
  return value === undefined || value.trim() === '' ? fallback : value;
}

function getNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getBoolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === 'true';
}

const activeEnv = getOptional('ENV', 'qa').toLowerCase() as SupportedEnv;

/**
 * Resolves environment-specific values based on the active ENV.
 * Credentials are intentionally NOT logged or printed anywhere.
 */
function resolveEnvSpecificConfig(envName: SupportedEnv) {
  const prefix = envName.toUpperCase();
  return {
    baseUrl: getRequired(`${prefix}_BASE_URL`),
    email: getRequired(`${prefix}_EMAIL`),
    password: getRequired(`${prefix}_PASSWORD`),
  };
}

const envSpecific = resolveEnvSpecificConfig(activeEnv);

export const env = Object.freeze({
  activeEnv,
  baseUrl: envSpecific.baseUrl,
  credentials: Object.freeze({
    email: envSpecific.email,
    password: envSpecific.password,
  }),

  browser: getOptional('BROWSER', 'chromium') as SupportedBrowser,
  headless: getBoolean('HEADLESS', true),
  slowMo: getNumber('SLOW_MO', 0),

  timeouts: Object.freeze({
    default: getNumber('DEFAULT_TIMEOUT', 30000),
    action: getNumber('ACTION_TIMEOUT', 15000),
    navigation: getNumber('NAVIGATION_TIMEOUT', 30000),
  }),

  retryCount: getNumber('RETRY_COUNT', 1),

  testData: Object.freeze({
    customerName: getOptional('SEARCH_CUSTOMER_NAME', 'Hiba'),
    product1: getOptional('SEARCH_PRODUCT_1', 'Apple'),
    product1Qty: getNumber('SEARCH_PRODUCT_1_QTY', 6),
    product2: getOptional('SEARCH_PRODUCT_2', 'Aproten'),
    product2Qty: getNumber('SEARCH_PRODUCT_2_QTY', 7),
  }),

  logLevel: getOptional('LOG_LEVEL', 'info'),
});

export type AppEnv = typeof env;
