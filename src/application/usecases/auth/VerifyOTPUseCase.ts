import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { OTPStore } from "../../../shared/OTPStore";

export class VerifyOTPUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, otp: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = OTPStore.verifyOTP(email, otp);
    if (!isValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    return { success: true, message: "OTP verified" };
  }
}
