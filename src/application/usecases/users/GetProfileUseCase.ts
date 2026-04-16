import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { NotFoundError } from "../../../shared/error";

export class GetProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    
    // Remove sensitive data
    const { password, otp, otpExpires, ...profile } = user;
    return profile;
  }
}
