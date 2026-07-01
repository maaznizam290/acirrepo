/**
 * utils/ConfigReader.ts
 * -----------------------------------------------------------------------
 * Provides convenient, typed access to:
 *  - the environment config (re-exported from config/env.ts)
 *  - static JSON test data (test-data/users.json etc.)
 *
 * Keeping this separate from config/env.ts lets utils/ stay
 * self-contained and gives step definitions a single import point
 * for "anything configuration or test-data related".
 * -----------------------------------------------------------------------
 */

import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';
import { Logger } from './Logger';

class ConfigReader {
  /** Re-exposes the frozen environment config object. */
  public get config() {
    return env;
  }

  /**
   * Reads and parses a JSON file from the test-data directory.
   * Generic so callers get type-safety on the returned shape.
   */
  public readTestData<T>(fileName: string): T {
    const filePath = path.resolve(__dirname, '..', 'test-data', fileName);

    if (!fs.existsSync(filePath)) {
      const message = `[ConfigReader] Test data file not found: ${filePath}`;
      Logger.error(message);
      throw new Error(message);
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (error) {
      Logger.error(`[ConfigReader] Failed to parse JSON test data file: ${fileName}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}

export const configReader = new ConfigReader();
