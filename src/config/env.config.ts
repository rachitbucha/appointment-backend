import { Environment } from '@app/interface/environment.interface';
import dotenv from 'dotenv';

export class ConfigService {
  private static instance: ConfigService;

  private constructor() {
    dotenv.config();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  getEnv<K extends keyof Environment>(key: K, fallback?: Environment[K]): Environment[K] {
    const value = process.env[key] as Environment[K] | undefined;

    if (!value) {
      if (fallback) {
        return fallback;
      }
      throw new Error(`Missing environment variable: ${key}.`);
    }

    return value;
  }
}
