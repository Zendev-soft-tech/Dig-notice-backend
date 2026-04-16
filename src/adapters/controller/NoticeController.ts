import { Request, Response, Router } from "express";
import { NoticeImpl } from "../repositories/NoticeImpl";
import { AppDataSource } from "../../infrastructure/database";
import { GetNoticesUseCase } from "../../application/usecases/notices/GetNoticesUseCase";
import { GetMyNoticesUseCase } from "../../application/usecases/notices/GetMyNoticesUseCase";
import { CreateNoticeUseCase } from "../../application/usecases/notices/CreateNoticeUseCase";
import { UpdateNoticeUseCase } from "../../application/usecases/notices/UpdateNoticeUseCase";
import { DeleteNoticeUseCase } from "../../application/usecases/notices/DeleteNoticeUseCase";
import { authMiddleware, roleMiddleware } from "../../frameworks/middleware";
import { upload } from "../../infrastructure/multerConfig";
import { SuccessResponse } from "../../frameworks/types";
import { config } from "../../config";

export class NoticeController {
  public router: Router = Router();
  private noticeRepository: NoticeImpl;

  constructor() {
    this.noticeRepository = new NoticeImpl(AppDataSource);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public/Logged-in user routes
    this.router.get("/", authMiddleware, this.getAllNotices.bind(this));
    
    // Auth + Role routes
    this.router.get("/my-notices", authMiddleware, roleMiddleware(["admin", "staff"]), this.getMyNotices.bind(this));
    this.router.post("/", authMiddleware, roleMiddleware(["admin", "staff"]), upload.single("file"), this.createNotice.bind(this));
    this.router.put("/:id", authMiddleware, roleMiddleware(["admin", "staff"]), upload.single("file"), this.updateNotice.bind(this));
    this.router.delete("/:id", authMiddleware, roleMiddleware(["admin", "staff"]), this.deleteNotice.bind(this));
  }

  async getAllNotices(req: Request, res: Response, next: any) {
    try {
      const { department, semester } = req.query;
      const usecase = new GetNoticesUseCase(this.noticeRepository);
      const result = await usecase.execute(department as string, semester as string);

      res.status(200).json({
        ok: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyNotices(req: any, res: Response, next: any) {
    try {
      const usecase = new GetMyNoticesUseCase(this.noticeRepository);
      const result = await usecase.execute(req.user.id);

      res.status(200).json({
        ok: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createNotice(req: any, res: Response, next: any) {
    try {
      let pdfUrl = undefined;
      let pdfFileName = undefined;

      if (req.file) {
        pdfUrl = `/uploads/${req.file.filename}`;
        pdfFileName = req.file.originalname;
      }

      const noticeData = {
        ...req.body,
        pdfUrl,
        pdfFileName,
        createdBy: req.user.id,
        createdByName: req.user.name || "Unknown User",
      };

      const usecase = new CreateNoticeUseCase(this.noticeRepository);
      const result = await usecase.execute(noticeData);

      res.status(201).json({
        ok: true,
        data: result,
        message: "Notice created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNotice(req: any, res: Response, next: any) {
    try {
      const noticeId = req.params.id;
      const updateData = { ...req.body };

      if (req.file) {
        updateData.pdfUrl = `/uploads/${req.file.filename}`;
        updateData.pdfFileName = req.file.originalname;
      }

      const usecase = new UpdateNoticeUseCase(this.noticeRepository);
      await usecase.execute(noticeId, updateData);

      res.status(200).json({
        ok: true,
        message: "Notice updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotice(req: Request, res: Response, next: any) {
    try {
      const noticeId = req.params.id;
      const usecase = new DeleteNoticeUseCase(this.noticeRepository);
      await usecase.execute(noticeId);

      res.status(200).json({
        ok: true,
        message: "Notice deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
