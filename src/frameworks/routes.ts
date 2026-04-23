import { Express, Request, Response } from "express";
import { AuthController } from "../adapters/controller/AuthController";
import { UserController } from "../adapters/controller/UserController";
import { Logger } from "../shared/logger";
import { NoticeController } from "../adapters/controller/NoticeController";
import { UploadController } from "../adapters/controller/UploadController";

export default (app: Express) => {
  const authController = new AuthController();
  const noticeController = new NoticeController();
  const userController = new UserController();
  const uploadController = new UploadController();

  app.use("/api/auth", authController.router);
  app.use("/api/notices", noticeController.router);
  app.use("/api/users", userController.router);
  app.use("/api/upload", uploadController.router);

  Logger.info("✅ Routes registered successfully");

};
