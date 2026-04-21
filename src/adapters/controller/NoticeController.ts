import { Request, Response, Router } from "express";
import { NoticeImpl } from "../repositories/NoticeImpl";
import { UserImpl } from "../repositories/UserImpl";
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
  private userRepository: UserImpl;

  constructor() {
    this.noticeRepository = new NoticeImpl(AppDataSource);
    this.userRepository = new UserImpl(AppDataSource);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public/Logged-in user routes
    this.router.get("/", authMiddleware, this.getAllNotices.bind(this));
    this.router.get("/departments", authMiddleware, this.getDepartments.bind(this));
    this.router.get("/types", authMiddleware, this.getTypes.bind(this));
    
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

  async getDepartments(req: Request, res: Response, next: any) {
    try {
      const [noticeDepts, userDepts] = await Promise.all([
        this.noticeRepository.getDistinctDepartments(),
        this.userRepository.getDistinctDepartments()
      ]);
      
      const allDepts = Array.from(new Set([...noticeDepts, ...userDepts])).sort();
      
      res.status(200).json({
        ok: true,
        data: allDepts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTypes(req: Request, res: Response, next: any) {
    try {
      const result = await this.noticeRepository.getDistinctTypes();
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
      const { title, description, department, semester, type, expiryDate } = req.body;

      if (!title || !description || !department || !semester || !type || !expiryDate) {
        return res.status(400).json({
          ok: false,
          error: "Missing required fields",
        });
      }

      let pdfUrl = undefined;
      let pdfFileName = undefined;

      if (req.file) {
        pdfUrl = `/uploads/${req.file.filename}`;
        pdfFileName = req.file.originalname;
      }

      const noticeData = {
        title,
        description,
        department,
        semester,
        type,
        expiryDate,
        pdfUrl,
        pdfFileName,
        createdBy: req.user.id,
        createdByName: req.user.name || "Unknown User",
      };

      const usecase = new CreateNoticeUseCase(this.noticeRepository);
      const result = await usecase.execute(noticeData);

      return res.status(201).json({
        ok: true,
        data: result,
        message: "Notice created successfully",
      });
    } catch (error) {
      return next(error);
    }
  }

    async updateNotice(req: any, res: Response, next: any) {
      try {
        const noticeId = req.params.id;
        // Fetch existing notice to verify permissions
        const existingNotice = await this.noticeRepository.findById(noticeId);
        if (!existingNotice) {
          return res.status(404).json({ ok: false, error: "Notice not found" });
        }
        // Only the creator can edit
        if (existingNotice.createdBy !== req.user.id) {
          return res.status(403).json({ ok: false, error: "Forbidden: insufficient permissions" });
        }
        const { title, description, department, semester, type, expiryDate } = req.body;
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (department) updateData.department = department;
        if (semester) updateData.semester = semester;
        if (type) updateData.type = type;
        if (expiryDate) updateData.expiryDate = expiryDate;
        if (req.file) {
          updateData.pdfUrl = `/uploads/${req.file.filename}`;
          updateData.pdfFileName = req.file.originalname;
        }
        const usecase = new UpdateNoticeUseCase(this.noticeRepository);
        await usecase.execute(noticeId, updateData);
        return res.status(200).json({
          ok: true,
          message: "Notice updated successfully",
        });
      } catch (error) {
        return next(error);
      }
    }

  async deleteNotice(req: any, res: Response, next: any) {
    try {
      const noticeId = req.params.id;
      // Verify notice exists
      const existingNotice = await this.noticeRepository.findById(noticeId);
      if (!existingNotice) {
        return res.status(404).json({ ok: false, error: "Notice not found" });
      }
      // Only the creator can delete
      if (existingNotice.createdBy !== req.user.id) {
        return res.status(403).json({ ok: false, error: "Forbidden: insufficient permissions" });
      }
      const usecase = new DeleteNoticeUseCase(this.noticeRepository);
      await usecase.execute(noticeId);

      return res.status(200).json({
        ok: true,
        message: "Notice deleted successfully",
      });
    } catch (error) {
      return next(error);
    }
  }
}
