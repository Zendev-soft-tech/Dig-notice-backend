import { Request, Response, Router } from "express";
import path from "path";
import { upload } from "../../infrastructure/multerConfig";
import { supabase } from "../../infrastructure/supabase";
import { AppError } from "../../shared/error";
import { Logger } from "../../shared/logger";

const UPLOAD_BUCKET = "uploads";

export class UploadController {
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", upload.single("file"), this.uploadFile.bind(this));
  }

  private buildUniqueFileName(file: Express.Multer.File): string {
    const sanitizedName = path
      .basename(file.originalname)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    return `${Date.now()}-${sanitizedName}`;
  }

  async uploadFile(req: Request, res: Response, next: any) {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded. Use field name 'file'.", 400);
      }

      const fileName = this.buildUniqueFileName(req.file);

      const { data: uploadedData, error: uploadError } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError || !uploadedData) {
        Logger.error(`Supabase upload failed: ${uploadError?.message || "Unknown error"}`);
        throw new AppError(uploadError?.message || "Failed to upload file", 500);
      }

      const { data: publicUrlData } = supabase.storage
        .from(UPLOAD_BUCKET)
        .getPublicUrl(uploadedData.path);

      let signedUrl: string | undefined;
      if (req.query.signed === "true") {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(UPLOAD_BUCKET)
          .createSignedUrl(uploadedData.path, 60 * 60);

        if (signedError) {
          throw new AppError(signedError.message, 500);
        }

        signedUrl = signedData.signedUrl;
      }

      return res.status(200).json({
        ok: true,
        data: {
          fileName,
          filePath: uploadedData.path,
          publicUrl: publicUrlData.publicUrl,
          signedUrl,
          // For private buckets, use signedUrl and keep bucket access private.
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
