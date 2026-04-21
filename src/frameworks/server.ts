import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { networkInterfaces } from "os";
import { config, AppConfig } from "../config";
import { initializeDataSource } from "../infrastructure/database";
import { Logger } from "../shared/logger";
import { errorHandler, loggerMiddleware } from "./middleware";
import registerRoutes from "./routes";

const app = express();

let isAppReady = false;
let resolveAppReady: () => void;
const appReadyPromise = new Promise<void>((resolve) => {
  resolveAppReady = resolve;
});

// Health check endpoint - available immediately
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// Readiness Probe Middleware to delay early requests during cold starts
app.use(async (req, res, next) => {
  if (req.path === "/health" || isAppReady) {
    return next();
  }
  try {
    await appReadyPromise;
    next();
  } catch (err) {
    next(err);
  }
});

// Standard Middleware
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.frontendUrl,
        "https://digital-notice-board-8f09a.web.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Custom Middleware
app.use(loggerMiddleware);

// Function to get local IP address
const getLocalIPAddress = (): string => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netInterface = nets[name];
    if (!netInterface) continue;
    for (const net of netInterface) {
      const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
      if (net.family === familyV4Value && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
};

const startHTTPServer = async (config: AppConfig) => {
  Logger.info("🚀 Starting server process...");
  const localIP = getLocalIPAddress();
  const PORT = config.port;

  // Start the HTTP server FIRST so the container listens immediately
  const server = app.listen(PORT, "0.0.0.0", () => {
    Logger.info(`🚀 Server listening on http://0.0.0.0:${PORT}`);
    Logger.info(`📱 Local access: http://localhost:${PORT}`);
    Logger.info(`📱 Network access: http://${localIP}:${PORT}`);
    Logger.info(`💚 Health check available at http://0.0.0.0:${PORT}/health`);
  });

  // Handle server errors
  server.on("error", (error: any) => {
    Logger.error(`❌ Server error: ${error}`);
    if (error.code === "EADDRINUSE") {
      Logger.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });

  // Initialize DB after server is listening (non-blocking for health checks)
  try {
    await initializeDataSource();
    Logger.info("✅ Database initialized");
  } catch (err: any) {
    Logger.error(`❌ Database initialization failed: ${err}`);
    Logger.error("⚠️  Server is running but database is not connected");
  }

  // Initialize Routes
  try {
    registerRoutes(app);
    Logger.info("✅ Routes initialized");
  } catch (err: any) {
    Logger.error(`❌ Route initialization failed: ${err}`);
  } finally {
    isAppReady = true;
    resolveAppReady();
  }

  // Global Error Handler (must be last)
  app.use(errorHandler);
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  Logger.error(`❌ Uncaught Exception: ${error.message}`);
  Logger.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  Logger.error(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  Logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

// Start the server
startHTTPServer(config).catch((error) => {
  Logger.error(`❌ Failed to start server: ${error}`);
  process.exit(1);
});
