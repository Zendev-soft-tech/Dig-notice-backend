import { AppConfig } from "./index";
import { Logger } from "../shared/logger";

export default (): AppConfig => {
  Logger.info("📦 Loading system configurations from environment..");
  return {
    port: Number(process.env.PORT),
    env: process.env.NODE_ENV as string,
    frontendUrl: process.env.FRONTEND_URL || process.env.LOGIN_URL || 'https://digital-notice-board-8f09a.web.app',
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRE as string,
    },
    db: {
      host: process.env.DB_HOST as string,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      name: process.env.DB_NAME as string,
    },
    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES),
    upload: {
      path: process.env.UPLOAD_PATH as string,
      maxSize: Number(process.env.MAX_FILE_SIZE),
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
      from: process.env.SMTP_FROM_EMAIL || '"Digital Notice Board" <noreply@noticeboard.com>',
    }
  };
};
