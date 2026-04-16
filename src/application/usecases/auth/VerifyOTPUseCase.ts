import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class VerifyOTPUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.otp || user.otp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError("OTP has expired");
    }

    // Success, we could return a temporary token or just success
    return { success: true, message: "OTP verified" };
  }
}
