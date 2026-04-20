import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";
import { Logger } from "../../../shared/logger";
import { config } from "../../../config";
import { OTPStore } from "../../../shared/OTPStore";
import { sendOTPEmail } from "../../../infrastructure/emailService";

export class ForgotPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User with this email not found");
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + config.otpExpiryMinutes);

    OTPStore.setOTP(email, otp, expiry);

    // Send email
    await sendOTPEmail(email, otp);

    Logger.info(`[FORGOT_PASSWORD] OTP email sent for ${email}`);

    return { message: "OTP sent to your email" };
  }
}
