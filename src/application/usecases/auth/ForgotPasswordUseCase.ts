import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";
import { Logger } from "../../../shared/logger";
import { config } from "../../../config";

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

    await this.userRepository.updateOTP(user.id, otp, expiry);

    // In a real app, send email here. For now, log it.
    Logger.info(`[FORGOT_PASSWORD] OTP for ${email}: ${otp} (Expires in ${config.otpExpiryMinutes} mins)`);

    return { message: "OTP sent to your email" };
  }
}
