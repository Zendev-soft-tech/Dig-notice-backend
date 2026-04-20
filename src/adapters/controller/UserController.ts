import { Request, Response, Router } from "express";
import { UserImpl } from "../repositories/UserImpl";
import { AppDataSource } from "../../infrastructure/database";
import { GetAllUsersUseCase } from "../../application/usecases/users/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "../../application/usecases/users/GetUserByIdUseCase";
import { CreateUserUseCase } from "../../application/usecases/users/CreateUserUseCase";
import { UpdateUserUseCase } from "../../application/usecases/users/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../application/usecases/users/DeleteUserUseCase";
import { GetProfileUseCase } from "../../application/usecases/users/GetProfileUseCase";
import { UpdateProfileUseCase } from "../../application/usecases/users/UpdateProfileUseCase";
import { BulkCreateUserUseCase } from "../../application/usecases/users/BulkCreateUserUseCase";
import { SuccessResponse } from "../../frameworks/types";
import { authMiddleware, roleMiddleware } from "../../frameworks/middleware";

export class UserController {
  public router: Router = Router();
  private userRepository: UserImpl;

  constructor() {
    this.userRepository = new UserImpl(AppDataSource);

    // Profile routes (All authenticated users)
    this.router.get("/profile", authMiddleware, this.getProfileHandler.bind(this));
    this.router.put("/profile", authMiddleware, this.updateProfileHandler.bind(this));

    // Admin-only user management routes
    this.router.get("/", authMiddleware, roleMiddleware(["admin"]), this.getAllUsersHandler.bind(this));
    this.router.post("/bulk", authMiddleware, roleMiddleware(["admin"]), this.bulkCreateUserHandler.bind(this));
    this.router.get("/:id", authMiddleware, roleMiddleware(["admin"]), this.getUserByIdHandler.bind(this));
    this.router.post("/", authMiddleware, roleMiddleware(["admin"]), this.createUserHandler.bind(this));
    this.router.put("/:id", authMiddleware, roleMiddleware(["admin"]), this.updateUserHandler.bind(this));
    this.router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), this.deleteUserHandler.bind(this));
  }

  async getProfileHandler(req: any, res: Response, next: any) {
    try {
      const usecase = new GetProfileUseCase(this.userRepository);
      const result = await usecase.execute(req.user.id);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async updateProfileHandler(req: any, res: Response, next: any) {
    try {
      const { email } = req.body;
      const usecase = new UpdateProfileUseCase(this.userRepository);
      const result = await usecase.execute(req.user.id, email);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsersHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new GetAllUsersUseCase(this.userRepository);
      const result = await usecase.execute();

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async getUserByIdHandler(req: Request, res: Response, next: any) {
    try {
      const { id } = req.params;
      const usecase = new GetUserByIdUseCase(this.userRepository);
      const result = await usecase.execute(id);

      res.status(200).json({
        ok: true,
        data: result,
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async createUserHandler(req: Request, res: Response, next: any) {
    try {
      const usecase = new CreateUserUseCase(this.userRepository);
      const result = await usecase.execute(req.body);

      res.status(201).json({
        ok: true,
        data: result,
        message: "User created successfully"
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async bulkCreateUserHandler(req: Request, res: Response, next: any) {
    try {
      const usersData = req.body;
      if (!Array.isArray(usersData)) {
        return res.status(400).json({ ok: false, message: "Expected an array of users" });
      }

      const usecase = new BulkCreateUserUseCase(this.userRepository);
      const result = await usecase.execute(usersData);

      res.status(201).json({
        ok: true,
        data: result,
        message: `Bulk creation completed: ${result.successful} successful, ${result.failed} failed.`
      } as SuccessResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async updateUserHandler(req: Request, res: Response, next: any) {
    try {
      const { id } = req.params;
      const usecase = new UpdateUserUseCase(this.userRepository);
      await usecase.execute(id, req.body);

      res.status(200).json({
        ok: true,
        data: { id },
        message: "User updated successfully"
      } as SuccessResponse<any>);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserHandler(req: Request, res: Response, next: any) {
    try {
      const { id } = req.params;
      const usecase = new DeleteUserUseCase(this.userRepository);
      await usecase.execute(id);

      res.status(200).json({
        ok: true,
        data: { id },
        message: "User deleted successfully"
      } as SuccessResponse<any>);
    } catch (error) {
      next(error);
    }
  }
}
