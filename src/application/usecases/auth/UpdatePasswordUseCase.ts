import bcrypt from "bcryptjs";
import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../../../shared/error";
import { OTPStore } from "../../../shared/OTPStore";

export class UpdatePasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, otp: string, newPassword: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = OTPStore.verifyOTP(email, otp);
    if (!isValid) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { 
      password: hashedPassword
    });

    OTPStore.clearOTP(email);

    return { message: "Password updated successfully" };
  }
}
