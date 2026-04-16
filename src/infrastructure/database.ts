import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { Logger } from "../shared/logger";
import { User } from "../adapters/models/User";
import { Notice } from "../adapters/models/Notice";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  synchronize: true, // Only for development; use migrations for production
  logging: false,
  entities: [User, Notice],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false, // Required for Supabase in many environments
  },
});

export async function initializeDataSource() {
  try {
    if (!AppDataSource.isInitialized) {
      Logger.info(`🔌 Attempting to connect to Supabase (PostgreSQL)...`);
      await AppDataSource.initialize();
      Logger.info(`✅ Database connection established successfully.`);
    }
  } catch (error) {
    Logger.error(`❌ Failed to initialize database connection: ${error}`);
    throw error;
  }
}
