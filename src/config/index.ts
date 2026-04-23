import dotenv from 'dotenv';
import defaultConfig from "./default";
import { Logger } from "../shared/logger";

dotenv.config();

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  name: string;
}

export interface AppConfig {
  port: number;
  env: string;
  frontendUrl: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  db: DBConfig;
  otpExpiryMinutes: number;
  upload: {
    maxSize: number;
  };
  supabase: {
    url: string;
    key: string;
    serviceRoleKey: string;
    bucket: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

export class Config {
  public static config: AppConfig | null = null;

  private static validate = (config: AppConfig): void => {
    const requiredVars = [
      { key: 'PORT', value: config.port },
      { key: 'NODE_ENV', value: config.env },
      { key: 'JWT_SECRET', value: config.jwt.secret },
      { key: 'JWT_EXPIRE', value: config.jwt.expiresIn },
      { key: 'DB_HOST', value: config.db.host },
      { key: 'DB_PORT', value: config.db.port },
      { key: 'DB_USER', value: config.db.user },
      { key: 'DB_NAME', value: config.db.name },
      { key: 'OTP_EXPIRY_MINUTES', value: config.otpExpiryMinutes },
      { key: 'MAX_FILE_SIZE', value: config.upload.maxSize },
      { key: 'SMTP_USER', value: config.smtp.user },
      { key: 'SMTP_PASS', value: config.smtp.pass },
      { key: 'SUPABASE_URL', value: config.supabase.url },
      { key: 'SUPABASE_ANON_KEY', value: config.supabase.key },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: config.supabase.serviceRoleKey },
      { key: 'SUPABASE_BUCKET', value: config.supabase.bucket },
    ];

    const missing = requiredVars
      .filter(v => v.value === undefined || v.value === null || v.value === '' || Number.isNaN(v.value))
      .map(v => v.key);

    if (missing.length > 0) {
      Logger.error(`❌ Missing or invalid environment variables: ${missing.join(', ')}`);
      Logger.error(`🛑 Process exiting due to configuration error.`);
      process.exit(1);
    }

    Logger.info("✅ Configuration validated successfully.");
  };

  private static load = (): AppConfig => {
    const loadedConfig = defaultConfig();
    Config.validate(loadedConfig);
    return loadedConfig;
  };

  static get = (): AppConfig => {
    if (!Config.config) {
      Config.config = this.load();
    }
    return Config.config;
  };
}

export const config = Config.get();
