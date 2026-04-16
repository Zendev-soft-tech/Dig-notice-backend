import bcrypt from "bcryptjs";
import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";

export class UpdatePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, otp: string, newPassword: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Double check OTP in this step to ensure security
    if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { 
      password: hashedPassword,
      otp: undefined,
      otpExpires: undefined
    });

    return { message: "Password updated successfully" };
  }
}
