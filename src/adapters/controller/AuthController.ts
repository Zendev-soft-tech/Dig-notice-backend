import { Request, Response, Router } from "express";
import { UserImpl } from "../repositories/UserImpl";
import { AppDataSource } from "../../infrastructure/database";
import { LoginUseCase } from "../../application/usecases/auth/LoginUseCase";
import { ForgotPasswordUseCase } from "../../application/usecases/auth/ForgotPasswordUseCase";
import { VerifyOTPUseCase } from "../../application/usecases/auth/VerifyOTPUseCase";
import { UpdatePasswordUseCase } from "../../application/usecases/auth/UpdatePasswordUseCase";
import { ChangePasswordUseCase } from "../../application/usecases/users/ChangePasswordUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware } from "../../frameworks/middleware";

export class AuthController {
  public router: Router = Router();
  private userRepository: UserImpl;

  constructor() {
    this.userRepository = new UserImpl(AppDataSource);
    this.router.post("/login", this.loginHandler.bind(this));
    this.router.post("/forgot-password", this.forgotPasswordHandler.bind(this));
    this.router.post("/verify-otp", this.verifyOTPHandler.bind(this));
    this.router.post("/update-password", this.updatePasswordHandler.bind(this));
    this.router.post("/change-password", authMiddleware, this.changePasswordHandler.bind(this));
  }

  async loginHandler(req: Request, res: Response, next: any) {
    try {
      const { username, password } = req.body;
      const usecase = new LoginUseCase(this.userRepository);
      const result = await usecase.execute(username, password);

      res.status(200).json({
        ok: true,
        data: result,
        message: "Login successful"
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async forgotPasswordHandler(req: Request, res: Response, next: any) {
    try {
      const { email } = req.body;
      const usecase = new ForgotPasswordUseCase(this.userRepository);
      const result = await usecase.execute(email);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async verifyOTPHandler(req: Request, res: Response, next: any) {
    try {
      const { email, otp } = req.body;
      const usecase = new VerifyOTPUseCase(this.userRepository);
      const result = await usecase.execute(email, otp);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async updatePasswordHandler(req: Request, res: Response, next: any) {
    try {
      const { email, otp, newPassword } = req.body;
      const usecase = new UpdatePasswordUseCase(this.userRepository);
      const result = await usecase.execute(email, otp, newPassword);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async changePasswordHandler(req: any, res: Response, next: any) {
    try {
      const { currentPassword, newPassword } = req.body;
      const usecase = new ChangePasswordUseCase(this.userRepository);
      const result = await usecase.execute(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }
}
