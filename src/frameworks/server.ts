import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { config } from "../config";
import { initializeDataSource } from "../infrastructure/database";
import { Logger } from "../shared/logger";
import { errorHandler, loggerMiddleware } from "./middleware";
import registerRoutes from "./routes";

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Custom Middleware
app.use(loggerMiddleware);

const startServer = async () => {
  try {
    // 1. Initialize Database
    await initializeDataSource();

    // 2. Register Routes
    registerRoutes(app);

    // 3. Global Error Handler (must be last)
    app.use(errorHandler);

    // 4. Start listening
    const PORT = config.port;
    app.listen(PORT, () => {
      Logger.info(`🚀 Server running in ${config.env} mode on port ${PORT}`);
    });
  } catch (error) {
    Logger.error(`💥 Server startup failed: ${error}`);
    process.exit(1);
  }
};

startServer();
