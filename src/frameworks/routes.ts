import { Express } from "express";
import { AuthController } from "../adapters/controller/AuthController";
import { UserController } from "../adapters/controller/UserController";
import { Logger } from "../shared/logger";
import { NoticeController } from "../adapters/controller/NoticeController";

export default (app: Express) => {
  const authController = new AuthController();
  const noticeController = new NoticeController();
  const userController = new UserController();

  app.use("/api/auth", authController.router);
  app.use("/api/notices", noticeController.router);
  app.use("/api/users", userController.router);

  Logger.info("✅ Routes registered successfully");

  // Health check route
  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true, message: "Server is healthy" });
  });
};
